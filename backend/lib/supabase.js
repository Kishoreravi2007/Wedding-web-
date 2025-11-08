/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client.
 * Shared by server.js and other modules to avoid circular dependencies.
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Prefer service role key for backend operations (bypasses RLS)
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

let supabase = null;

// Initialize Supabase client only if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log(`✅ Supabase client initialized using ${supabaseServiceKey ? 'service role' : 'anon'} key`);
} else {
  console.warn('⚠️  Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variables.');
}

module.exports = { supabase };

