import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

export default function NavigationBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();

  const isHomePage = router.pathname === '/';
  const showBackButton = !isHomePage;

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ backgroundColor: theme.palette.background.paper }}>
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBack}
            sx={{ mr: 2, color: theme.palette.text.primary }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <IconButton
          color="inherit"
          aria-label="home"
          onClick={handleHome}
          sx={{ mr: 2, color: theme.palette.text.primary }}
        >
          <HomeIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: theme.palette.text.primary }}
        >
          Ghafli
        </Typography>

        {session ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {session.user?.email}
            </Typography>
            <Button color="inherit" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
