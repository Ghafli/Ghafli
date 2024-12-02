import { useState, useEffect } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Typography,
  IconButton,
  Paper,
  Slide,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  reward: {
    type: string;
    value: any;
  };
}

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="up" />;
}

export default function AchievementNotification() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    checkRecentAchievements();
  }, []);

  const checkRecentAchievements = async () => {
    try {
      const response = await fetch('/api/achievements/recent');
      const data = await response.json();
      
      if (data.length > 0) {
        setAchievements(data);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error fetching recent achievements:', error);
    }
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setOpen(false);
      setCurrentIndex(0);
      setAchievements([]);
    }
  };

  const getRewardText = (reward: { type: string; value: any }) => {
    switch (reward.type) {
      case 'XP':
        return `+${reward.value} XP`;
      case 'BADGE':
        return 'New Badge Unlocked!';
      case 'THEME':
        return 'New Theme Unlocked!';
      default:
        return '';
    }
  };

  if (!open || achievements.length === 0) {
    return null;
  }

  const currentAchievement = achievements[currentIndex];

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
    >
      <Paper 
        elevation={6}
        sx={{
          minWidth: 300,
          maxWidth: 400,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 1,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle2">
            Achievement Unlocked!
          </Typography>
          <IconButton
            size="small"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h3" component="span" sx={{ mr: 2 }}>
              {currentAchievement.icon}
            </Typography>
            <Box>
              <Typography variant="subtitle1">
                {currentAchievement.name}
              </Typography>
              <Typography variant="body2" color="success.main">
                {getRewardText(currentAchievement.reward)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {currentAchievement.description}
          </Typography>
        </Box>
      </Paper>
    </Snackbar>
  );
}
