import { db, auth } from '../../config/firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc 
} from 'firebase/firestore';

class FlashcardService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.flashcardsRef = collection(db, 'flashcards');
    }

    async getFlashcardsByCategory(category) {
        try {
            const q = query(
                this.flashcardsRef,
                where('userId', '==', this.currentUser.uid),
                where('category', '==', category)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching flashcards:', error);
            throw error;
        }
    }

    async getFlashcardsByTopic(topic) {
        try {
            const q = query(
                this.flashcardsRef,
                where('userId', '==', this.currentUser.uid),
                where('topic', '==', topic)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching flashcards:', error);
            throw error;
        }
    }

    async getDueCards() {
        try {
            const now = new Date().getTime();
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

    async updateCardProgress(cardId, quality) {
        try {
            const cardRef = doc(this.flashcardsRef, cardId);
            const now = new Date().getTime();
            
            // SuperMemo 2 Algorithm implementation
            const calculateNextReview = (quality, repetitions, easeFactor, interval) => {
                if (quality < 3) {
                    return {
                        repetitions: 0,
                        easeFactor: Math.max(1.3, easeFactor - 0.2),
                        interval: 1
                    };
                }

                const newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                let newInterval;

                if (repetitions === 0) {
                    newInterval = 1;
                } else if (repetitions === 1) {
                    newInterval = 6;
                } else {
                    newInterval = Math.round(interval * easeFactor);
                }

                return {
                    repetitions: repetitions + 1,
                    easeFactor: Math.max(1.3, newEaseFactor),
                    interval: newInterval
                };
            };

            const card = await getDocs(cardRef);
            const cardData = card.data();
            const progress = calculateNextReview(
                quality,
                cardData.repetitions || 0,
                cardData.easeFactor || 2.5,
                cardData.interval || 1
            );

            await updateDoc(cardRef, {
                ...progress,
                lastReviewed: now,
                nextReview: now + (progress.interval * 24 * 60 * 60 * 1000) // Convert days to milliseconds
            });

            return progress;
        } catch (error) {
            console.error('Error updating card progress:', error);
            throw error;
        }
    }
}
