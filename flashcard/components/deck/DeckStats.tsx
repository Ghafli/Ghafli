import React from 'react';
import { Box, Typography } from '@mui/material';

interface DeckStatsProps {
  deck: any;
}

const DeckStats: React.FC<DeckStatsProps> = ({ deck }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Deck Statistics
      </Typography>
      <Typography variant="body1">
        Here are some statistics about the deck.
      </Typography>
    </Box>
  );
};

export default DeckStats;
