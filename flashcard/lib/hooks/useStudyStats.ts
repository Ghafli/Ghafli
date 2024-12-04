import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase/config';
import { StudyStats } from '../db/types';
import { initializeStats } from '../db/utils';
import { useAuth } from './useAuth';

export const useStudyStats = () => {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    const statsRef = ref(database, `users/${user.uid}/stats`);
    
    const unsubscribe = onValue(statsRef, async (snapshot) => {
      try {
        let currentStats = snapshot.val();
        
        if (!currentStats) {
          await initializeStats(user.uid);
          return; // onValue will trigger again with initialized stats
        }

        setStats(currentStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load stats'));
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError(err instanceof Error ? err : new Error('Failed to load stats'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStats = async (updates: Partial<StudyStats>) => {
    if (!user || !stats) {
      throw new Error('No user or stats available');
    }

    try {
      const statsRef = ref(database, `users/${user.uid}/stats`);
      
      // Calculate new values
      const now = Date.now();
      const newTotalTime = stats.totalStudyTime + (updates.totalStudyTime || 0);
      const newCardsStudied = stats.cardsStudied + (updates.cardsStudied || 0);
      const newCardsMastered = stats.cardsMastered + (updates.cardsMastered || 0);
      
      // Calculate new accuracy
      const newAccuracy = updates.cardsStudied 
        ? ((stats.accuracy * stats.cardsStudied) + (updates.accuracy || 0)) / (stats.cardsStudied + updates.cardsStudied)
        : stats.accuracy;

      // Update study streak
      const lastDate = stats.lastStudyDate ? new Date(stats.lastStudyDate) : null;
      const today = new Date();
      const isNewDay = lastDate?.getDate() !== today.getDate() || 
                      lastDate?.getMonth() !== today.getMonth() || 
                      lastDate?.getFullYear() !== today.getFullYear();

      // Reset cards studied today if it's a new day
      const newCardsStudiedToday = isNewDay ? (updates.cardsStudied || 0) : stats.cardsStudiedToday + (updates.cardsStudied || 0);

      const updatedStats: Partial<StudyStats> = {
        ...updates,
        totalStudyTime: newTotalTime,
        cardsStudied: newCardsStudied,
        cardsMastered: newCardsMastered,
        accuracy: newAccuracy,
        lastStudyDate: now,
        cardsStudiedToday: newCardsStudiedToday,
        studyStreak: isNewDay ? stats.studyStreak + 1 : stats.studyStreak,
        lastStreakCheck: now
      };

      await update(statsRef, updatedStats);
    } catch (err) {
      throw new Error('Failed to update stats');
    }
  };

  return {
    stats: stats ? {
      totalCards: stats.totalCards,
      cardsStudied: stats.cardsStudied,
      cardsMastered: stats.cardsMastered,
      studyStreak: stats.studyStreak,
      lastStudyDate: stats.lastStudyDate,
      accuracy: stats.accuracy,
      perfectReviews: stats.perfectReviews,
      cardsStudiedToday: stats.cardsStudiedToday,
      totalStudyTime: stats.totalStudyTime,
      averageResponseTime: stats.averageResponseTime,
      lastStreakCheck: stats.lastStreakCheck
    } : null,
    loading,
    error,
    updateStats
  };
};
