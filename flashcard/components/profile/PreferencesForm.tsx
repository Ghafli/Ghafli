import React from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';

const PreferencesForm: React.FC = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Preferences
      </Typography>
      <FormControlLabel
        control={<Switch />}
        label="Enable Notifications"
      />
      <FormControlLabel
        control={<Switch />}
        label="Dark Mode"
      />
    </Box>
  );
};

export default PreferencesForm;
