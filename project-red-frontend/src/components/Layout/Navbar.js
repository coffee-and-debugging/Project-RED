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
  Avatar
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notifications';
import api from '../../services/api';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
    await logout();
    navigate('/login');
  };

  // Get profile picture URL or use default
  const getProfilePicture = () => {
    if (userProfile?.profile_picture_url) {
      return userProfile.profile_picture_url;
    }
    return null;
  };

  // Get user's display name
  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return currentUser?.username || 'User';
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <BloodtypeIcon sx={{ mr: 1 }} />
          Project RED
        </Typography>

        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={() => navigate('/blood-requests')}>
              Blood Requests
            </Button>
            {currentUser?.is_donor && (
              <Button color="inherit" onClick={() => navigate('/donate-blood')}>
                Donate Blood
              </Button>
            )}
            {currentUser?.is_recipient && (
              <Button color="inherit" onClick={() => navigate('/request-blood')}>
                Request Blood
              </Button>
            )}
            <Button 
              color="inherit" 
              onClick={() => navigate('/hospitals')}
              startIcon={<LocalHospitalIcon />}
            >
              Hospitals
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/chat-rooms')}
              startIcon={<ChatIcon />}
            >
              Chats
            </Button>

            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/dashboard')}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              {getProfilePicture() ? (
                <Avatar 
                  src={getProfilePicture()} 
                  sx={{ width: 32, height: 32 }}
                  alt={getDisplayName()}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getProfilePicture() ? (
                    <Avatar 
                      src={getProfilePicture()} 
                      sx={{ width: 24, height: 24 }}
                      alt={getDisplayName()}
                    />
                  ) : (
                    <AccountCircle sx={{ fontSize: 24 }} />
                  )}
                  <Box>
                    <Typography variant="subtitle2">{getDisplayName()}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {userProfile?.blood_group || 'No blood group'}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
            <Button color="inherit" onClick={() => navigate('/hospital-login')}>
              Hospital Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/hospital-register')}>
              Hospital Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;