import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyA1VycFroqQHyzdvfnCGvzXZNcPyMIgZe4",
    authDomain: "vinakya-traders.firebaseapp.com",
    projectId: "vinakya-traders",
    storageBucket: "vinakya-traders.firebasestorage.app",
    messagingSenderId: "932825914270",
    appId: "1:932825914270:web:722002ec8abdd274a1948f"

};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development environment
if (process.env.NODE_ENV === 'development') {
  try {
    // Use emulators if available
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Connected to Firebase emulators');
    }
  } catch (error) {
    console.error('Failed to connect to Firebase emulators:', error);
  }
}

export { db, auth };