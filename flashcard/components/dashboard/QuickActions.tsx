import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import { Add, PlayArrow, Assessment } from '@mui/icons-material';

const QuickActions: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Stack spacing={2}>
        <Button
          variant="contained"
          startIcon={<Add />}
          fullWidth
        >
          Create New Deck
        </Button>
        <Button
          variant="outlined"
          startIcon={<PlayArrow />}
          fullWidth
        >
          Start Study Session
        </Button>
        <Button
          variant="outlined"
          startIcon={<Assessment />}
          fullWidth
        >
          View Statistics
        </Button>
      </Stack>
    </Paper>
  );
};

export default QuickActions;
