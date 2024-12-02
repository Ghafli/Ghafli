import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
}

interface FlashcardListProps {
  flashcards: Flashcard[];
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: string) => void;
}

export default function FlashcardList({ flashcards, onEdit, onDelete }: FlashcardListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cardId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCard(cardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCard(null);
  };

  const filteredFlashcards = flashcards.filter(card =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.deck.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search flashcards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredFlashcards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.deck}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, card._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                  {card.front}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                  {card.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            const card = flashcards.find(c => c._id === selectedCard);
            if (card) {
              onEdit(card);
            }
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedCard) {
              onDelete(selectedCard);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
