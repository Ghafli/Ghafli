import React from 'react';
import { Box, Typography } from '@mui/material';

interface DeckDetailsProps {
  deck: any;
}

const DeckDetails: React.FC<DeckDetailsProps> = ({ deck }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Deck Details
      </Typography>
      <Typography variant="body1">
        Here are the details of the deck.
      </Typography>
    </Box>
  );
};

export default DeckDetails;
