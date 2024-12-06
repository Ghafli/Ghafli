import { useState, useEffect } from 'react';
import { useFirebaseDB } from './useFirebaseDB';
import type { Card, StudyProgress } from '@/types';

interface StudySessionHook {
  currentCard: Card | null;
  progress: StudyProgress;
  isComplete: boolean;
  isLoading: boolean;
  error: Error | null;
  handleResponse: (correct: boolean) => void;
}

export const useStudySession = (deckId: string): StudySessionHook => {
  const { useCards, updateCardProgress } = useFirebaseDB();
  const { cards, loading: cardsLoading } = useCards(deckId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<StudyProgress>({
    total: 0,
    completed: 0,
    correct: 0,
    incorrect: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  // Update total cards when cards are loaded
  useEffect(() => {
    if (cards.length > 0) {
      setProgress(prev => ({ ...prev, total: cards.length }));
    }
  }, [cards]);

  const handleResponse = async (correct: boolean) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      // Update progress in Firebase
      await updateCardProgress(deckId, currentCard.id, correct);

      // Update local progress state
      setProgress(prev => ({
        ...prev,
        completed: prev.completed + 1,
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: correct ? prev.incorrect : prev.incorrect + 1,
      }));

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update progress'));
      console.error('Failed to update card progress:', err);
    }
  };

  return {
    currentCard: cards[currentIndex] || null,
    progress,
    isComplete: progress.completed === progress.total && progress.total > 0,
    isLoading: cardsLoading,
    error,
    handleResponse,
  };
};

export default useStudySession;
