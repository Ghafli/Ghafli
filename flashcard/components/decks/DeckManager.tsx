import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  lastStudied: string;
}

export default function DeckManager() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, deck: Deck) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeck(deck);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedDeck(null);
  };

  const handleCreateDeck = async () => {
    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckName,
          description: deckDescription,
        }),
      });
      
      if (response.ok) {
        fetchDecks();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleEditDeck = async () => {
    if (!editingDeck) return;

    try {
      const response = await fetch(`/api/decks/${editingDeck.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckName,
          description: deckDescription,
        }),
      });
      
      if (response.ok) {
        fetchDecks();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error updating deck:', error);
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;

    try {
      const response = await fetch(`/api/decks/${selectedDeck.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchDecks();
        handleCloseMenu();
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const handleExportDeck = async () => {
    if (!selectedDeck) return;

    try {
      const response = await fetch(`/api/decks/${selectedDeck.id}/export`);
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDeck.name}-flashcards.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      handleCloseMenu();
    } catch (error) {
      console.error('Error exporting deck:', error);
    }
  };

  const handleImportDeck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        const response = await fetch('/api/decks/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          fetchDecks();
        }
      } catch (error) {
        console.error('Error importing deck:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleOpenDialog = (deck?: Deck) => {
    if (deck) {
      setEditingDeck(deck);
      setDeckName(deck.name);
      setDeckDescription(deck.description);
    } else {
      setEditingDeck(null);
      setDeckName('');
      setDeckDescription('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDeck(null);
    setDeckName('');
    setDeckDescription('');
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          My Decks
        </Typography>
        <Box>
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            id="import-deck"
            onChange={handleImportDeck}
          />
          <label htmlFor="import-deck">
            <Button
              component="span"
              startIcon={<UploadIcon />}
              sx={{ mr: 2 }}
            >
              Import
            </Button>
          </label>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Deck
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {decks.map((deck) => (
          <Grid item xs={12} sm={6} md={4} key={deck.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {deck.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {deck.description}
                    </Typography>
                  </Box>
                  <IconButton onClick={(e) => handleOpenMenu(e, deck)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {deck.cardCount} cards
                  </Typography>
                  {deck.lastStudied && (
                    <Typography variant="body2" color="text.secondary">
                      Last studied: {new Date(deck.lastStudied).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          handleCloseMenu();
          handleOpenDialog(selectedDeck!);
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleExportDeck}>
          <DownloadIcon sx={{ mr: 1 }} /> Export
        </MenuItem>
        <MenuItem onClick={handleDeleteDeck} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDeck ? 'Edit Deck' : 'Create New Deck'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Deck Name"
            fullWidth
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={editingDeck ? handleEditDeck : handleCreateDeck}
            variant="contained"
          >
            {editingDeck ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
