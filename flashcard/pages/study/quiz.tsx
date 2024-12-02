import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
}

interface QuizState {
  currentCardIndex: number;
  showAnswer: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  startTime: number;
}

export default function QuizMode() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentCardIndex: 0,
    showAnswer: false,
    correctAnswers: 0,
    incorrectAnswers: 0,
    startTime: Date.now(),
  });
  
  const router = useRouter();
  const { deck } = router.query;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        const query = deck ? `?deck=${encodeURIComponent(deck as string)}` : '';
        const response = await fetch(`/api/flashcards${query}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }
        
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          setError('No flashcards found. Create some flashcards first!');
          setFlashcards([]);
        } else {
          setFlashcards(data);
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        setError('Failed to load flashcards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchFlashcards();
    }
  }, [deck, session]);

  const handleAnswer = async (correct: boolean) => {
    if (!flashcards.length) return;

    const currentCard = flashcards[quizState.currentCardIndex];
    
    try {
      // Update study stats
      await fetch(`/api/flashcards/${currentCard._id}/study`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correct,
          studyTime: Date.now() - quizState.startTime,
        }),
      });
    } catch (error) {
      console.error('Error updating study stats:', error);
    }

    setQuizState(prev => ({
      ...prev,
      showAnswer: false,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: correct ? prev.incorrectAnswers : prev.incorrectAnswers + 1,
      currentCardIndex: (prev.currentCardIndex + 1) % flashcards.length,
      startTime: Date.now(),
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => router.push('/flashcards/create')}>
            Create Flashcards
          </Button>
        </Box>
      </Container>
    );
  }

  if (!flashcards.length) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            No flashcards available. Create some flashcards to start studying!
          </Alert>
          <Button variant="contained" onClick={() => router.push('/flashcards/create')}>
            Create Flashcards
          </Button>
        </Box>
      </Container>
    );
  }

  const currentCard = flashcards[quizState.currentCardIndex];
  const progress = ((quizState.correctAnswers + quizState.incorrectAnswers) / flashcards.length) * 100;

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {quizState.currentCardIndex + 1} of {flashcards.length} cards
        </Typography>

        <Card sx={{ mb: 2, minHeight: 200 }}>
          <CardContent>
            <Typography variant="h5" component="div" align="center">
              {quizState.showAnswer ? currentCard.back : currentCard.front}
            </Typography>
          </CardContent>
        </Card>

        {!quizState.showAnswer ? (
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setQuizState(prev => ({ ...prev, showAnswer: true }))}
          >
            Show Answer
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => handleAnswer(false)}
            >
              Incorrect
            </Button>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => handleAnswer(true)}
            >
              Correct
            </Button>
          </Stack>
        )}
      </Box>
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
    props: {
      session,
    },
  };
};
