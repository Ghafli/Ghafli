import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { TimerOutlined, MenuBookOutlined, CalendarTodayOutlined } from '@mui/icons-material';

interface StudyStatsProps {
  totalStudyTime: number;
  cardsStudied: number;
  lastStudySession?: Date;
}

const StudyStats: React.FC<StudyStatsProps> = ({ totalStudyTime, cardsStudied, lastStudySession }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  const formatLastStudyDate = (date?: Date): string => {
    if (!date) return 'No sessions yet';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimerOutlined sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Study Time
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatTime(totalStudyTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total time spent studying
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MenuBookOutlined sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Cards Studied
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {cardsStudied}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total cards reviewed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CalendarTodayOutlined sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Last Session
                </Typography>
              </Box>
              <Typography variant="h4" color="primary" sx={{ fontSize: '1.75rem' }}>
                {formatLastStudyDate(lastStudySession)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most recent study session
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudyStats;
