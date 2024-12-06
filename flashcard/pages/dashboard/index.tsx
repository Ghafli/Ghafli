import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useFirebaseDB } from '@/hooks/useFirebaseDB';
import { Container, Grid, Typography, Box } from '@mui/material';
import DeckList from '@/components/dashboard/DeckList';
import StatsOverview from '@/components/dashboard/StatsOverview';
import CreateDeckButton from '@/components/dashboard/CreateDeckButton';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import { StudyStats } from '@/types';
import { IDeck } from '@/models/Deck';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { useDecks } = useFirebaseDB();
  const { decks, loading } = useDecks();
  const [stats, setStats] = useState<StudyStats | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (!loading) {
      // Calculate stats from decks data
      const calculatedStats = {
        totalDecks: decks.length,
        totalCards: decks.reduce((acc, deck) => acc + (deck.cards?.length || 0), 0),
        totalReviews: decks.reduce((acc, deck) => acc + (deck.reviewCount || 0), 0),
        correctAnswers: decks.reduce((acc, deck) => acc + (deck.correctCount || 0), 0),
        incorrectAnswers: decks.reduce((acc, deck) => acc + (deck.incorrectCount || 0), 0),
        reviewedCards: decks.reduce((acc, deck) => acc + (deck.cards?.filter(card => typeof card === 'object' && card.reviewed).length || 0), 0),
        reviewSessions: decks.reduce((acc, deck) => acc + (deck.reviewSessions || 0), 0),
        cardsStudied: decks.reduce((acc, deck) => acc + (deck.cardsStudied || 0), 0),
        cardsMastered: decks.reduce((acc, deck) => acc + (deck.cardsMastered || 0), 0),
        studyStreak: decks.reduce((acc, deck) => acc + (deck.studyStreak || 0), 0),
        lastStudyDate: new Date().getTime(), // Convert to timestamp for number type
        accuracy: decks.reduce((acc, deck) => acc + (deck.correctCount || 0), 0) / Math.max(1, decks.reduce((acc, deck) => acc + (deck.reviewCount || 0), 0)),
        perfectReviews: decks.reduce((acc, deck) => acc + (deck.perfectReviews || 0), 0),
        cardsStudiedToday: decks.reduce((acc, deck) => acc + (deck.cardsStudiedToday || 0), 0),
        lastStreakCheck: new Date().getTime(), // Convert to timestamp for number type
        totalStudyTime: 0, // Placeholder value
        averageResponseTime: 0, // Placeholder value
      };
      setStats(calculatedStats);
    }
  }, [loading, decks]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <CreateDeckButton />
        </Box>
        
        <Grid container spacing={3}>
          {/* Stats Overview */}
          <Grid item xs={12} md={4}>
            <StatsOverview stats={stats} />
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <RecentActivity />
          </Grid>
          
          {/* Deck List */}
          <Grid item xs={12}>
            <DeckList />
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
