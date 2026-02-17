export interface DashboardStats {
    total_photos: number;
    total_people: number;
    total_wishes: number;
    storage_used_mb: number;
    total_weddings?: number; // From analytics or count of weddings
    pending_feedback?: number;
}

export interface Wedding {
    id: number;
    wedding_code: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string; // ISO date string
    status: 'active' | 'upcoming' | 'archived' | 'past';
    theme_color: string;
    package_type: string;
    storage_usage?: number; // Calculated on frontend or detailed stats
    photo_count?: number;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject?: string;
    phone?: string;
    event_date?: string;
    guest_count?: number;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    response?: string;
    created_at: string;
}

export interface PlatformSettings {
    brand_name: string;
    support_email: string;
    company_url: string;
    enable_photo_booth: boolean;
    enable_face_match: boolean;
    enable_live_stream: boolean;
    maintenance_mode: boolean;
}
