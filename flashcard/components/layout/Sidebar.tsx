import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  IconButton,
  Box,
} from '@mui/material';
import {
  Home,
  LibraryBooks,
  School,
  Assessment,
  Settings,
  ChevronLeft,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'My Flashcards', icon: <LibraryBooks />, path: '/flashcards' },
    { text: 'Study', icon: <School />, path: '/study' },
    { text: 'Statistics', icon: <Assessment />, path: '/statistics' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        p: 1,
      }}>
        <IconButton onClick={onClose}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              backgroundColor: 
                router.pathname === item.path 
                  ? theme.palette.action.selected 
                  : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
