import React from 'react';
import { Box, Button } from '@mui/material';

interface DeckActionsProps {
  deckId: string;
}

const DeckActions: React.FC<DeckActionsProps> = ({ deckId }) => {
  return (
    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
      <Button variant="contained" color="primary">
        Edit Deck
      </Button>
      <Button variant="outlined" color="secondary">
        Delete Deck
      </Button>
    </Box>
  );
};

export default DeckActions;
