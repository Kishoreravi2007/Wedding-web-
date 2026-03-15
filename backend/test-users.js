require('dotenv').config();
const { supabase } = require('./lib/supabase');

async function testLogin() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  console.log('Total users:', data.users.length);
  const recent = data.users.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  console.log('Recent users:', recent.map(v => ({ 
    email: v.email, 
    created: v.created_at, 
    metadata: v.user_metadata 
  })));
}

testLogin();
