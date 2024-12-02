import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Timeline,
  School,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';

interface StudyStats {
  totalCards: number;
  cardsStudied: number;
  totalStudyTime: number;
  averageAccuracy: number;
  streak: number;
  dueCards: number;
  reviewProgress: number;
}

export default function StudyAnalytics() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching study statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography color="text.secondary" align="center">
        No study data available
      </Typography>
    );
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 1,
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Study Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Cards Studied"
            value={stats.cardsStudied}
            icon={<School sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Study Streak"
            value={`${stats.streak} days`}
            icon={<Timeline sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Average Accuracy"
            value={`${stats.averageAccuracy}%`}
            icon={<TrendingUp sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Study Time"
            value={`${Math.round(stats.totalStudyTime / 60)} mins`}
            icon={<AccessTime sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={stats.reviewProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {stats.reviewProgress}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {stats.dueCards} cards due for review
        </Typography>
      </Paper>
    </Box>
  );
}
