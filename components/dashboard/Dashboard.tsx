import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load dashboard components
const AchievementsSummary = dynamic(() => import('./AchievementsSummary'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const StudyStats = dynamic(() => import('./StudyStats'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const RecentDecks = dynamic(() => import('./RecentDecks'), {
  loading: () => <CircularProgress />,
  ssr: false
});

interface DashboardStats {
  totalCards: number;
  totalDecks: number;
  cardsStudied: number;
  studyTime: number;
}

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied?: Date;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

// Move StatCard outside of Dashboard component
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, decksResponse] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/decks/recent')
        ]);

        // Log response status for debugging
        console.log('Stats Response:', statsResponse.status);
        console.log('Decks Response:', decksResponse.status);

        if (!statsResponse.ok || !decksResponse.ok) {
          // Get error messages from responses
          const statsError = await statsResponse.text().catch(() => 'No error details');
          const decksError = await decksResponse.text().catch(() => 'No error details');
          
          console.error('Stats Error:', statsError);
          console.error('Decks Error:', decksError);
          
          throw new Error(`Failed to fetch data - Stats: ${statsResponse.status}, Decks: ${decksResponse.status}`);
        }

        const [statsData, decksData] = await Promise.all([
          statsResponse.json(),
          decksResponse.json()
        ]);

        setStats(statsData);
        setRecentDecks(decksData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values on error
        setStats({
          totalCards: 0,
          totalDecks: 0,
          cardsStudied: 0,
          studyTime: 0
        });
        setRecentDecks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome back, {session?.user?.name}!
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/flashcards/create')}
        >
          Create Flashcard
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cards"
            value={stats?.totalCards || 0}
            icon={<LibraryBooksIcon color="primary" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Decks"
            value={stats?.totalDecks || 0}
            icon={<LibraryBooksIcon color="secondary" />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cards Studied"
            value={stats?.cardsStudied || 0}
            icon={<SchoolIcon color="success" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Study Time (hrs)"
            value={((stats?.studyTime || 0) / 60).toFixed(1)}
            icon={<AssessmentIcon color="info" />}
            color="info.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<SchoolIcon />}
                onClick={() => router.push('/study')}
              >
                Start Studying
              </Button>
              <Button
                variant="outlined"
                startIcon={<LibraryBooksIcon />}
                onClick={() => router.push('/flashcards')}
              >
                View All Cards
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => router.push('/statistics')}
              >
                View Statistics
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Add recent activity component here */}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Study Stats */}
        <Grid item xs={12} md={8}>
          <Suspense fallback={<CircularProgress />}>
            <StudyStats
              totalStudyTime={stats?.studyTime || 0}
              cardsStudied={stats?.cardsStudied || 0}
            />
          </Suspense>
        </Grid>

        {/* Achievements Summary */}
        <Grid item xs={12} md={4}>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          }>
            <AchievementsSummary />
          </Suspense>
        </Grid>

        {/* Recent Decks */}
        <Grid item xs={12}>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          }>
            <RecentDecks decks={recentDecks} />
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
}
