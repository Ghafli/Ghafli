import { 
    auth,
    firestoreDb 
} from '../config/firebase';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

import {
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';

class AuthService {
    // Register new user
    async register(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            await setDoc(doc(firestoreDb, 'users', user.uid), {
                ...userData,
                email,
                createdAt: new Date().toISOString()
            });
            
            return user;
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    // Sign in user
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    // Sign out user
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    // Get current user profile
    async getCurrentUserProfile() {
        const user = auth.currentUser;
        if (!user) return null;

        const userDoc = await getDoc(doc(firestoreDb, 'users', user.uid));
        return userDoc.exists() ? userDoc.data() : null;
    }

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    }
}

export const authService = new AuthService();
