import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button, Container, Typography, Box } from '@mui/material';
import { BugReport, Refresh } from '@mui/icons-material';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <BugReport color="error" sx={{ fontSize: 64 }} />
        
        <Typography variant="h4" gutterBottom>
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {error.message}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={resetErrorBoundary}
        >
          Try Again
        </Button>
        
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 4, textAlign: 'left', width: '100%' }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Error Details:
            </Typography>
            <pre style={{ 
              overflowX: 'auto', 
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              {error.stack}
            </pre>
          </Box>
        )}
      </Box>
    </Container>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

const ErrorBoundary = ({ children, onReset }: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
      onError={(error) => {
        // Log error to your error reporting service
        console.error('Error caught by boundary:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
