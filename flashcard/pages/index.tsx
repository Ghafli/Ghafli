import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

// Dynamically import heavy components
const Grid = dynamic(() => import('@mui/material/Grid'));
const Paper = dynamic(() => import('@mui/material/Paper'));
const SchoolIcon = dynamic(() => import('@mui/icons-material/School'));
const TimerIcon = dynamic(() => import('@mui/icons-material/Timer'));
const TrophyIcon = dynamic(() => import('@mui/icons-material/EmojiEvents'));

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Hero Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h2" component="h1" gutterBottom>
              Master Any Subject with Smart Flashcards
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Enhance your learning with our intelligent spaced repetition system and achievement-based progress tracking.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/auth/signup"
                sx={{ mr: 2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/signin"
              >
                Sign In
              </Button>
            </Box>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Smart Learning System
                    </Typography>
                  </Box>
                  <Typography>
                    Our spaced repetition algorithm adapts to your learning pace for optimal retention.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimerIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Efficient Study Sessions
                    </Typography>
                  </Box>
                  <Typography>
                    Track your progress and optimize your study time with detailed analytics.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrophyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Achievement System
                    </Typography>
                  </Box>
                  <Typography>
                    Stay motivated with our gamified learning experience and unlock achievements.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
