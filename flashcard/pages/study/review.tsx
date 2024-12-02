import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Rating,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
  nextReview: string;
  studyStats: {
    repetitions: number;
    easeFactor: number;
    interval: number;
  };
}

export default function ReviewMode() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  const router = useRouter();
  const { deck } = router.query;

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        const query = deck ? `?deck=${encodeURIComponent(deck as string)}` : '';
        const response = await fetch(`/api/flashcards/due${query}`);
        const data = await response.json();
        setFlashcards(data);
      } catch (error) {
        console.error('Error fetching due cards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchDueCards();
    }
  }, [deck, router.isReady]);

  const handleReview = async (quality: number) => {
    const currentCard = flashcards[currentIndex];
    
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentCard._id,
          correct: quality >= 3,
          quality,
        }),
      });

      if (currentIndex === flashcards.length - 1) {
        // Review session complete
        router.push('/study/results?mode=review');
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
        setConfidence(null);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading review cards...</Typography>
      </Box>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No cards due for review
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Great job! You're all caught up with your reviews.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Review Mode {deck && `- ${deck}`}
      </Typography>

      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Card {currentIndex + 1} of {flashcards.length}
        </Typography>
        {currentCard.tags?.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {currentCard.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>
        )}
      </Box>

      <Card 
        sx={{ 
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          mb: 3,
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography 
            variant="h5" 
            component="div" 
            align="center"
            sx={{ mb: showAnswer ? 4 : 0 }}
          >
            {currentCard.front}
          </Typography>

          {showAnswer && (
            <>
              <Typography 
                variant="h5" 
                component="div" 
                align="center"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                {currentCard.back}
              </Typography>

              <Box sx={{ textAlign: 'center' }}>
                <Typography gutterBottom>
                  Rate your confidence:
                </Typography>
                <Rating
                  size="large"
                  max={5}
                  value={confidence}
                  onChange={(_, value) => setConfidence(value)}
                  sx={{ fontSize: '2rem' }}
                />
                {confidence !== null && (
                  <Button
                    variant="contained"
                    onClick={() => handleReview(confidence)}
                    sx={{ mt: 2 }}
                  >
                    Next Card
                  </Button>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {!showAnswer && (
        <Button
          variant="contained"
          fullWidth
          onClick={() => setShowAnswer(true)}
        >
          Show Answer
        </Button>
      )}
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
