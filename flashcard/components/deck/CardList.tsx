import React from 'react';
import { Box, List, ListItem, ListItemText } from '@mui/material';

interface CardListProps {
  deckId: string;
}

const CardList: React.FC<CardListProps> = ({ deckId }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <List>
        <ListItem>
          <ListItemText primary="Card 1" secondary="Card description" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Card 2" secondary="Card description" />
        </ListItem>
      </List>
    </Box>
  );
};

export default CardList;
