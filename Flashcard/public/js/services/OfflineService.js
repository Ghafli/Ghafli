import { db, auth } from '../../config/firebase';
import { 
    doc, 
    setDoc, 
    updateDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { openDB } from 'idb';

class OfflineService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.dbName = 'flashcard-offline-db';
        this.dbVersion = 1;
        this.initializeDB();
        this.setupNetworkListeners();
    }

    /**
     * Initialize IndexedDB
     */
    async initializeDB() {
        this.db = await openDB(this.dbName, this.dbVersion, {
            upgrade(db) {
                // Store for offline flashcard data
                if (!db.objectStoreNames.contains('flashcards')) {
                    db.createObjectStore('flashcards', { keyPath: 'id' });
                }
                // Store for pending changes
                if (!db.objectStoreNames.contains('pendingChanges')) {
                    db.createObjectStore('pendingChanges', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                }
                // Store for study progress
                if (!db.objectStoreNames.contains('studyProgress')) {
                    db.createObjectStore('studyProgress', { keyPath: 'cardId' });
                }
            }
        });
    }

    /**
     * Setup network status listeners
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Handle online event
     */
    async handleOnline() {
        console.log('Connection restored. Syncing data...');
        await this.syncPendingChanges();
        
        // Register for background sync if supported
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            try {
                await registration.sync.register('sync-flashcards');
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
        }
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('Connection lost. Switching to offline mode...');
        // Notify user about offline mode
        this.showOfflineNotification();
    }

    /**
     * Show offline mode notification
     */
    showOfflineNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Offline Mode', {
                body: 'You are now in offline mode. Changes will be synced when connection is restored.',
                icon: '/icons/offline-icon.png'
            });
        }
    }

    /**
     * Save flashcard data for offline use
     * @param {Object} flashcard - Flashcard data
     */
    async saveFlashcardOffline(flashcard) {
        try {
            await this.db.put('flashcards', {
                ...flashcard,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving flashcard offline:', error);
            throw error;
        }
    }

    /**
     * Get offline flashcard data
     * @param {string} cardId - Flashcard ID
     */
    async getOfflineFlashcard(cardId) {
        try {
            return await this.db.get('flashcards', cardId);
        } catch (error) {
            console.error('Error getting offline flashcard:', error);
            throw error;
        }
    }

    /**
     * Save study progress offline
     * @param {Object} progress - Study progress data
     */
    async saveProgressOffline(progress) {
        try {
            await this.db.put('studyProgress', {
                ...progress,
                timestamp: new Date().toISOString(),
                synced: false
            });

            // Store pending change
            await this.storePendingChange({
                type: 'progress',
                data: progress,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving progress offline:', error);
            throw error;
        }
    }

    /**
     * Store pending change for sync
     * @param {Object} change - Change data
     */
    async storePendingChange(change) {
        try {
            await this.db.add('pendingChanges', {
                ...change,
                userId: this.currentUser.uid
            });
        } catch (error) {
            console.error('Error storing pending change:', error);
            throw error;
        }
    }

    /**
     * Sync pending changes with Firebase
     */
    async syncPendingChanges() {
        try {
            const tx = this.db.transaction('pendingChanges', 'readwrite');
            const store = tx.objectStore('pendingChanges');
            const changes = await store.getAll();

            for (const change of changes) {
                try {
                    await this.syncChange(change);
                    await store.delete(change.id);
                } catch (error) {
                    console.error('Error syncing change:', error);
                }
            }

            await tx.complete;
        } catch (error) {
            console.error('Error syncing pending changes:', error);
            throw error;
        }
    }

    /**
     * Sync individual change with Firebase
     * @param {Object} change - Change to sync
     */
    async syncChange(change) {
        switch (change.type) {
            case 'progress':
                await this.syncProgressChange(change.data);
                break;
            case 'flashcard':
                await this.syncFlashcardChange(change.data);
                break;
            default:
                console.warn('Unknown change type:', change.type);
        }
    }

    /**
     * Sync progress change with Firebase
     * @param {Object} progress - Progress data
     */
    async syncProgressChange(progress) {
        const progressRef = doc(db, 'progress', `${this.currentUser.uid}_${progress.cardId}`);
        await setDoc(progressRef, {
            ...progress,
            synced: true,
            syncedAt: serverTimestamp()
        }, { merge: true });
    }

    /**
     * Sync flashcard change with Firebase
     * @param {Object} flashcard - Flashcard data
     */
    async syncFlashcardChange(flashcard) {
        const flashcardRef = doc(db, 'flashcards', flashcard.id);
        await updateDoc(flashcardRef, {
            ...flashcard,
            lastSynced: serverTimestamp()
        });
    }

    /**
     * Check if offline data is available
     * @returns {Promise<boolean>} Whether offline data is available
     */
    async hasOfflineData() {
        try {
            const flashcardCount = await this.db.count('flashcards');
            return flashcardCount > 0;
        } catch (error) {
            console.error('Error checking offline data:', error);
            return false;
        }
    }

    /**
     * Clear offline data
     */
    async clearOfflineData() {
        try {
            await this.db.clear('flashcards');
            await this.db.clear('studyProgress');
            await this.db.clear('pendingChanges');
        } catch (error) {
            console.error('Error clearing offline data:', error);
            throw error;
        }
    }
}

export default OfflineService;
