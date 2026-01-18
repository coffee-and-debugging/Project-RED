import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  Avatar,
  Divider,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationService } from '../../services/notifications';
import api from '../../services/api';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchUnreadNotifications();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile/');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      const notifications = response.data.results || response.data;
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const getProfilePicture = () => {
    if (userProfile?.profile_picture_url) {
      return userProfile.profile_picture_url;
    }
    return null;
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return currentUser?.username || 'User';
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navItems = currentUser ? [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Blood Requests', path: '/blood-requests', icon: <BloodtypeIcon /> },
    ...(currentUser?.is_donor ? [{ label: 'Donate Blood', path: '/donate-blood', icon: <VolunteerActivismIcon /> }] : []),
    ...(currentUser?.is_recipient ? [{ label: 'Request Blood', path: '/request-blood', icon: <FavoriteIcon /> }] : []),
    { label: 'Hospitals', path: '/hospitals', icon: <LocalHospitalIcon /> },
    { label: 'Chats', path: '/chat-rooms', icon: <ChatIcon /> },
  ] : [];

  const authItems = [
    { label: 'Login', path: '/login', icon: <LoginIcon /> },
    { label: 'Register', path: '/register', icon: <PersonAddIcon /> },
    { label: 'Hospital Login', path: '/hospital-login', icon: <LocalHospitalIcon /> },
    { label: 'Hospital Register', path: '/hospital-register', icon: <LocalHospitalIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BloodtypeIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Project RED
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />

      {currentUser ? (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <Avatar
                src={getProfilePicture()}
                sx={{
                  width: 44,
                  height: 44,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                {!getProfilePicture() && <AccountCircle />}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{getDisplayName()}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {userProfile?.blood_group || 'Blood group not set'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <List sx={{ px: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActivePath(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.16),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActivePath(item.path) ? theme.palette.primary.main : 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActivePath(item.path) ? 600 : 400,
                      color: isActivePath(item.path) ? theme.palette.primary.main : 'inherit'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <List sx={{ px: 1 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/profile')} sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
                <ListItemText primary="Edit Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: theme.palette.error.main }}>
                <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 40 }}><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      ) : (
        <List sx={{ px: 1 }}>
          {authItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActivePath(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 70 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              mr: 4,
            }}
            onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.common.white, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.25),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <BloodtypeIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Project RED
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isActivePath(item.path) ? alpha(theme.palette.common.white, 0.15) : 'transparent',
                    fontWeight: isActivePath(item.path) ? 600 : 400,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {!isMobile && !currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  px: 2.5,
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  px: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.95),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: theme.palette.common.white,
                  },
                }}
              >
                Register
              </Button>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: alpha(theme.palette.common.white, 0.3) }} />
              <Button
                color="inherit"
                onClick={() => navigate('/hospital-login')}
                startIcon={<LocalHospitalIcon />}
                sx={{
                  px: 2,
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
                }}
              >
                Hospital
              </Button>
            </Box>
          )}

          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
                  }}
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{
                    p: 0.5,
                    '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
                  }}
                >
                  <Avatar
                    src={getProfilePicture()}
                    sx={{
                      width: 36,
                      height: 36,
                      border: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                    }}
                    alt={getDisplayName()}
                  >
                    {!getProfilePicture() && <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 220,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={getProfilePicture()}
                      sx={{ width: 40, height: 40 }}
                      alt={getDisplayName()}
                    >
                      {!getProfilePicture() && <AccountCircle />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{getDisplayName()}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {userProfile?.blood_group && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          >
                            {userProfile.blood_group}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }} sx={{ py: 1.5 }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  Edit Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
                  <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
