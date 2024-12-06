import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography
        variant="h6"
        sx={{ mt: 2, color: 'text.secondary' }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
