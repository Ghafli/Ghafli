import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    image: string;
  };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
  return (
    <Box component="form" sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={initialData.name}
      />
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        disabled
        value={initialData.email}
      />
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Save Changes
      </Button>
    </Box>
  );
};

export default ProfileForm;
