require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key missing in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase connection to:', supabaseUrl);
    try {
        const { data, error } = await supabase.from('weddings').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase error:', error);
        } else {
            console.log('✅ Connection successful. Row count:', data);
        }
    } catch (err) {
        console.error('❌ Fetch failed or other error:', err);
    }
}

test();
