import React from 'react';
import { Box, Typography } from '@mui/material';

const RecentActivity: React.FC = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Typography variant="body1">
        No recent activity.
      </Typography>
    </Box>
  );
};

export default RecentActivity;
