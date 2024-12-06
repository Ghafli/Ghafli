import { Box, LinearProgress, Typography } from '@mui/material';

interface StudyProgressProps {
  current: number;
  total: number;
}

const StudyProgress = ({ current, total }: StudyProgressProps) => {
  const progress = (current / total) * 100;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Progress
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {current} / {total} cards
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
        sx={{ mt: 1 }}
      >
        {Math.round(progress)}% Complete
      </Typography>
    </Box>
  );
};

export default StudyProgress;
