import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import FlashcardEditor from '../../components/flashcards/FlashcardEditor';

export default function CreateFlashcard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { deck } = router.query;
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (data: any) => {
    if (!session?.user?.id) {
      setError('You must be signed in to create flashcards');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          deck: deck || 'Default',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create flashcard');
      }

      // Redirect back to the deck view or dashboard
      if (deck) {
        router.push(`/decks/${deck}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
      setError(error instanceof Error ? error.message : 'Failed to create flashcard');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Flashcard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Paper sx={{ p: 3 }}>
          <FlashcardEditor
            initialData={deck ? { deck: deck as string, front: '', back: '', tags: [] } : undefined}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Paper>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/flashcards/create',
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
