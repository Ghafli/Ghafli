import { db } from './config';
import { 
    ref,
    set,
    get,
    update,
    remove,
    query,
    orderByChild,
    equalTo
} from 'firebase/database';

export const databaseService = {
    // Flashcard operations
    async createFlashcard(userId, cardData) {
        const cardRef = ref(db, `users/${userId}/flashcards/${cardData.id}`);
        await set(cardRef, {
            ...cardData,
            created_at: Date.now()
        });
    },

    async getFlashcard(userId, cardId) {
        const cardRef = ref(db, `users/${userId}/flashcards/${cardId}`);
        const snapshot = await get(cardRef);
        return snapshot.val();
    },

    async updateFlashcard(userId, cardId, updates) {
        const cardRef = ref(db, `users/${userId}/flashcards/${cardId}`);
        await update(cardRef, updates);
    },

    async deleteFlashcard(userId, cardId) {
        const cardRef = ref(db, `users/${userId}/flashcards/${cardId}`);
        await remove(cardRef);
    },

    // Progress tracking
    async updateProgress(userId, cardId, progressData) {
        const progressRef = ref(db, `users/${userId}/progress/${cardId}`);
        await set(progressRef, {
            ...progressData,
            last_reviewed: Date.now()
        });
    },

    async getProgress(userId, cardId) {
        const progressRef = ref(db, `users/${userId}/progress/${cardId}`);
        const snapshot = await get(progressRef);
        return snapshot.val();
    },

    // Shared decks
    async createSharedDeck(deckData) {
        const deckRef = ref(db, `shared_decks/${deckData.id}`);
        await set(deckRef, {
            ...deckData,
            created_at: Date.now()
        });
    },

    async getSharedDeck(deckId) {
        const deckRef = ref(db, `shared_decks/${deckId}`);
        const snapshot = await get(deckRef);
        return snapshot.val();
    }
};
