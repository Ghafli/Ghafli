import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Replay as ReplayIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

export default function StudyResults() {
  const router = useRouter();
  const theme = useTheme();
  const { mode, correct, incorrect, time } = router.query;

  const totalCards = Number(correct) + Number(incorrect);
  const accuracy = totalCards > 0 ? (Number(correct) / totalCards) * 100 : 0;
  const formattedTime = Number(time) >= 60
    ? `${Math.floor(Number(time) / 60)}m ${Number(time) % 60}s`
    : `${Number(time)}s`;

  const StatBox = ({ title, value, icon, color }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box sx={{ color, mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Study Session Complete!
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
        {mode?.toString().charAt(0).toUpperCase() + mode?.toString().slice(1)} Mode
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <StatBox
            title="Correct Answers"
            value={correct}
            icon={<CheckCircleIcon fontSize="large" />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatBox
            title="Incorrect Answers"
            value={incorrect}
            icon={<CancelIcon fontSize="large" />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatBox
            title="Time Spent"
            value={formattedTime}
            icon={<TimerIcon fontSize="large" />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 4, 
          textAlign: 'center',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Accuracy Rate
        </Typography>
        <Typography variant="h3">
          {accuracy.toFixed(1)}%
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<ReplayIcon />}
          onClick={() => router.push('/study')}
        >
          Study Again
        </Button>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
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
    props: {},
  };
};
