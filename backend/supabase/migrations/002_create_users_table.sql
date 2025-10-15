CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own profile
CREATE POLICY "Users can view their own profile." ON users
FOR SELECT USING (auth.uid() = id);

-- Policy for authenticated users to update their own profile
CREATE POLICY "Users can update their own profile." ON users
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy for admins to manage all users (if an admin role is implemented)
-- This assumes you have a 'role' column in your auth.users table or a separate 'profiles' table linked to auth.users
-- For now, we'll keep it simple. If you implement an admin role, you'd adjust this.
-- Example for admin role:
-- CREATE POLICY "Admins can manage all users." ON users
-- FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'admin'));
