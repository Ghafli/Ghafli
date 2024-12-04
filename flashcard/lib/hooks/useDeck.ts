import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../firebase';
import { Deck, Flashcard } from '../db/types';
import {
  createDeck,
  addCardToDeck,
  updateCard,
  calculateNextReview,
} from '../db/utils';

export const useDeck = (deckId?: string) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deckId || !auth.currentUser) {
      setLoading(false);
      return;
    }

    const deckRef = ref(database, `users/${auth.currentUser.uid}/decks/${deckId}`);
    const unsubscribe = onValue(
      deckRef,
      (snapshot) => {
        setDeck(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deckId]);

  const createNewDeck = async (name: string, description?: string) => {
    try {
      return await createDeck({ name, description });
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const addCard = async (front: string, back: string) => {
    if (!deckId) throw new Error('No deck selected');
    try {
      return await addCardToDeck(deckId, { front, back });
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const reviewCard = async (cardId: string, wasCorrect: boolean) => {
    if (!deckId || !deck?.cards[cardId]) throw new Error('Invalid card');
    
    const card = deck.cards[cardId];
    const { nextReview, newDifficulty } = calculateNextReview(
      card.difficulty || 0.3,
      wasCorrect,
      Date.now()
    );

    try {
      await updateCard(deckId, cardId, {
        nextReview,
        difficulty: newDifficulty,
        lastReview: Date.now(),
        reviewCount: (card.reviewCount || 0) + 1
      });
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const getDueCards = (): Flashcard[] => {
    if (!deck?.cards) return [];
    
    const now = Date.now();
    return Object.values(deck.cards)
      .filter(card => card.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);
  };

  return {
    deck,
    loading,
    error,
    createNewDeck,
    addCard,
    reviewCard,
    getDueCards,
  };
};
