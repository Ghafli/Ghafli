import { useState, useEffect, useCallback } from 'react';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { database, auth } from '../firebase';
import { Deck } from '../db/types';

export const useRecentDecks = (limit: number = 5) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDecks = useCallback(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const decksRef = query(
      ref(database, `users/${auth.currentUser.uid}/decks`),
      orderByChild('lastStudied'),
      limitToLast(limit)
    );

    return onValue(
      decksRef,
      (snapshot) => {
        try {
          const decksData = snapshot.val();
          if (decksData) {
            const decksArray = Object.values(decksData)
              .sort((a: any, b: any) => b.lastStudied - a.lastStudied);
            setDecks(decksArray as Deck[]);
          } else {
            setDecks([]);
          }
          setError(null);
        } catch (err) {
          console.error('Error processing decks data:', err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error loading decks:', err);
        setError(err);
        setLoading(false);
      }
    );
  }, [limit]);

  useEffect(() => {
    const unsubscribe = loadDecks();
    return () => unsubscribe?.();
  }, [loadDecks]);

  const formatLastStudied = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const getDueCards = (deck: Deck): number => {
    if (!deck.cards) return 0;
    const now = Date.now();
    return Object.values(deck.cards).filter(card => card.nextReview <= now).length;
  };

  const getMasteredCards = (deck: Deck): number => {
    return deck.masteredCards || 0;
  };

  const getDeckStats = (deck: Deck) => {
    const totalCards = deck.totalCards || 0;
    const dueCards = getDueCards(deck);
    const masteredCards = getMasteredCards(deck);
    
    return {
      totalCards,
      dueCards,
      masteredCards,
      masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0,
      lastStudied: formatLastStudied(deck.lastStudied)
    };
  };

  return {
    decks,
    loading,
    error,
    loadDecks,
    getDeckStats,
    formatLastStudied
  };
};
