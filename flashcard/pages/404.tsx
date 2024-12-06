import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import Image from 'next/image';

const NotFound = () => {
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
          src="/images/404.svg"
          alt="404 illustration"
          width={300}
          height={300}
          priority
        />
        
        <Typography variant="h3" component="h1" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Oops! The page you are looking for doesn't exist.
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
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
