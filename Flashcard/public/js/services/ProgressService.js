import { db, auth } from '../../config/firebase';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    Timestamp 
} from 'firebase/firestore';

class ProgressService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.progressRef = collection(db, 'progress');
        this.statsRef = collection(db, 'user_statistics');
    }

    async recordStudySession(sessionData) {
        try {
            const sessionRef = doc(this.progressRef);
            await setDoc(sessionRef, {
                userId: this.currentUser.uid,
                timestamp: Timestamp.now(),
                duration: sessionData.duration,
                cardsStudied: sessionData.cardsStudied,
                correctAnswers: sessionData.correctAnswers,
                mode: sessionData.mode,
                category: sessionData.category,
                ...sessionData
            });

            await this.updateUserStats(sessionData);
        } catch (error) {
            console.error('Error recording study session:', error);
            throw error;
        }
    }

    async updateUserStats(sessionData) {
        const statsRef = doc(this.statsRef, this.currentUser.uid);
        const statsDoc = await getDoc(statsRef);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (statsDoc.exists()) {
            const currentStats = statsDoc.data();
            const lastStudyDate = currentStats.lastStudyDate?.toDate() || new Date(0);
            lastStudyDate.setHours(0, 0, 0, 0);

            // Calculate streak
            const streak = today.getTime() === lastStudyDate.getTime() ? 
                currentStats.currentStreak :
                today.getTime() - lastStudyDate.getTime() <= 86400000 ?
                currentStats.currentStreak + 1 : 1;

            await updateDoc(statsRef, {
                totalCardsStudied: currentStats.totalCardsStudied + sessionData.cardsStudied,
                totalCorrectAnswers: currentStats.totalCorrectAnswers + sessionData.correctAnswers,
                totalStudySessions: currentStats.totalStudySessions + 1,
                totalStudyTime: currentStats.totalStudyTime + sessionData.duration,
                currentStreak: streak,
                bestStreak: Math.max(streak, currentStats.bestStreak || 0),
                lastStudyDate: Timestamp.now(),
                [`categoryProgress.${sessionData.category}`]: {
                    cardsStudied: (currentStats.categoryProgress?.[sessionData.category]?.cardsStudied || 0) + sessionData.cardsStudied,
                    correctAnswers: (currentStats.categoryProgress?.[sessionData.category]?.correctAnswers || 0) + sessionData.correctAnswers
                }
            });
        } else {
            // Initialize stats for new user
            await setDoc(statsRef, {
                totalCardsStudied: sessionData.cardsStudied,
                totalCorrectAnswers: sessionData.correctAnswers,
                totalStudySessions: 1,
                totalStudyTime: sessionData.duration,
                currentStreak: 1,
                bestStreak: 1,
                lastStudyDate: Timestamp.now(),
                categoryProgress: {
                    [sessionData.category]: {
                        cardsStudied: sessionData.cardsStudied,
                        correctAnswers: sessionData.correctAnswers
                    }
                }
            });
        }
    }

    async getUserStats() {
        try {
            const statsRef = doc(this.statsRef, this.currentUser.uid);
            const statsDoc = await getDoc(statsRef);
            
            if (statsDoc.exists()) {
                return statsDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    async getRecentProgress(days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const q = query(
                this.progressRef,
                where('userId', '==', this.currentUser.uid),
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                orderBy('timestamp', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching recent progress:', error);
            throw error;
        }
    }

    async getCategoryProgress() {
        try {
            const statsRef = doc(this.statsRef, this.currentUser.uid);
            const statsDoc = await getDoc(statsRef);
            
            if (statsDoc.exists()) {
                const { categoryProgress } = statsDoc.data();
                return Object.entries(categoryProgress).map(([category, stats]) => ({
                    category,
                    accuracy: (stats.correctAnswers / stats.cardsStudied * 100).toFixed(1),
                    cardsStudied: stats.cardsStudied
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching category progress:', error);
            throw error;
        }
    }

    async getStudyStreak() {
        try {
            const statsRef = doc(this.statsRef, this.currentUser.uid);
            const statsDoc = await getDoc(statsRef);
            
            if (statsDoc.exists()) {
                const { currentStreak, bestStreak } = statsDoc.data();
                return { currentStreak, bestStreak };
            }
            return { currentStreak: 0, bestStreak: 0 };
        } catch (error) {
            console.error('Error fetching study streak:', error);
            throw error;
        }
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
}

export default ProgressService;
