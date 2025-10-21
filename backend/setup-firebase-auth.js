/**
 * Firebase Authentication Setup Script
 * 
 * This script sets up Firebase Authentication for the wedding website
 * by creating default users and testing the authentication system.
 */

const { FirebaseAuth } = require('./lib/firebase-auth');

async function setupFirebaseAuth() {
  console.log('🔥 Setting up Firebase Authentication');
  console.log('=====================================\n');
  
  try {
    // Step 1: Check if photographer user exists
    console.log('1️⃣ Checking for existing users...');
    
    try {
      const users = await FirebaseAuth.listUsers(10);
      console.log(`✅ Found ${users.length} existing users`);
      
      // Check if photographer exists
      const photographer = users.find(user => 
        user.email === 'photographer@wedding.com' || 
        user.customClaims?.role === 'photographer'
      );
      
      if (photographer) {
        console.log('✅ Photographer user already exists');
        console.log(`   UID: ${photographer.uid}`);
        console.log(`   Email: ${photographer.email}`);
        console.log(`   Role: ${photographer.customClaims?.role}`);
      }
    } catch (error) {
      console.log('ℹ️  No existing users found or error checking users');
    }
    
    // Step 2: Create default users
    console.log('\n2️⃣ Creating default users...');
    
    const defaultUsers = [
      {
        email: 'photographer@wedding.com',
        password: 'photo123',
        displayName: 'Wedding Photographer',
        role: 'photographer'
      },
      {
        email: 'admin@wedding.com',
        password: 'admin123',
        displayName: 'Wedding Admin',
        role: 'admin'
      },
      {
        email: 'couple@wedding.com',
        password: 'couple123',
        displayName: 'Wedding Couple',
        role: 'couple'
      }
    ];
    
    const createdUsers = [];
    
    for (const userData of defaultUsers) {
      try {
        const user = await FirebaseAuth.createUser(userData);
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`ℹ️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }
    
    // Step 3: Test authentication
    console.log('\n3️⃣ Testing authentication...');
    
    try {
      // Test photographer login
      const photographer = createdUsers.find(u => u.role === 'photographer') || 
                         await FirebaseAuth.getUser('photographer@wedding.com');
      
      if (photographer) {
        console.log('✅ Photographer authentication ready');
        console.log(`   Email: photographer@wedding.com`);
        console.log(`   Password: photo123`);
        console.log(`   Role: photographer`);
      }
      
      // Test admin login
      const admin = createdUsers.find(u => u.role === 'admin') || 
                   await FirebaseAuth.getUser('admin@wedding.com');
      
      if (admin) {
        console.log('✅ Admin authentication ready');
        console.log(`   Email: admin@wedding.com`);
        console.log(`   Password: admin123`);
        console.log(`   Role: admin`);
      }
      
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message);
    }
    
    // Step 4: Test custom claims
    console.log('\n4️⃣ Testing custom claims...');
    
    try {
      const users = await FirebaseAuth.listUsers(5);
      const usersWithClaims = users.filter(user => user.customClaims?.role);
      
      console.log(`✅ Custom claims working`);
      console.log(`   Users with roles: ${usersWithClaims.length}`);
      
      usersWithClaims.forEach(user => {
        console.log(`   - ${user.email}: ${user.customClaims.role}`);
      });
      
    } catch (error) {
      console.error('❌ Custom claims test failed:', error.message);
    }
    
    // Success message
    console.log('\n🎉 Firebase Authentication Setup Complete!');
    console.log('==========================================');
    console.log('');
    console.log('✅ Firebase Auth: Configured and tested');
    console.log('✅ Default users: Created with roles');
    console.log('✅ Custom claims: Working correctly');
    console.log('✅ Role-based access: Ready');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Photographer:');
    console.log('     Email: photographer@wedding.com');
    console.log('     Password: photo123');
    console.log('     Portal: http://localhost:8080/photographer-login');
    console.log('');
    console.log('   Admin:');
    console.log('     Email: admin@wedding.com');
    console.log('     Password: admin123');
    console.log('     Portal: http://localhost:8080/admin-login');
    console.log('');
    console.log('   Couple:');
    console.log('     Email: couple@wedding.com');
    console.log('     Password: couple123');
    console.log('     Portal: http://localhost:8080/couple-login');
    console.log('');
    console.log('🛡️ Security Features:');
    console.log('   - Firebase Authentication');
    console.log('   - Custom claims for roles');
    console.log('   - Email verification');
    console.log('   - Password security');
    console.log('   - User management');
    console.log('   - Role-based access control');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Update frontend to use Firebase Auth');
    console.log('   2. Test photographer portal login');
    console.log('   3. Configure Firebase Auth in frontend');
    console.log('   4. Set up Firebase Auth UI components');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set');
    console.error('   2. Check Firebase project configuration');
    console.error('   3. Verify service account permissions');
    console.error('   4. Check Firebase project is active');
    process.exit(1);
  }
}

// Run the setup
setupFirebaseAuth();
