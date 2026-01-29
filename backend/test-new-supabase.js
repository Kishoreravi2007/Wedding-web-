const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ihjrcrcxzmvwrqcmfgam.supabase.co';
const supabaseKey = 'sb_publishable_tEfZHj4UYp0JAMpR-kggBg_7';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase connection to:', supabaseUrl);
    try {
        // Attempt to select from weddings
        const { data, error } = await supabase.from('weddings').select('*').limit(1);
        if (error) {
            console.error('❌ Supabase error:', error);
        } else {
            console.log('✅ Connection successful! Data:', data);
        }
    } catch (err) {
        console.error('❌ Fetch failed or other error:', err);
    }
}

test();
