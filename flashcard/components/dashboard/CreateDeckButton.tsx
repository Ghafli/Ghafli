import React from 'react';
import { Button } from '@mui/material';

const CreateDeckButton: React.FC = () => {
  return (
    <Button variant="contained" color="primary" sx={{ mt: 3 }}>
      Create New Deck
    </Button>
  );
};

export default CreateDeckButton;
