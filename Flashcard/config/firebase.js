// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "your_api_key",
    authDomain: "your_auth_domain",
    databaseURL: "your_database_url",
    projectId: "your_project_id",
    storageBucket: "your_storage_bucket",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const realtimeDb = getDatabase(app);
const firestoreDb = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

// Export initialized services
export {
    app,
    auth,
    realtimeDb,
    firestoreDb,
    storage,
    messaging
};
