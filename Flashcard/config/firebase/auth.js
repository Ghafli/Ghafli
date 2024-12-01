import { auth } from './config';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';

export const authService = {
    // Register a new user
    async register(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });
            return userCredential.user;
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    },

    // Sign in existing user
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    },

    // Sign out user
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    },

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    }
};
