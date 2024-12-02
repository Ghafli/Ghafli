import { AppBar, Toolbar, IconButton, Typography, Button, Box, useTheme } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4, 
  Brightness7, 
  AccountCircle,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onMenuClick: () => void;
}

export default function Header({ isDarkMode, onThemeToggle, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();

  const isHomePage = router.pathname === '/';
  const showBackButton = !isHomePage;

  const handleBack = () => {
    router.back();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {showBackButton ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => router.push('/')}
        >
          Ghafli
        </Typography>

        <IconButton color="inherit" onClick={onThemeToggle}>
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

        {session ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                color: theme.palette.text.secondary,
              }}
            >
              {session.user?.email}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              sx={{ ml: 1 }}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        ) : (
          <Button 
            color="inherit" 
            onClick={() => router.push('/auth/signin')}
            sx={{ ml: 1 }}
          >
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
