import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

interface Deck {
  name: string;
  cardCount: number;
  lastStudied?: Date;
}

interface StudyModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  mode: string;
}

export default function StudyPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('/api/flashcards/decks');
        const data = await response.json();
        setDecks(data);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  const StudyModeCard: React.FC<StudyModeCardProps> = ({ title, description, icon, mode }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          transition: 'all 0.3s ease',
        },
      }}
      onClick={() => router.push(`/study/${mode}`)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Study Mode
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StudyModeCard
            title="Learn"
            description="Review cards at your own pace with detailed explanations"
            icon={<SchoolIcon color="primary" fontSize="large" />}
            mode="learn"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StudyModeCard
            title="Quiz"
            description="Test your knowledge with randomized questions"
            icon={<QuizIcon color="secondary" fontSize="large" />}
            mode="quiz"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StudyModeCard
            title="Review"
            description="Focus on cards you need to practice more"
            icon={<RefreshIcon color="info" fontSize="large" />}
            mode="review"
          />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Your Decks
      </Typography>

      <Grid container spacing={3}>
        {decks.map((deck) => (
          <Grid item xs={12} sm={6} md={4} key={deck.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {deck.name}
                </Typography>
                <Typography color="text.secondary">
                  {deck.cardCount} cards
                </Typography>
                {deck.lastStudied && (
                  <Typography variant="body2" color="text.secondary">
                    Last studied: {new Date(deck.lastStudied).toLocaleDateString()}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => router.push(`/study/learn?deck=${deck.name}`)}
                >
                  Study Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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
