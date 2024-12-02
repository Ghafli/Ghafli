import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Stars as StarsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface Achievement {
  _id: string;
  type: string;
  level: number;
  name: string;
  description: string;
  progress: {
    current: number;
    target: number;
  };
  completed: boolean;
  completedAt?: string;
  icon: string;
  reward: {
    type: 'XP' | 'BADGE' | 'THEME';
    value: any;
  };
}

export default function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'XP':
        return <StarsIcon sx={{ color: 'warning.main' }} />;
      case 'BADGE':
        return <TrophyIcon sx={{ color: 'success.main' }} />;
      case 'THEME':
        return '🎨';
      default:
        return null;
    }
  };

  const getRewardText = (reward: { type: string; value: any }) => {
    switch (reward.type) {
      case 'XP':
        return `${reward.value} XP`;
      case 'BADGE':
        return 'Special Badge';
      case 'THEME':
        return 'New Theme';
      default:
        return '';
    }
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const progress = (achievement.progress.current / achievement.progress.target) * 100;
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          position: 'relative',
          opacity: achievement.completed ? 1 : 0.7,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
            cursor: 'pointer',
          },
        }}
        onClick={() => setSelectedAchievement(achievement)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" component="span" sx={{ mr: 2 }}>
              {achievement.icon}
            </Typography>
            <Box>
              <Typography variant="h6" gutterBottom>
                {achievement.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {achievement.description}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress: {achievement.progress.current} / {achievement.progress.target}
              </Typography>
              <Tooltip title={getRewardText(achievement.reward)}>
                <Box>{getRewardIcon(achievement.reward.type)}</Box>
              </Tooltip>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: achievement.completed ? 'success.main' : 'primary.main',
                },
              }}
            />
          </Box>

          {achievement.completed && (
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                bottom: 8,
                right: 8,
                color: 'success.main',
              }}
            >
              Completed {new Date(achievement.completedAt!).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  const AchievementDialog = () => (
    <Dialog 
      open={!!selectedAchievement} 
      onClose={() => setSelectedAchievement(null)}
      maxWidth="sm"
      fullWidth
    >
      {selectedAchievement && (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h3" component="span" sx={{ mr: 2 }}>
                {selectedAchievement.icon}
              </Typography>
              {selectedAchievement.name}
            </Box>
            <IconButton onClick={() => setSelectedAchievement(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography paragraph>
              {selectedAchievement.description}
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(selectedAchievement.progress.current / selectedAchievement.progress.target) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedAchievement.progress.current} / {selectedAchievement.progress.target}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Reward
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getRewardIcon(selectedAchievement.reward.type)}
                <Typography sx={{ ml: 1 }}>
                  {getRewardText(selectedAchievement.reward)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedAchievement(null)}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading achievements...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Achievements
      </Typography>

      <Grid container spacing={3}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement._id}>
            <AchievementCard achievement={achievement} />
          </Grid>
        ))}
      </Grid>

      <AchievementDialog />
    </Box>
  );
}
