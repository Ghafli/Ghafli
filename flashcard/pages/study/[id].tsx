import React from 'react';
import { useRouter } from 'next/router';
import { Container, Box, Typography } from '@mui/material';
import Flashcard from '@/components/study/Flashcard';
import StudyControls from '@/components/study/StudyControls';
import StudyProgress from '@/components/study/StudyProgress';
import StudyComplete from '@/components/study/StudyComplete';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useStudySession } from '@/hooks/useStudySession';
import { useFirebaseDB } from '@/hooks/useFirebaseDB';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

const StudyPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { useDecks } = useFirebaseDB();
  const { decks, loading: decksLoading } = useDecks();
  
  const {
    currentCard,
    progress,
    isComplete,
    isLoading,
    error,
    handleResponse,
  } = useStudySession(id as string);

  // Find the current deck
  const currentDeck = decks.find(deck => deck.id === id);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoading || decksLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  if (error) {
    toast.error(error.message);
    return (
      <DashboardLayout>
        <Container>
          <Typography color="error" variant="h6">
            {error.message}
          </Typography>
        </Container>
      </DashboardLayout>
    );
  }

  if (!currentDeck) {
    return (
      <DashboardLayout>
        <Container>
          <Typography color="error" variant="h6">
            Deck not found
          </Typography>
        </Container>
      </DashboardLayout>
    );
  }

  if (isComplete) {
    return (
      <DashboardLayout>
        <Container>
          <StudyComplete
            deckId={id as string}
            stats={{
              total: progress.total,
              correct: progress.correct,
              incorrect: progress.incorrect,
            }}
            onRestart={() => router.reload()}
            onExit={() => router.push(`/decks/${id}`)}
          />
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentDeck.title}
          </Typography>
          <StudyProgress
            current={progress.completed}
            total={progress.total}
          />
        </Box>

        {currentCard && (
          <>
            <Flashcard
              front={currentCard.front}
              back={currentCard.back}
              hint={currentCard.hint}
            />
            <StudyControls
              onCorrect={() => handleResponse(true)}
              onIncorrect={() => handleResponse(false)}
            />
          </>
        )}
      </Container>
    </DashboardLayout>
  );
};

// Wrap the page with FirebaseProvider
const StudyPageWithFirebase = () => (
  <FirebaseProvider>
    <StudyPage />
  </FirebaseProvider>
);

export default StudyPageWithFirebase;
