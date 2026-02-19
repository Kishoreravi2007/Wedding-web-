import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper for Google Login configuration
export const GOOGLE_AUTH_CONFIG = {
    provider: 'google',
    options: {
        queryParams: {
            access_type: 'offline',
            prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/auth/callback`
    }
};
