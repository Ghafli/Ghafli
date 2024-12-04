import React from 'react';
import { Box, Typography } from '@mui/material';
import { Achievement } from '../../lib/db/types';

interface AchievementsPanelProps {
  achievements: { [key: string]: Achievement };
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  return (
    <Box>
      <Typography variant="h6">Achievements Panel</Typography>
      {/* Render achievements here */}
    </Box>
  );
};

export default AchievementsPanel;
