/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client.
 * Shared by server.js and other modules to avoid circular dependencies.
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase client only if credentials are available
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️  Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

module.exports = { supabase };

