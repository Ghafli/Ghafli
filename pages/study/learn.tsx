import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import StudyMode from '../../components/flashcards/StudyMode';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
}

export default function LearnMode() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { deck } = router.query;

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const query = deck ? `?deck=${encodeURIComponent(deck as string)}` : '';
        const response = await fetch(`/api/flashcards${query}`);
        const data = await response.json();
        setFlashcards(data);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchFlashcards();
    }
  }, [deck, router.isReady]);

  const handleStudyComplete = async (results) => {
    try {
      // Update study statistics
      await fetch('/api/stats/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardsStudied: flashcards.length,
          timeSpent: results.timeSpent,
          correctCount: results.correctCount,
          incorrectCount: results.incorrectCount,
        }),
      });

      // Redirect to results page
      router.push({
        pathname: '/study/results',
        query: {
          mode: 'learn',
          correct: results.correctCount,
          incorrect: results.incorrectCount,
          time: results.timeSpent,
        },
      });
    } catch (error) {
      console.error('Error updating study statistics:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No flashcards found
        </Typography>
        <Typography color="text.secondary">
          {deck 
            ? `No flashcards found in deck "${deck}"`
            : 'No flashcards found. Create some flashcards to start studying!'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Learn Mode {deck && `- ${deck}`}
      </Typography>
      
      <StudyMode
        flashcards={flashcards}
        mode="learn"
        onComplete={handleStudyComplete}
      />
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
