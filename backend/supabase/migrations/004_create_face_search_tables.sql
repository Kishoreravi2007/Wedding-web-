-- Create tables for face search functionality
-- This migration sets up the database schema for storing event photos and face embeddings

-- Create event_photos table to store photo metadata
CREATE TABLE IF NOT EXISTS event_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    face_count INTEGER DEFAULT 0,
    face_embeddings JSONB, -- Store face descriptors as JSON array
    metadata JSONB, -- Additional photo metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create face_matches table to store search results and analytics
CREATE TABLE IF NOT EXISTS face_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query_photo_id UUID REFERENCES event_photos(id),
    matched_photo_id UUID REFERENCES event_photos(id),
    similarity_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    confidence_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    search_session_id VARCHAR(100), -- Track search sessions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create face_search_sessions table to track search analytics
CREATE TABLE IF NOT EXISTS face_search_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    query_face_descriptor JSONB, -- Store the query face descriptor
    total_photos_searched INTEGER DEFAULT 0,
    matches_found INTEGER DEFAULT 0,
    search_duration_ms INTEGER,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_created_at ON event_photos(created_at);
CREATE INDEX IF NOT EXISTS idx_face_matches_query_photo ON face_matches(query_photo_id);
CREATE INDEX IF NOT EXISTS idx_face_matches_matched_photo ON face_matches(matched_photo_id);
CREATE INDEX IF NOT EXISTS idx_face_matches_similarity ON face_matches(similarity_score);
CREATE INDEX IF NOT EXISTS idx_face_search_sessions_event_id ON face_search_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_face_search_sessions_created_at ON face_search_sessions(created_at);

-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-photos',
    'event-photos',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for event_photos table
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to event photos
CREATE POLICY "Allow public read access to event photos" ON event_photos
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to insert event photos
CREATE POLICY "Allow authenticated users to insert event photos" ON event_photos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update event photos
CREATE POLICY "Allow authenticated users to update event photos" ON event_photos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete event photos
CREATE POLICY "Allow authenticated users to delete event photos" ON event_photos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for face_matches table
ALTER TABLE face_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to face matches
CREATE POLICY "Allow public read access to face matches" ON face_matches
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to insert face matches
CREATE POLICY "Allow authenticated users to insert face matches" ON face_matches
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for face_search_sessions table
ALTER TABLE face_search_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to search sessions
CREATE POLICY "Allow public read access to face search sessions" ON face_search_sessions
    FOR SELECT USING (true);

-- Policy: Allow public insert access to search sessions (for analytics)
CREATE POLICY "Allow public insert access to face search sessions" ON face_search_sessions
    FOR INSERT WITH CHECK (true);

-- Create storage policies for event-photos bucket
CREATE POLICY "Allow public read access to event photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-photos');

CREATE POLICY "Allow authenticated users to upload event photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'event-photos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update event photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'event-photos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to delete event photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'event-photos' 
        AND auth.role() = 'authenticated'
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_event_photos_updated_at 
    BEFORE UPDATE ON event_photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample event photos (for testing)
INSERT INTO event_photos (event_id, filename, storage_path, file_size, mime_type, width, height, face_count)
VALUES 
    ('wedding-event', 'sample-photo-1.jpg', 'wedding-event/sample-photo-1.jpg', 1024000, 'image/jpeg', 1920, 1080, 2),
    ('wedding-event', 'sample-photo-2.jpg', 'wedding-event/sample-photo-2.jpg', 856000, 'image/jpeg', 1280, 720, 1),
    ('wedding-event', 'sample-photo-3.jpg', 'wedding-event/sample-photo-3.jpg', 2048000, 'image/jpeg', 2560, 1440, 3)
ON CONFLICT DO NOTHING;

-- Create view for face search analytics
CREATE OR REPLACE VIEW face_search_analytics AS
SELECT 
    s.event_id,
    COUNT(s.id) as total_searches,
    AVG(s.matches_found) as avg_matches_per_search,
    AVG(s.search_duration_ms) as avg_search_duration_ms,
    COUNT(DISTINCT s.session_id) as unique_searchers,
    MAX(s.created_at) as last_search_time
FROM face_search_sessions s
GROUP BY s.event_id;

-- Create view for popular photos (most matched)
CREATE OR REPLACE VIEW popular_photos AS
SELECT 
    p.id,
    p.event_id,
    p.filename,
    p.storage_path,
    COUNT(fm.id) as match_count,
    AVG(fm.similarity_score) as avg_similarity,
    MAX(fm.created_at) as last_matched
FROM event_photos p
LEFT JOIN face_matches fm ON p.id = fm.matched_photo_id
GROUP BY p.id, p.event_id, p.filename, p.storage_path
ORDER BY match_count DESC, avg_similarity DESC;

-- Grant permissions
GRANT SELECT ON face_search_analytics TO anon, authenticated;
GRANT SELECT ON popular_photos TO anon, authenticated;
