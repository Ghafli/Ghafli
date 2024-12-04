import { ref, set, get, update, push, remove } from 'firebase/database';
import { database, auth } from '../firebase';
import { UserProfile, StudyStats, Deck, Flashcard, Achievement, UserData } from './types';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

// Error classes for better error handling
export class DatabaseError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'User not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Cache implementation
const dataCache = new Map<string, { data: any; timestamp: number }>();

const getCacheKey = (path: string) => {
  const userId = auth.currentUser?.uid;
  return userId ? `${userId}:${path}` : null;
};

const getFromCache = (path: string) => {
  const key = getCacheKey(path);
  if (!key) return null;

  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const saveToCache = (path: string, data: any) => {
  const key = getCacheKey(path);
  if (!key) return;

  dataCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Utility functions
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new AuthenticationError();
  return user.uid;
};

export const getUserRef = (path: string = '') => {
  const uid = getCurrentUserId();
  return ref(database, `users/${uid}${path ? `/${path}` : ''}`);
};

// Retry mechanism for database operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
};

// Database operations with caching and retry
export const getData = async <T>(path: string): Promise<T> => {
  const cached = getFromCache(path);
  if (cached) return cached as T;

  try {
    const snapshot = await retryOperation(() => get(getUserRef(path)));
    const data = snapshot.val() as T;
    saveToCache(path, data);
    return data;
  } catch (error: any) {
    throw new DatabaseError(`Failed to fetch data: ${error.message}`, error.code);
  }
};

export const setData = async <T>(path: string, data: T): Promise<void> => {
  try {
    await retryOperation(() => set(getUserRef(path), data));
    saveToCache(path, data);
  } catch (error: any) {
    throw new DatabaseError(`Failed to set data: ${error.message}`, error.code);
  }
};

export const updateData = async <T>(path: string, updates: Partial<T>): Promise<void> => {
  try {
    await retryOperation(() => update(getUserRef(path), updates));
    const cached = getFromCache(path);
    if (cached) {
      saveToCache(path, { ...cached, ...updates });
    }
  } catch (error: any) {
    throw new DatabaseError(`Failed to update data: ${error.message}`, error.code);
  }
};

export const pushData = async <T>(path: string, data: T): Promise<string> => {
  try {
    const newRef = push(getUserRef(path));
    await retryOperation(() => set(newRef, data));
    return newRef.key!;
  } catch (error: any) {
    throw new DatabaseError(`Failed to push data: ${error.message}`, error.code);
  }
};

export const removeData = async (path: string): Promise<void> => {
  try {
    await retryOperation(() => remove(getUserRef(path)));
    const key = getCacheKey(path);
    if (key) dataCache.delete(key);
  } catch (error: any) {
    throw new DatabaseError(`Failed to remove data: ${error.message}`, error.code);
  }
};

// Achievement Operations
export const checkAndUpdateAchievements = async (userId: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const achievementsRef = ref(database, `achievements/${userId}`);

    const [userSnapshot, achievementsSnapshot] = await Promise.all([
      get(userRef),
      get(achievementsRef)
    ]);

    const userData = userSnapshot.val();
    const currentAchievements: Record<string, Achievement> = achievementsSnapshot.val() || {};

    const achievementChecks: Achievement[] = [
      {
        id: 'first_deck',
        title: 'First Steps',
        description: 'Create your first flashcard deck',
        icon: '📚',
        condition: () => userData.decks && Object.keys(userData.decks).length > 0
      },
      {
        id: 'study_streak_3',
        title: 'Consistent Learner',
        description: 'Maintain a 3-day study streak',
        icon: '🔥',
        condition: () => userData.stats?.studyStreak >= 3
      },
      {
        id: 'cards_mastered_10',
        title: 'Knowledge Builder',
        description: 'Master 10 flashcards',
        icon: '🎓',
        condition: () => userData.stats?.cardsMastered >= 10
      },
      {
        id: 'perfect_review',
        title: 'Perfect Review',
        description: 'Complete a review session with 100% accuracy',
        icon: '⭐',
        condition: () => userData.stats?.perfectReviews > 0
      },
      {
        id: 'deck_master',
        title: 'Deck Master',
        description: 'Achieve 100% mastery in a deck',
        icon: '👑',
        condition: () => {
          if (!userData.decks) return false;
          return Object.values(userData.decks as Record<string, { mastery: number }>)
            .some(deck => deck.mastery === 1);
        }
      },
      {
        id: 'study_marathon',
        title: 'Study Marathon',
        description: 'Study 50 cards in a single day',
        icon: '🏃',
        condition: () => userData.stats?.cardsStudiedToday >= 50
      }
    ];

    const newAchievements = achievementChecks.filter(achievement => {
      return !currentAchievements[achievement.id] && achievement.condition();
    });

    if (newAchievements.length > 0) {
      const updates: Record<string, Achievement> = {};
      
      newAchievements.forEach(achievement => {
        updates[achievement.id] = {
          ...achievement,
          earnedAt: Date.now()
        };
      });

      await update(achievementsRef, updates);
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
    throw new Error('Failed to check achievements');
  }
};

