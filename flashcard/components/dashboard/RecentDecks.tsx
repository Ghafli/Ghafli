import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DeckCard from '../deck/DeckCard';
import { getData } from '../../lib/db/utils';
import { Deck } from '../../lib/db/types';
import { auth } from '../../lib/firebase';

const CACHE_KEY = 'recent-decks-cache-v1';
const CACHE_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds

interface CacheData {
  decks: Deck[];
  timestamp: number;
}

export default function RecentDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const router = useRouter();

  const getCachedDecks = useCallback((): CacheData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (err) {
      console.warn('Cache read error:', err);
    }
    return null;
  }, []);

  const cacheDecks = useCallback((decks: Deck[]) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        decks,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn('Cache write error:', err);
    }
  }, []);

  const fetchDecks = useCallback(async (options: { showLoading?: boolean } = {}) => {
    const { showLoading = true } = options;

    if (!auth.currentUser) {
      setError('Please sign in to view your decks');
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const fetchedDecks = await getData<Deck[]>('decks');
      
      if (!Array.isArray(fetchedDecks)) {
        throw new Error('Invalid decks data');
      }

      // Sort decks by last studied date and limit to 6 most recent
      const sortedDecks = [...fetchedDecks]
        .sort((a, b) => {
          const dateA = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
          const dateB = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 6);

      setDecks(sortedDecks);
      cacheDecks(sortedDecks);
      setError(null);

    } catch (err: any) {
      console.error('Error fetching decks:', err);

      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(
          () => fetchDecks({ showLoading: false }), 
          RETRY_DELAY * Math.pow(2, retryCount)
        );
        return;
      }

      setError(err.message || 'Failed to load decks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [retryCount, cacheDecks]);

  useEffect(() => {
    const cachedData = getCachedDecks();
    if (cachedData) {
      setDecks(cachedData.decks);
      setLoading(false);
      // Fetch fresh data in background
      fetchDecks({ showLoading: false }).catch(console.error);
    } else {
      fetchDecks();
    }
  }, [fetchDecks, getCachedDecks]);

  const handleCreateDeck = () => {
    router.push('/decks/new');
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchDecks();
  };

  const handleDeckClick = (deckId: string) => {
    router.push(`/decks/${deckId}`);
  };

  if (loading && decks.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((key) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Recent Decks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDeck}
        >
          Create Deck
        </Button>
      </Box>

      {error ? (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
              disabled={loading}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : loading && decks.length > 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : decks.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No decks found. Create your first deck to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {decks.map((deck) => (
            <Grid item xs={12} sm={6} md={4} key={deck.id}>
              <DeckCard 
                deck={deck} 
                onClick={handleDeckClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {decks.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/decks')}
          >
            View All Decks
          </Button>
        </Box>
      )}
    </Box>
  );
}
