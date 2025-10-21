const { supabase } = require('./server');

async function fixRLS() {
  try {
    console.log('🔧 Fixing Row Level Security policies...');
    
    // Disable RLS temporarily to allow user registration
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.log('Note: Could not disable RLS via API, this is expected.');
      console.log('Please run this SQL in your Supabase dashboard:');
      console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('Or create a more permissive policy:');
      console.log('DROP POLICY IF EXISTS "Users can view their own profile." ON users;');
      console.log('DROP POLICY IF EXISTS "Users can update their own profile." ON users;');
      console.log('CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);');
    } else {
      console.log('✅ RLS disabled successfully');
    }
    
  } catch (error) {
    console.error('❌ Error fixing RLS:', error.message);
  }
}

fixRLS();