// Stats Operations
export const updateStats = async (updates: Partial<StudyStats>) => {
  try {
    await updateData('stats', updates);
  } catch (error: any) {
    throw new DatabaseError(`Failed to update stats: ${error.message}`, error.code);
  }
};

export const initializeStats = async (userId: string): Promise<void> => {
  try {
    const statsRef = ref(database, `users/${userId}/stats`);
    const snapshot = await get(statsRef);
    const existingStats = snapshot.val();

    // If stats already exist, don't overwrite them
    if (existingStats) {
      return;
    }

    const defaultStats: StudyStats = {
      totalCards: 0,
      cardsStudied: 0,
      cardsMastered: 0,
      studyStreak: 0,
      lastStudyDate: null,
      accuracy: 0,
      perfectReviews: 0,
      cardsStudiedToday: 0,
      lastStreakCheck: Date.now(),
      totalStudyTime: 0,
      averageResponseTime: 0
    };

    await set(statsRef, defaultStats);
  } catch (error) {
    console.error('Error initializing stats:', error);
    throw new Error('Failed to initialize stats');
  }
};

// Profile Operations
export const createUserProfile = async (profile: Omit<UserProfile, 'createdAt'>): Promise<UserProfile> => {
  const userProfile: UserProfile = {
    ...profile,
    createdAt: Date.now(),
  };

  try {
    await setData('profile', userProfile);
    return userProfile;
  } catch (error: any) {
    throw new DatabaseError(`Failed to create user profile: ${error.message}`, error.code);
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
  try {
    await updateData('profile', updates);
  } catch (error: any) {
    throw new DatabaseError(`Failed to update user profile: ${error.message}`, error.code);
  }
};

// Deck Operations
export const createDeck = async (deckData: Omit<Deck, 'id' | 'createdAt' | 'lastStudied' | 'cards'>): Promise<Deck> => {
  const deckRef = push(getUserRef('decks'));
  const newDeck: Deck = {
    id: deckRef.key!,
    ...deckData,
    createdAt: Date.now(),
    lastStudied: Date.now(),
    cards: {},
    totalCards: 0,
    masteredCards: 0,
  };

  try {
    await setData(deckRef.key!, newDeck);
    return newDeck;
  } catch (error: any) {
    throw new DatabaseError(`Failed to create deck: ${error.message}`, error.code);
  }
};

export const addCardToDeck = async (deckId: string, cardData: Omit<Flashcard, 'id' | 'nextReview'>): Promise<Flashcard> => {
  const cardRef = push(getUserRef(`decks/${deckId}/cards`));
  const newCard: Flashcard = {
    id: cardRef.key!,
    ...cardData,
    nextReview: Date.now(),
    reviewCount: 0,
    difficulty: 0.3, // Initial difficulty
  };

  try {
    await setData(cardRef.key!, newCard);
    return newCard;
  } catch (error: any) {
    throw new DatabaseError(`Failed to add card to deck: ${error.message}`, error.code);
  }
};

export const updateCard = async (deckId: string, cardId: string, updates: Partial<Flashcard>): Promise<void> => {
  try {
    await updateData(`decks/${deckId}/cards/${cardId}`, updates);
  } catch (error: any) {
    throw new DatabaseError(`Failed to update card: ${error.message}`, error.code);
  }
};

// Utility function to calculate next review date using spaced repetition
export const calculateNextReview = (
  currentDifficulty: number,
  wasCorrect: boolean,
  lastReviewDate: number
): { nextReview: number; newDifficulty: number } => {
  const MIN_DIFFICULTY = 0.3;
  const MAX_DIFFICULTY = 2.5;
  
  let newDifficulty = currentDifficulty;
  
  if (wasCorrect) {
    newDifficulty += 0.1;
  } else {
    newDifficulty -= 0.2;
  }
  
  newDifficulty = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, newDifficulty));
  
  const intervalDays = Math.round(6 * newDifficulty);
  const nextReview = lastReviewDate + (intervalDays * 24 * 60 * 60 * 1000);
  
  return { nextReview, newDifficulty };
};
