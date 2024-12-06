import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // You can handle auth state changes here
      console.log('Auth state changed:', user ? 'logged in' : 'logged out');
    });

    return () => unsubscribe();
  }, []);

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Component {...pageProps} />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
