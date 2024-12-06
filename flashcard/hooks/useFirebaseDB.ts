import { useEffect, useState } from 'react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useFirebase } from '@/contexts/FirebaseContext';
import type { Card, Deck } from '@/types';

export const useFirebaseDB = () => {
  const { firebaseUser } = useFirebase();

  const createDeck = async (deck: Omit<Deck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    
    const decksRef = ref(database, `users/${firebaseUser.uid}/decks`);
    const newDeckRef = push(decksRef);
    
    const newDeck = {
      ...deck,
      userId: firebaseUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(newDeckRef, newDeck);
    return { id: newDeckRef.key, ...newDeck };
  };

  const createCard = async (
    deckId: string,
    card: Omit<Card, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    
    const cardsRef = ref(database, `users/${firebaseUser.uid}/decks/${deckId}/cards`);
    const newCardRef = push(cardsRef);
    
    const newCard = {
      ...card,
      deckId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(newCardRef, newCard);
    return { id: newCardRef.key, ...newCard };
  };

  const updateCardProgress = async (
    deckId: string,
    cardId: string,
    correct: boolean
  ) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    
    const cardRef = ref(
      database,
      `users/${firebaseUser.uid}/decks/${deckId}/cards/${cardId}`
    );

    const now = new Date().toISOString();
    const updates = {
      lastReviewed: now,
      updatedAt: now,
      reviewCount: (card: any) => (card.reviewCount || 0) + 1,
      correctCount: (card: any) => correct ? (card.correctCount || 0) + 1 : (card.correctCount || 0),
      incorrectCount: (card: any) => correct ? (card.incorrectCount || 0) : (card.incorrectCount || 0) + 1,
    };

    await set(cardRef, updates);
  };

  const deleteDeck = async (deckId: string) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    
    const deckRef = ref(database, `users/${firebaseUser.uid}/decks/${deckId}`);
    await remove(deckRef);
  };

  const useDecks = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!firebaseUser) return;

      const decksRef = ref(database, `users/${firebaseUser.uid}/decks`);
      const unsubscribe = onValue(decksRef, (snapshot) => {
        const data = snapshot.val();
        const decksArray = data ? Object.entries(data).map(([id, deck]: [string, any]) => ({
          id,
          ...deck,
        })) : [];
        
        setDecks(decksArray);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [firebaseUser]);

    return { decks, loading };
  };

  const useCards = (deckId: string) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!firebaseUser || !deckId) return;

      const cardsRef = ref(database, `users/${firebaseUser.uid}/decks/${deckId}/cards`);
      const unsubscribe = onValue(cardsRef, (snapshot) => {
        const data = snapshot.val();
        const cardsArray = data ? Object.entries(data).map(([id, card]: [string, any]) => ({
          id,
          ...card,
        })) : [];
        
        setCards(cardsArray);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [firebaseUser, deckId]);

    return { cards, loading };
  };

  return {
    createDeck,
    createCard,
    updateCardProgress,
    deleteDeck,
    useDecks,
    useCards,
  };
};

export default useFirebaseDB;
