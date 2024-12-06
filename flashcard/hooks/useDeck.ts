import { useState, useEffect } from 'react';
import { getDeckById } from '@/lib/firebase';

const useDeck = (deckId: string) => {
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const deckData = await getDeckById(deckId);
        setDeck(deckData);
      } catch (err) {
        setError('Failed to fetch deck');
      } finally {
        setLoading(false);
      }
    };

    if (deckId) {
      fetchDeck();
    }
  }, [deckId]);

  return { deck, loading, error };
};

export default useDeck;
