import { db, auth } from '../../config/firebase';
import { 
    doc, 
    updateDoc, 
    getDoc, 
    query, 
    where, 
    getDocs,
    collection,
    Timestamp 
} from 'firebase/firestore';

class SpacedRepetitionService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.flashcardsRef = collection(db, 'flashcards');
    }

    /**
     * SuperMemo 2 Algorithm Implementation
     * @param {number} quality - Response quality (0-5)
     * @param {number} repetitions - Number of consecutive correct responses
     * @param {number} easeFactor - Current ease factor
     * @param {number} interval - Current interval in days
     * @returns {Object} New spaced repetition parameters
     */
    calculateNextReview(quality, repetitions, easeFactor, interval) {
        // Quality ratings:
        // 5: Perfect response
        // 4: Correct response after a hesitation
        // 3: Correct response with serious difficulty
        // 2: Incorrect response; easy to remember when answered
        // 1: Incorrect response; remembered the correct answer
        // 0: Complete blackout

        // If quality is less than 3, start over
        if (quality < 3) {
            return {
                repetitions: 0,
                easeFactor: Math.max(1.3, easeFactor - 0.2),
                interval: 1,
                nextReview: this.calculateNextReviewDate(1)
            };
        }

        // Update ease factor
        let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor is 1.3

        // Calculate new interval
        let newInterval;
        if (repetitions === 0) {
            newInterval = 1; // First successful review: 1 day
        } else if (repetitions === 1) {
            newInterval = 6; // Second successful review: 6 days
        } else {
            newInterval = Math.round(interval * newEaseFactor); // Subsequent reviews
        }

        return {
            repetitions: repetitions + 1,
            easeFactor: newEaseFactor,
            interval: newInterval,
            nextReview: this.calculateNextReviewDate(newInterval)
        };
    }

    /**
     * Calculate the next review date based on interval
     * @param {number} interval - Interval in days
     * @returns {Timestamp} Firebase timestamp for next review
     */
    calculateNextReviewDate(interval) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);
        nextDate.setHours(0, 0, 0, 0);
        return Timestamp.fromDate(nextDate);
    }

    /**
     * Update flashcard with new spaced repetition parameters
     * @param {string} cardId - Flashcard ID
     * @param {number} quality - Response quality (0-5)
     */
    async updateCardProgress(cardId, quality) {
        try {
            const cardRef = doc(this.flashcardsRef, cardId);
            const cardDoc = await getDoc(cardRef);

            if (!cardDoc.exists()) {
                throw new Error('Card not found');
            }

            const cardData = cardDoc.data();
            const newProgress = this.calculateNextReview(
                quality,
                cardData.repetitions || 0,
                cardData.easeFactor || 2.5,
                cardData.interval || 1
            );

            await updateDoc(cardRef, {
                ...newProgress,
                lastReviewed: Timestamp.now(),
                totalReviews: (cardData.totalReviews || 0) + 1,
                qualityHistory: [...(cardData.qualityHistory || []), quality]
            });

            return newProgress;
        } catch (error) {
            console.error('Error updating card progress:', error);
            throw error;
        }
    }

    /**
     * Get all cards due for review
     * @returns {Promise<Array>} Array of due flashcards
     */
    async getDueCards() {
        try {
            const now = Timestamp.now();
            const q = query(
                this.flashcardsRef,
                where('userId', '==', this.currentUser.uid),
                where('nextReview', '<=', now)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching due cards:', error);
            throw error;
        }
    }

    /**
     * Get card learning progress statistics
     * @param {string} cardId - Flashcard ID
     * @returns {Promise<Object>} Card statistics
     */
    async getCardStats(cardId) {
        try {
            const cardRef = doc(this.flashcardsRef, cardId);
            const cardDoc = await getDoc(cardRef);

            if (!cardDoc.exists()) {
                throw new Error('Card not found');
            }

            const cardData = cardDoc.data();
            const qualityHistory = cardData.qualityHistory || [];

            return {
                totalReviews: cardData.totalReviews || 0,
                averageQuality: qualityHistory.length > 0 
                    ? qualityHistory.reduce((a, b) => a + b) / qualityHistory.length 
                    : 0,
                currentInterval: cardData.interval || 1,
                nextReview: cardData.nextReview,
                mastered: cardData.repetitions >= 4 && cardData.easeFactor > 2.5
            };
        } catch (error) {
            console.error('Error fetching card stats:', error);
            throw error;
        }
    }

    /**
     * Reset card progress
     * @param {string} cardId - Flashcard ID
     */
    async resetCardProgress(cardId) {
        try {
            const cardRef = doc(this.flashcardsRef, cardId);
            await updateDoc(cardRef, {
                repetitions: 0,
                easeFactor: 2.5,
                interval: 1,
                nextReview: this.calculateNextReviewDate(1),
                lastReviewed: null,
                totalReviews: 0,
                qualityHistory: []
            });
        } catch (error) {
            console.error('Error resetting card progress:', error);
            throw error;
        }
    }

    /**
     * Get learning progress overview
     * @returns {Promise<Object>} Learning progress statistics
     */
    async getLearningProgress() {
        try {
            const q = query(
                this.flashcardsRef,
                where('userId', '==', this.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const cards = querySnapshot.docs.map(doc => doc.data());

            const totalCards = cards.length;
            const masteredCards = cards.filter(
                card => card.repetitions >= 4 && card.easeFactor > 2.5
            ).length;

            const averageEaseFactor = cards.reduce(
                (sum, card) => sum + (card.easeFactor || 2.5), 
                0
            ) / totalCards;

            return {
                totalCards,
                masteredCards,
                masteryPercentage: (masteredCards / totalCards) * 100,
                averageEaseFactor,
                cardsToReview: cards.filter(
                    card => card.nextReview <= Timestamp.now()
                ).length
            };
        } catch (error) {
            console.error('Error fetching learning progress:', error);
            throw error;
        }
    }
}

export default SpacedRepetitionService;
