import { ReactNode, useState, useEffect } from 'react';
import { Box, Container, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import Navigation from './Navigation';
import { lightTheme, darkTheme } from '../../styles/theme';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Only access window/document after component is mounted
  useEffect(() => {
    setMounted(true);
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Prevent SSR flash
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Container 
          component="main" 
          maxWidth="lg"
          sx={{ 
            flex: 1,
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
