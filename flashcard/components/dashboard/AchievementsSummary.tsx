import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Button,
  Avatar,
} from '@mui/material';
import { useRouter } from 'next/router';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  progress: {
    current: number;
    target: number;
  };
  completed: boolean;
  icon: string;
}

export default function AchievementsSummary() {
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [nextAchievements, setNextAchievements] = useState<Achievement[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Get recently completed achievements
      const recentResponse = await fetch('/api/achievements?completed=true&limit=3');
      const recentData = await recentResponse.json();
      setRecentAchievements(recentData);

      // Get next achievements to complete
      const nextResponse = await fetch('/api/achievements?completed=false&limit=3');
      const nextData = await nextResponse.json();
      setNextAchievements(nextData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Achievements
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push('/achievements')}
          >
            View All
          </Button>
        </Box>

        {recentAchievements.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recently Completed
            </Typography>
            <Grid container spacing={2}>
              {recentAchievements.map((achievement) => (
                <Grid item xs={12} key={achievement._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {achievement.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {achievement.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                    <TrophyIcon sx={{ ml: 'auto', color: 'success.main' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {nextAchievements.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Next Goals
            </Typography>
            <Grid container spacing={2}>
              {nextAchievements.map((achievement) => (
                <Grid item xs={12} key={achievement._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'action.disabledBackground', mr: 2 }}>
                      {achievement.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.progress.current}/{achievement.progress.target}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(achievement.progress.current / achievement.progress.target) * 100}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {recentAchievements.length === 0 && nextAchievements.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">
              Start studying to earn achievements!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
