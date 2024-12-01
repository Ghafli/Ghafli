import { initializeApp } from '@firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from '@firebase/auth';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    update 
} from '@firebase/database';

class FirebaseService {
    constructor() {
        // Initialize Firebase with environment variables
        const firebaseConfig = {
            apiKey: process.env.VITE_FIREBASE_API_KEY,
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.VITE_FIREBASE_APP_ID
        };

        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);
        this.currentUser = null;

        // Listen for auth state changes
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            if (user) {
                this.updateLastLogin(user.uid);
            }
        });
    }

    // Auth Methods
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await this.initializeUserData(userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // User Data Methods
    async initializeUserData(userId) {
        try {
            const userData = {
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                settings: {
                    theme: 'light',
                    notifications: true,
                    studyReminders: true
                }
            };
            await set(ref(this.db, `users/${userId}`), userData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateLastLogin(userId) {
        try {
            await update(ref(this.db, `users/${userId}`), {
                lastLogin: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    // Flashcard Methods
    async saveFlashcard(flashcardData) {
        if (!this.currentUser) throw new Error('No user signed in');
        try {
            const { deckId, front, back } = flashcardData;
            const flashcardRef = ref(this.db, `flashcards/${this.currentUser.uid}/${deckId}`);
            const newFlashcard = {
                front,
                back,
                createdAt: new Date().toISOString(),
                lastReviewed: null,
                repetitions: 0,
                easeFactor: 2.5,
                interval: 0
            };
            await set(flashcardRef, newFlashcard);
            return newFlashcard;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getFlashcards(deckId) {
        if (!this.currentUser) throw new Error('No user signed in');
        try {
            const snapshot = await get(ref(this.db, `flashcards/${this.currentUser.uid}/${deckId}`));
            return snapshot.val() || {};
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Progress Methods
    async saveProgress(progressData) {
        if (!this.currentUser) throw new Error('No user signed in');
        try {
            const { flashcardId, correct, timeSpent } = progressData;
            await set(ref(this.db, `progress/${this.currentUser.uid}/${flashcardId}`), {
                correct,
                timeSpent,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            throw this.handleError(error);
        }
    }

    onProgressUpdate(callback) {
        if (!this.currentUser) throw new Error('No user signed in');
        const progressRef = ref(this.db, `progress/${this.currentUser.uid}`);
        onValue(progressRef, (snapshot) => {
            callback(snapshot.val() || {});
        });
    }

    // Error Handler
    handleError(error) {
        console.error('Firebase Error:', error);
        return {
            code: error.code,
            message: error.message
        };
    }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
