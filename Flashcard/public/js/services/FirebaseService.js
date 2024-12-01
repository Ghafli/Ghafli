import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    push,
    update,
    remove 
} from 'firebase/database';

class FirebaseService {
    constructor() {
        this.firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            databaseURL: process.env.FIREBASE_DATABASE_URL
        };

        this.app = initializeApp(this.firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);
        this.currentUser = null;

        // Set up auth state listener
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
        });
    }

    // Authentication Methods
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await this.initializeUserData(userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // User Data Methods
    async initializeUserData(userId) {
        const userData = {
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            progress: {},
            settings: {
                theme: 'light',
                notifications: true,
                studyReminders: true
            }
        };

        await set(ref(this.db, `users/${userId}`), userData);
    }

    // Flashcard Methods
    async createFlashcard(deckId, flashcardData) {
        if (!this.currentUser) throw new Error('No user signed in');

        const flashcardRef = push(ref(this.db, `flashcards/${this.currentUser.uid}/${deckId}`));
        const newFlashcard = {
            ...flashcardData,
            createdAt: new Date().toISOString(),
            lastReviewed: null,
            repetitions: 0,
            easeFactor: 2.5,
            interval: 0
        };

        await set(flashcardRef, newFlashcard);
        return flashcardRef.key;
    }

    async getFlashcards(deckId) {
        if (!this.currentUser) throw new Error('No user signed in');

        const snapshot = await get(ref(this.db, `flashcards/${this.currentUser.uid}/${deckId}`));
        return snapshot.val() || {};
    }

    // Progress Tracking Methods
    async updateProgress(flashcardId, progressData) {
        if (!this.currentUser) throw new Error('No user signed in');

        const updates = {
            [`progress/${this.currentUser.uid}/${flashcardId}`]: {
                ...progressData,
                timestamp: new Date().toISOString()
            }
        };

        await update(ref(this.db), updates);
    }

    async getProgress() {
        if (!this.currentUser) throw new Error('No user signed in');

        const snapshot = await get(ref(this.db, `progress/${this.currentUser.uid}`));
        return snapshot.val() || {};
    }

    // Study Session Methods
    async startStudySession(deckId) {
        if (!this.currentUser) throw new Error('No user signed in');

        const sessionRef = push(ref(this.db, `studySessions/${this.currentUser.uid}`));
        const session = {
            deckId,
            startTime: new Date().toISOString(),
            endTime: null,
            cardsReviewed: 0,
            correct: 0,
            incorrect: 0
        };

        await set(sessionRef, session);
        return sessionRef.key;
    }

    async updateStudySession(sessionId, sessionData) {
        if (!this.currentUser) throw new Error('No user signed in');

        await update(ref(this.db, `studySessions/${this.currentUser.uid}/${sessionId}`), sessionData);
    }

    // Settings Methods
    async updateSettings(settings) {
        if (!this.currentUser) throw new Error('No user signed in');

        await update(ref(this.db, `users/${this.currentUser.uid}/settings`), settings);
    }

    async getSettings() {
        if (!this.currentUser) throw new Error('No user signed in');

        const snapshot = await get(ref(this.db, `users/${this.currentUser.uid}/settings`));
        return snapshot.val() || {};
    }

    // Real-time Listeners
    onProgressChange(callback) {
        if (!this.currentUser) throw new Error('No user signed in');

        const progressRef = ref(this.db, `progress/${this.currentUser.uid}`);
        return onValue(progressRef, (snapshot) => {
            callback(snapshot.val() || {});
        });
    }

    onSettingsChange(callback) {
        if (!this.currentUser) throw new Error('No user signed in');

        const settingsRef = ref(this.db, `users/${this.currentUser.uid}/settings`);
        return onValue(settingsRef, (snapshot) => {
            callback(snapshot.val() || {});
        });
    }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
