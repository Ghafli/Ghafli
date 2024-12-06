import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Container, Typography, Box, Paper, Tab, Tabs } from '@mui/material';
import DeckDetails from '@/components/deck/DeckDetails';
import CardList from '@/components/deck/CardList';
import DeckStats from '@/components/deck/DeckStats';
import DeckActions from '@/components/deck/DeckActions';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import useDeck from '@/hooks/useDeck';

const DeckView: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const { deck, loading, error } = useDeck(id as string);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (loading) return <LoadingScreen />;
  if (error) return <div>Error: {error}</div>;

  if (!deck) {
    return (
      <DashboardLayout>
        <Container>
          <Typography>Deck not found</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {deck.title}
          </Typography>
          <DeckActions deckId={deck.id} />
        </Box>

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Cards" />
            <Tab label="Details" />
            <Tab label="Statistics" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <CardList deckId={deck.id} />}
            {activeTab === 1 && <DeckDetails deck={deck} />}
            {activeTab === 2 && <DeckStats deck={deck} />}
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default DeckView;
