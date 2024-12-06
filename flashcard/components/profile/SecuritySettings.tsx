import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const SecuritySettings: React.FC = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
        Change Password
      </Button>
    </Box>
  );
};

export default SecuritySettings;
