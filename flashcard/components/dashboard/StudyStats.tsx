import React from 'react';
import { useStudyStats } from '../../lib/hooks/useStudyStats';
import { Box, Paper, Typography, Grid, CircularProgress, Skeleton, Tooltip } from '@mui/material';
import { School, Timer, TrendingUp, Event } from '@mui/icons-material';

interface StudyStatsProps {
  stats?: {
    cardsStudied: number;
    studyTime: number;
    successRate: number;
  };
}

const StudyStats: React.FC<StudyStatsProps> = () => {
  const { stats, loading, error, getFormattedStats } = useStudyStats();
  
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Study Statistics</Typography>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Skeleton variant="circular" width={24} height={24} sx={{ mb: 1 }} />
                <Skeleton width={80} height={20} sx={{ mb: 1 }} />
                <Skeleton width={60} height={32} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error">Failed to load study statistics</Typography>
      </Paper>
    );
  }

  const formattedStats = getFormattedStats();
  if (!formattedStats) return null;

  const statItems = [
    {
      icon: <School />,
      label: 'Cards Studied',
      value: formattedStats.totalCards.toString(),
      tooltip: 'Total number of cards you have studied'
    },
    {
      icon: <Timer />,
      label: 'Study Time',
      value: formattedStats.totalTime,
      tooltip: 'Total time spent studying'
    },
    {
      icon: <TrendingUp />,
      label: 'Success Rate',
      value: formattedStats.successRate,
      tooltip: 'Percentage of correct answers'
    },
    {
      icon: <Event />,
      label: 'Last Study',
      value: formattedStats.lastStudy,
      tooltip: 'Last time you studied'
    }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Study Statistics</Typography>
      <Grid container spacing={3}>
        {statItems.map((item, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Tooltip title={item.tooltip} arrow>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                textAlign="center"
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <Box 
                  color="primary.main" 
                  mb={1}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="h6">
                  {item.value}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default StudyStats;
