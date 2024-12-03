import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
  lastReviewed?: Date;
  nextReview?: Date;
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [decks, setDecks] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flashcardsRes, decksRes] = await Promise.all([
          fetch('/api/flashcards'),
          fetch('/api/decks')
        ]);
        
        const flashcardsData = await flashcardsRes.json();
        const decksData = await decksRes.json();
        
        setFlashcards(flashcardsData);
        setDecks(decksData.map((deck: any) => deck.name));
        
        // Extract unique tags
        const tags = new Set<string>();
        flashcardsData.forEach((card: Flashcard) => {
          card.tags?.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDeck = selectedDeck === 'all' || card.deck === selectedDeck;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => card.tags?.includes(tag));
    
    return matchesSearch && matchesDeck && matchesTags;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlashcards(prev => prev.filter(card => card._id !== id));
      } else {
        throw new Error('Failed to delete flashcard');
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      // Handle error (show error message to user)
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          My Flashcards
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/flashcards/create')}
        >
          Create Flashcard
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search flashcards"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Deck</InputLabel>
              <Select
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
                label="Deck"
              >
                <MenuItem value="all">All Decks</MenuItem>
                {decks.map(deck => (
                  <MenuItem key={deck} value={deck}>{deck}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              size="small"
              options={allTags}
              value={selectedTags}
              onChange={(_, newValue) => setSelectedTags(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Select tags" />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Showing {filteredFlashcards.length} of {flashcards.length} flashcards
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {filteredFlashcards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom noWrap>
                  {card.front}
                </Typography>
                <Typography color="text.secondary" noWrap>
                  {card.back}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Deck: {card.deck}
                </Typography>
                {card.tags?.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {card.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/flashcards/${card._id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(card._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredFlashcards.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No flashcards yet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Create your first flashcard to start learning!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/flashcards/create')}
          >
            Create Flashcard
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
