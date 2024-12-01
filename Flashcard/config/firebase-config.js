// Firebase configuration
const firebaseConfig = {
  // TODO: Replace with your Firebase project configuration
  apiKey: "YOUR_API_KEY",
  authDomain: "flashcardapp.firebaseapp.com",
  projectId: "flashcardapp",
  storageBucket: "flashcardapp.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
