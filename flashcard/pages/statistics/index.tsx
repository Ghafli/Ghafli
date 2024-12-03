import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface StudyStats {
  totalCards: number;
  cardsStudied: number;
  totalStudyTime: number;
  averageAccuracy: number;
  studyStreak: number;
  recentActivity: Array<{
    date: string;
    action: string;
    details: string;
  }>;
  weeklyProgress: Array<{
    day: string;
    cardsStudied: number;
  }>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" color="error" sx={{ mt: 4 }}>
          Failed to load statistics
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Learning Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Cards Studied
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.cardsStudied || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                out of {stats?.totalCards || 0} cards
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimerIcon color="secondary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Study Time
                </Typography>
              </Box>
              <Typography variant="h4">
                {Math.round((stats?.totalStudyTime || 0) / 60)} hrs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total time spent studying
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Accuracy
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.averageAccuracy || 0}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Average correct answers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Streak
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.studyStreak || 0} days</Typography>
              <Typography variant="body2" color="text.secondary">
                Current study streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {activity.details}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < stats.recentActivity.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No recent activity to display
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Weekly Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Progress
            </Typography>
            {stats?.weeklyProgress && stats.weeklyProgress.length > 0 ? (
              <List>
                {stats.weeklyProgress.map((progress, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${progress.cardsStudied} cards studied`}
                        secondary={new Date(progress.day).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      />
                    </ListItem>
                    {index < stats.weeklyProgress.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No weekly progress data available
              </Typography>
            )}
          </Paper>
        </Grid>
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
