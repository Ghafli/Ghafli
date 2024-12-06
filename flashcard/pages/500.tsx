import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import Image from 'next/image';

const ServerError = () => {
  const router = useRouter();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Image
          src="/images/500.svg"
          alt="500 illustration"
          width={300}
          height={300}
          priority
        />
        
        <Typography variant="h3" component="h1" gutterBottom>
          Internal Server Error
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Sorry! Something went wrong on our end. Please try again later.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.reload()}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ServerError;
