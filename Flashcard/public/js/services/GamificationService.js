import { db, auth } from '../../config/firebase';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    increment,
    arrayUnion,
    Timestamp 
} from 'firebase/firestore';

class GamificationService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.achievementsRef = collection(db, 'achievements');
        this.userAchievementsRef = collection(db, 'user_achievements');
        this.challengesRef = collection(db, 'daily_challenges');
        this.leaderboardRef = collection(db, 'leaderboard');
    }

    // Achievement definitions
    static ACHIEVEMENTS = {
        FIRST_CARD: {
            id: 'first_card',
            name: 'First Step',
            description: 'Create your first flashcard',
            icon: 'bi-star-fill',
            points: 10
        },
        STUDY_STREAK: {
            id: 'study_streak',
            name: 'Consistent Learner',
            description: 'Maintain a study streak of {count} days',
            icon: 'bi-fire',
            levels: [
                { count: 3, points: 20 },
                { count: 7, points: 50 },
                { count: 30, points: 200 }
            ]
        },
        MASTERY: {
            id: 'mastery',
            name: 'Master Mind',
            description: 'Master {count} cards',
            icon: 'bi-mortarboard-fill',
            levels: [
                { count: 10, points: 30 },
                { count: 50, points: 100 },
                { count: 100, points: 300 }
            ]
        },
        PERFECT_QUIZ: {
            id: 'perfect_quiz',
            name: 'Perfect Score',
            description: 'Complete a quiz with 100% accuracy',
            icon: 'bi-trophy-fill',
            points: 50
        }
    };

    /**
     * Check and award achievements based on user progress
     * @param {Object} progressData - User's current progress data
     */
    async checkAchievements(progressData) {
        try {
            const userAchievementsRef = doc(this.userAchievementsRef, this.currentUser.uid);
            const userAchievementsDoc = await getDoc(userAchievementsRef);
            const currentAchievements = userAchievementsDoc.exists() ? 
                userAchievementsDoc.data().achievements : [];

            const newAchievements = [];

            // Check study streak achievements
            if (progressData.currentStreak) {
                GamificationService.ACHIEVEMENTS.STUDY_STREAK.levels.forEach(level => {
                    if (progressData.currentStreak >= level.count) {
                        const achievementId = `study_streak_${level.count}`;
                        if (!currentAchievements.includes(achievementId)) {
                            newAchievements.push({
                                id: achievementId,
                                name: GamificationService.ACHIEVEMENTS.STUDY_STREAK.name,
                                description: GamificationService.ACHIEVEMENTS.STUDY_STREAK.description.replace('{count}', level.count),
                                icon: GamificationService.ACHIEVEMENTS.STUDY_STREAK.icon,
                                points: level.points,
                                earnedAt: Timestamp.now()
                            });
                        }
                    }
                });
            }

            // Check mastery achievements
            if (progressData.masteredCards) {
                GamificationService.ACHIEVEMENTS.MASTERY.levels.forEach(level => {
                    if (progressData.masteredCards >= level.count) {
                        const achievementId = `mastery_${level.count}`;
                        if (!currentAchievements.includes(achievementId)) {
                            newAchievements.push({
                                id: achievementId,
                                name: GamificationService.ACHIEVEMENTS.MASTERY.name,
                                description: GamificationService.ACHIEVEMENTS.MASTERY.description.replace('{count}', level.count),
                                icon: GamificationService.ACHIEVEMENTS.MASTERY.icon,
                                points: level.points,
                                earnedAt: Timestamp.now()
                            });
                        }
                    }
                });
            }

            // Award new achievements
            if (newAchievements.length > 0) {
                await this.awardAchievements(newAchievements);
                return newAchievements;
            }

            return [];
        } catch (error) {
            console.error('Error checking achievements:', error);
            throw error;
        }
    }

    /**
     * Award achievements to user
     * @param {Array} achievements - List of achievements to award
     */
    async awardAchievements(achievements) {
        try {
            const userAchievementsRef = doc(this.userAchievementsRef, this.currentUser.uid);
            const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

            await updateDoc(userAchievementsRef, {
                achievements: arrayUnion(...achievements.map(a => a.id)),
                earnedAchievements: arrayUnion(...achievements),
                totalPoints: increment(totalPoints)
            });

            // Update leaderboard
            await this.updateLeaderboard(totalPoints);
        } catch (error) {
            console.error('Error awarding achievements:', error);
            throw error;
        }
    }

    /**
     * Get user's achievements
     * @returns {Promise<Object>} User's achievements and points
     */
    async getUserAchievements() {
        try {
            const userAchievementsRef = doc(this.userAchievementsRef, this.currentUser.uid);
            const userAchievementsDoc = await getDoc(userAchievementsRef);

            if (userAchievementsDoc.exists()) {
                return userAchievementsDoc.data();
            }
            return { achievements: [], earnedAchievements: [], totalPoints: 0 };
        } catch (error) {
            console.error('Error fetching user achievements:', error);
            throw error;
        }
    }

    /**
     * Update user's position on leaderboard
     * @param {number} pointsToAdd - Points to add to user's score
     */
    async updateLeaderboard(pointsToAdd) {
        try {
            const leaderboardRef = doc(this.leaderboardRef, this.currentUser.uid);
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            const userData = userDoc.data();

            await setDoc(leaderboardRef, {
                userId: this.currentUser.uid,
                displayName: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || null,
                points: increment(pointsToAdd),
                lastUpdated: Timestamp.now()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            throw error;
        }
    }

    /**
     * Get current leaderboard
     * @param {number} limit - Number of top users to retrieve
     * @returns {Promise<Array>} Leaderboard entries
     */
    async getLeaderboard(limitCount = 10) {
        try {
            const q = query(
                this.leaderboardRef,
                orderBy('points', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    /**
     * Get daily challenge
     * @returns {Promise<Object>} Daily challenge data
     */
    async getDailyChallenge() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const challengeRef = doc(this.challengesRef, today.toISOString().split('T')[0]);
            const challengeDoc = await getDoc(challengeRef);

            if (!challengeDoc.exists()) {
                // Generate new challenge if none exists
                const challenge = this.generateDailyChallenge();
                await setDoc(challengeRef, {
                    ...challenge,
                    date: Timestamp.fromDate(today),
                    participants: 0,
                    completions: 0
                });
                return challenge;
            }

            return challengeDoc.data();
        } catch (error) {
            console.error('Error fetching daily challenge:', error);
            throw error;
        }
    }

    /**
     * Generate a new daily challenge
     * @returns {Object} Challenge data
     */
    generateDailyChallenge() {
        const challenges = [
            {
                type: 'study_cards',
                title: 'Study Marathon',
                description: 'Study 20 cards today',
                target: 20,
                points: 50
            },
            {
                type: 'perfect_reviews',
                title: 'Perfect Recall',
                description: 'Complete 5 perfect reviews',
                target: 5,
                points: 75
            },
            {
                type: 'different_categories',
                title: 'Diverse Learning',
                description: 'Study cards from 3 different categories',
                target: 3,
                points: 60
            }
        ];

        return challenges[Math.floor(Math.random() * challenges.length)];
    }

    /**
     * Complete daily challenge
     * @param {string} challengeId - Challenge identifier
     */
    async completeDailyChallenge(challengeId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const challengeRef = doc(this.challengesRef, today.toISOString().split('T')[0]);
            
            await updateDoc(challengeRef, {
                completions: increment(1)
            });

            const challenge = (await getDoc(challengeRef)).data();

            // Award points
            await this.updateLeaderboard(challenge.points);

            // Record completion
            const userChallengesRef = doc(collection(db, 'user_challenges'), this.currentUser.uid);
            await updateDoc(userChallengesRef, {
                completedChallenges: arrayUnion({
                    challengeId,
                    completedAt: Timestamp.now(),
                    points: challenge.points
                })
            });

            return challenge.points;
        } catch (error) {
            console.error('Error completing challenge:', error);
            throw error;
        }
    }
}

export default GamificationService;
