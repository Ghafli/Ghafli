import React from 'react';
import { Box, List, ListItem, ListItemText } from '@mui/material';

const DeckList: React.FC = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <List>
        <ListItem>
          <ListItemText primary="Deck 1" secondary="Deck description" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Deck 2" secondary="Deck description" />
        </ListItem>
      </List>
    </Box>
  );
};

export default DeckList;
