import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { StudyStats } from '../../lib/db/types';
import { 
  Timeline as TimelineIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface StatsOverviewProps {
  stats: StudyStats | null;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color = 'primary.main' }) => (
  <Box sx={{ textAlign: 'center', p: 2 }}>
    <Box sx={{ color, mb: 1 }}>
      {icon}
    </Box>
    <Typography variant="h4" component="div" gutterBottom>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) {
    return (
      <Typography color="text.secondary" align="center">
        No stats available
      </Typography>
    );
  }

  const {
    totalCards = 0,
    cardsStudied = 0,
    studyStreak = 0,
    accuracy = 0
  } = stats;

  const accuracyPercentage = Math.round(accuracy * 100);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Study Statistics
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatItem
            icon={<TimelineIcon fontSize="large" />}
            label="Total Cards"
            value={totalCards.toLocaleString()}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatItem
            icon={<SchoolIcon fontSize="large" />}
            label="Cards Studied"
            value={cardsStudied.toLocaleString()}
            color="secondary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatItem
            icon={<TrendingUpIcon fontSize="large" />}
            label="Study Streak"
            value={`${studyStreak} days`}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatItem
            icon={<StarIcon fontSize="large" />}
            label="Accuracy"
            value={`${accuracyPercentage}%`}
            color="warning.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
