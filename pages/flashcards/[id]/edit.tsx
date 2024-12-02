import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import FlashcardEditor from '../../../components/flashcards/FlashcardEditor';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
}

export default function EditFlashcard() {
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchFlashcard = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/flashcards/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard');
        }
        const data = await response.json();
        setFlashcard(data);
      } catch (error) {
        console.error('Error fetching flashcard:', error);
        router.push('/flashcards');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchFlashcard();
    }
  }, [id, router.isReady]);

  const handleSubmit = async (data: any) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }

      router.push('/flashcards');
    } catch (error) {
      console.error('Error updating flashcard:', error);
      // Handle error (show error message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!flashcard) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Flashcard not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/flashcards')}
            sx={{ mt: 2 }}
          >
            Back to Flashcards
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Flashcard
        </Typography>
        
        {isSubmitting ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FlashcardEditor
              initialData={{
                front: flashcard.front,
                back: flashcard.back,
                deck: flashcard.deck,
                tags: flashcard.tags,
              }}
              onSubmit={handleSubmit}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Paper>
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
