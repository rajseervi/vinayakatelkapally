// Script to create an admin user directly in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Your Firebase config from src/firebase/config.js
const firebaseConfig = {
    apiKey: "AIzaSyA1VycFroqQHyzdvfnCGvzXZNcPyMIgZe4",
    authDomain: "vinakya-traders.firebaseapp.com",
    projectId: "vinakya-traders",
    storageBucket: "vinakya-traders.firebasestorage.app",
    messagingSenderId: "932825914270",
    appId: "1:932825914270:web:722002ec8abdd274a1948f"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user details - CHANGE THESE VALUES
const adminEmail = "pranavreddyvfx@gmail.com";
const adminPassword = "Hanuman@12345";
const adminFirstName = "Admin";
const adminLastName = "Mas";

async function createAdminUser() {
  try {
    console.log(`Creating admin user with email: ${adminEmail}`);
    
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    
    const userId = userCredential.user.uid;
    console.log(`User created with ID: ${userId}`);
    
    // Create user document in Firestore with admin role and active status
    await setDoc(doc(db, 'users', userId), {
      firstName: adminFirstName,
      lastName: adminLastName,
      name: `${adminFirstName} ${adminLastName}`,
      email: adminEmail,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      approvalStatus: {
        isApproved: true,
        approvedBy: 'system',
        approvedAt: new Date().toISOString(),
        notes: 'Initial admin user'
      },
      subscription: {
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        plan: 'admin'
      }
    });
    
    console.log('Admin user created successfully!');
    console.log('You can now log in with these credentials.');
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.log('An account with this email already exists. Try a different email or use the Firebase console to update an existing user to admin role.');
    }
  }
}

createAdminUser();