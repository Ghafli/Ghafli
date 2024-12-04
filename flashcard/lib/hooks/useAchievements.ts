import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database, auth } from '../firebase';
import { Achievement, StudyStats } from '../db/types';
import { checkAndUpdateAchievements } from '../db/utils';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MIN_CHECK_INTERVAL = 30 * 1000; // 30 seconds
const RETRY_DELAY = 1000; // 1 second initial retry delay
const MAX_RETRIES = 3;

interface CacheEntry {
  data: { [key: string]: Achievement };
  timestamp: number;
  lastCheck: number;
}

const achievementCache = new Map<string, CacheEntry>();

const useAchievements = () => {
  const [achievements, setAchievements] = useState<{ [key: string]: Achievement }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);
  
  const retryCount = useRef(0);
  const retryTimeout = useRef<NodeJS.Timeout>();

  const loadAchievements = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userId = user.uid;
    const cached = achievementCache.get(userId);
    const now = Date.now();

    // Use cache if valid
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setAchievements(cached.data);
      setLoading(false);
      return;
    }

    try {
      const achievementsRef = ref(database, `users/${userId}/achievements`);
      
      return onValue(achievementsRef, 
        (snapshot) => {
          const data = snapshot.val() || {};
          setAchievements(data);
          setError(null);
          
          // Update cache
          achievementCache.set(userId, {
            data,
            timestamp: now,
            lastCheck: now
          });

          retryCount.current = 0; // Reset retry count on success
          setLoading(false);
        },
        (error) => {
          console.error('Error loading achievements:', error);
          
          // Use cached data if available
          if (cached) {
            setAchievements(cached.data);
          }

          // Implement exponential backoff for retries
          if (retryCount.current < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, retryCount.current);
            retryTimeout.current = setTimeout(() => {
              retryCount.current++;
              loadAchievements();
            }, delay);
          } else {
            setError(error);
          }
          
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up achievements listener:', error);
      setError(error as Error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = loadAchievements();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [loadAchievements]);

  const checkAchievements = useCallback(async (stats: StudyStats) => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const cached = achievementCache.get(userId);
    const now = Date.now();

    // Throttle checks
    if (cached && now - cached.lastCheck < MIN_CHECK_INTERVAL) {
      return;
    }

    try {
      const unlockedAchievements = await checkAndUpdateAchievements(userId, stats);
      
      if (unlockedAchievements && unlockedAchievements.length > 0) {
        setNewlyUnlockedAchievements(unlockedAchievements);
        
        // Update cache with new achievements
        if (cached) {
          const updatedData = { ...cached.data };
          unlockedAchievements.forEach(achievement => {
            updatedData[achievement.id] = achievement;
          });
          
          achievementCache.set(userId, {
            data: updatedData,
            timestamp: now,
            lastCheck: now
          });
        }
      }

      // Update last check time
      if (cached) {
        achievementCache.set(userId, {
          ...cached,
          lastCheck: now
        });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      setError(error as Error);
    }
  }, []);

  const clearNewlyUnlockedAchievements = useCallback(() => {
    setNewlyUnlockedAchievements([]);
  }, []);

  return {
    achievements,
    loading,
    error,
    newlyUnlockedAchievements,
    checkAchievements,
    clearNewlyUnlockedAchievements,
    retryLoading: loadAchievements
  };
};

export default useAchievements;
