import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Container, Grid, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase';
import { getData } from '../../lib/db/utils';
import { StudyStats, UserProfile } from '../../lib/db/types';
import useAchievements from '../../lib/hooks/useAchievements';
import RecentDecks from './RecentDecks';
import StatsOverview from './StatsOverview';
import AchievementsPanel from './AchievementsPanel';
import { useErrorBoundary } from 'react-error-boundary';

interface DashboardError {
  message: string;
  code?: string;
  retryable: boolean;
}

interface DashboardState {
  stats: StudyStats | null;
  profile: UserProfile | null;
  loading: boolean;
  error: DashboardError | null;
  lastUpdated: number | null;
}

const CACHE_KEY = 'dashboard-cache-v1';
const CACHE_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds
const REFRESH_INTERVAL = 60000; // 1 minute

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    stats: null,
    profile: null,
    loading: true,
    error: null,
    lastUpdated: null
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const router = useRouter();
  const { showBoundary } = useErrorBoundary();
  const { achievements, loading: achievementsLoading, error: achievementsError } = useAchievements();

  const getCachedData = useCallback(() => {
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

  const cacheData = useCallback((data: { stats: StudyStats; profile: UserProfile }) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn('Cache write error:', err);
    }
  }, []);

  const createError = useCallback((err: any): DashboardError => {
    console.error('Dashboard error:', err);

    if (err.code === 'PERMISSION_DENIED') {
      return {
        message: 'You do not have permission to view this dashboard',
        code: err.code,
        retryable: false
      };
    }
    
    if (err.code === 'AUTH_ERROR') {
      return {
        message: 'Please sign in to view your dashboard',
        code: err.code,
        retryable: false
      };
    }
    
    if (err.code === 'NETWORK_ERROR') {
      return {
        message: 'Network error. Please check your connection',
        code: err.code,
        retryable: true
      };
    }

    return {
      message: 'Failed to load dashboard data. Please try again',
      code: err.code,
      retryable: true
    };
  }, []);

  const fetchDashboardData = useCallback(async (options: { 
    showLoading?: boolean; 
    background?: boolean;
  } = {}) => {
    const { showLoading = true, background = false } = options;

    if (!auth.currentUser) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: 'Please sign in to view your dashboard',
          code: 'AUTH_ERROR',
          retryable: false
        }
      }));
      return;
    }

    try {
      if (showLoading) {
        setState(prev => ({ ...prev, loading: true }));
      }
      if (!background) {
        setState(prev => ({ ...prev, error: null }));
      }

      const [statsData, profileData] = await Promise.all([
        getData<StudyStats>('stats'),
        getData<UserProfile>('profile')
      ]);

      if (!statsData || !profileData) {
        throw new Error('Invalid dashboard data');
      }

      setState(prev => ({
        ...prev,
        stats: statsData,
        profile: profileData,
        error: null,
        loading: false,
        lastUpdated: Date.now()
      }));

      cacheData({ stats: statsData, profile: profileData });

    } catch (err: any) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(
          () => fetchDashboardData({ showLoading: false }), 
          RETRY_DELAY * Math.pow(2, retryCount)
        );
        return;
      }

      const error = createError(err);
      setState(prev => ({ ...prev, error, loading: false }));
      
      if (error.code === 'PERMISSION_DENIED' || error.code === 'AUTH_ERROR') {
        showBoundary(err);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [retryCount, createError, showBoundary, cacheData]);

  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setState(prev => ({
        ...prev,
        stats: cachedData.stats,
        profile: cachedData.profile,
        loading: false,
        lastUpdated: cachedData.timestamp
      }));
      // Fetch fresh data in background
      fetchDashboardData({ showLoading: false, background: true }).catch(console.error);
    } else {
      fetchDashboardData();
    }

    const refreshInterval = setInterval(() => {
      if (!isRefreshing && !state.error?.retryable === false) {
        setIsRefreshing(true);
        fetchDashboardData({ showLoading: false, background: true }).catch(console.error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData, getCachedData, isRefreshing, state.error]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setState(prev => ({ ...prev, error: null }));
    fetchDashboardData();
  }, [fetchDashboardData]);

  const welcomeMessage = useMemo(() => {
    if (!state.profile) return 'Welcome back!';
    const hour = new Date().getHours();
    const name = state.profile.displayName || 'there';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  }, [state.profile]);

  if (state.loading && !state.stats && !state.profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {state.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={state.error.retryable && (
            <Button 
              color="inherit" 
              size="small"
              onClick={handleRetry}
              disabled={state.loading}
            >
              Retry
            </Button>
          )}
        >
          {state.error.message}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        {welcomeMessage}
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            {state.loading && !state.stats ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <StatsOverview stats={state.stats} />
            )}
          </Paper>
        </Grid>

        {/* Achievements Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            {achievementsLoading ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : achievementsError ? (
              <Alert severity="error">
                Failed to load achievements
              </Alert>
            ) : (
              <AchievementsPanel achievements={achievements} />
            )}
          </Paper>
        </Grid>

        {/* Recent Decks */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <RecentDecks />
          </Paper>
        </Grid>
      </Grid>

      {state.lastUpdated && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}
        </Typography>
      )}
    </Container>
  );
}
