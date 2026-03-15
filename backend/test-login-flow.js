const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// We need the ANON key, but it's not in backend/.env directly sometimes.
// It's usually standard, let's use the one from vendor-portal.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloanJjcmN4em12d3JxY21mZ2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTEzOTAsImV4cCI6MjA4NTE4NzM5MH0.ZdxLoHDURXCaYV4QlN4bo12optX6j3WyDaA3HcMyWvU';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const email = `testvendor${Date.now()}@example.com`;
  const password = 'password123!';
  
  console.log('1. Creating user:', email);
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'vendor', full_name: 'Test Vendor' }
  });
  
  if (createError) {
    console.error('Create error:', createError);
    return;
  }
  console.log('User created successfully:', createData.user.id);
  
  console.log('\n2. Attempting login...');
  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (loginError) {
    console.error('Login error:', loginError);
  } else {
    console.log('Login successful! Session:', loginData.session ? 'Valid' : 'Invalid');
  }
}

testLogin();
