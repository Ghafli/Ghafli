import { Box, Button, Typography, Paper } from '@mui/material';
import { Refresh, ArrowBack } from '@mui/icons-material';

interface StudyCompleteProps {
  deckId: string;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
  };
  onRestart: () => void;
  onExit: () => void;
}

const StudyComplete = ({ stats, onRestart, onExit }: StudyCompleteProps) => {
  const percentage = Math.round((stats.correct / stats.total) * 100);

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Study Session Complete!
      </Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h2" color="primary" gutterBottom>
          {percentage}%
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Accuracy Rate
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          Total Cards: {stats.total}
        </Typography>
        <Typography variant="body1" color="success.main" gutterBottom>
          Correct: {stats.correct}
        </Typography>
        <Typography variant="body1" color="error.main" gutterBottom>
          Incorrect: {stats.incorrect}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRestart}
        >
          Study Again
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onExit}
        >
          Back to Deck
        </Button>
      </Box>
    </Paper>
  );
};

export default StudyComplete;
