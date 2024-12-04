import React, { useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  LinearProgress, 
  Box, 
  CircularProgress, 
  Tooltip,
  Collapse,
  Alert
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { Achievement } from '../../lib/db/types';

interface AchievementsSummaryProps {
  achievements: { [key: string]: Achievement };
  newlyUnlocked: Achievement[];
}

const AchievementsSummary: React.FC<AchievementsSummaryProps> = ({ 
  achievements,
  newlyUnlocked
}) => {
  const sortedAchievements = React.useMemo(() => {
    return Object.values(achievements).sort((a, b) => {
      // First prioritize unlocked achievements
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      
      // Then sort by progress percentage
      const aProgress = (a.currentValue / a.requirement) * 100;
      const bProgress = (b.currentValue / b.requirement) * 100;
      if (aProgress !== bProgress) return bProgress - aProgress;
      
      // Finally sort by name
      return a.name.localeCompare(b.name);
    });
  }, [achievements]);

  const getProgress = React.useCallback((achievement: Achievement) => {
    return Math.min(
      Math.round((achievement.currentValue / achievement.requirement) * 100),
      100
    );
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <EmojiEvents color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Achievements</Typography>
      </Box>

      <Collapse in={newlyUnlocked.length > 0}>
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
        >
          {newlyUnlocked.length === 1 
            ? `New achievement unlocked: ${newlyUnlocked[0].name}!`
            : `${newlyUnlocked.length} new achievements unlocked!`}
        </Alert>
      </Collapse>

      {sortedAchievements.length === 0 ? (
        <Typography color="text.secondary" align="center" py={3}>
          Start studying to unlock achievements!
        </Typography>
      ) : (
        <List>
          {sortedAchievements.map((achievement) => {
            const progress = getProgress(achievement);
            const isComplete = achievement.unlockedAt != null;

            return (
              <ListItem key={achievement.id}>
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Tooltip title={achievement.description}>
                      <Typography 
                        variant="subtitle2" 
                        color={isComplete ? 'success.main' : 'text.primary'}
                        sx={{ fontWeight: isComplete ? 600 : 400 }}
                      >
                        {achievement.name}
                      </Typography>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.currentValue}/{achievement.requirement}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: isComplete ? 'success.main' : 'primary.main',
                      },
                    }}
                  />
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

export default AchievementsSummary;
