import { ReactNode, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useRouter } from '@tanstack/react-router';
import { userCustomRouter } from '@/utils';

export interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout(props: LayoutProps) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const router = userCustomRouter(useRouter());
  const baseRouter = useRouter();
  const drawerWidth = 240;

  const home = () => {
    setOpenDrawer(false);
    router.navigate({ to: '/' });
  };
  const iaps = () => {
    setOpenDrawer(false);
    router.navigate({ to: '/iaps' });
  };

  const handleDrawerToggle = () => {
    setOpenDrawer((prevState) => !prevState);
  };

  const logout = () => baseRouter.navigate({ to: '/logout' });

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Section: Navigation Links */}
      <Box>
        <Toolbar />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={home}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={iaps}>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="IAPs" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Bottom Section: User Info and Sign Off */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="body1" gutterBottom>
            TestUser
          </Typography>
          <IconButton onClick={props.toggleDarkMode} color="inherit">
            {props.darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Button variant="outlined" fullWidth onClick={logout}>
          Log Off
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            id={'logo'}
            onClick={home}
            sx={{ cursor: 'pointer' }}
          >
            Inven!RA
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={openDrawer}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 7, // Offset for the mobile AppBar
          mb: 4,
          ml: 4,
          mr: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 0,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
}
