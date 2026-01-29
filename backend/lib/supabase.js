
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('📡 Initializing Supabase client...');
console.log('🔗 URL:', supabaseUrl);
console.log('🔑 Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key missing in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client created');

module.exports = { supabase };
