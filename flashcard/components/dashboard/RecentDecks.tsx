import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Style as DeckIcon,
  PlayArrow as StudyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied?: Date;
}

interface RecentDecksProps {
  decks: Deck[];
}

const RecentDecks: React.FC<RecentDecksProps> = ({ decks = [] }) => {
  const router = useRouter();

  const handleStudyDeck = (deckId: string) => {
    router.push(`/study/${deckId}`);
  };

  const handleEditDeck = (deckId: string) => {
    router.push(`/decks/${deckId}/edit`);
  };

  const formatLastStudied = (date?: Date): string => {
    if (!date) return 'Never studied';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <DeckIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Recent Decks
          </Typography>
        </Box>

        {decks.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No decks created yet. Start by creating your first deck!
          </Typography>
        ) : (
          <List>
            {decks.map((deck, index) => (
              <React.Fragment key={deck._id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="study"
                        onClick={() => handleStudyDeck(deck._id)}
                        sx={{ mr: 1 }}
                      >
                        <StudyIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditDeck(deck._id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <DeckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={deck.title}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          {deck.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {deck.cardCount} cards • Last studied: {formatLastStudied(deck.lastStudied)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentDecks;
