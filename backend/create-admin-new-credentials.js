const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { supabase } = require('./lib/supabase');

async function createAdmin() {
    const email = 'kishore@weddingweb.co.in';
    const password = 'Kishore@2007';

    console.log(`🔐 Creating Admin User: ${email}`);

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check env vars.');
        process.exit(1);
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check availability
        const { data: existing } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${email},email.eq.${email}`)
            .maybeSingle();

        if (existing) {
            console.log('⚠️ User already exists. Updating password...');
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    password: hashedPassword,
                    role: 'admin',
                    email: email,
                    username: email // Ensure username matches email for this case
                })
                .eq('id', existing.id);

            if (updateError) throw updateError;
            console.log('✅ User updated successfully.');
        } else {
            console.log('✨ Creating new user...');
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    username: email,
                    email: email,
                    password: hashedPassword,
                    role: 'admin',
                    is_active: true
                }]);

            if (insertError) throw insertError;
            console.log('✅ User created successfully.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createAdmin();
