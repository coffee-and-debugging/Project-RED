import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';


const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <BloodtypeIcon sx={{ mr: 1 }} />
          Project RED
        </Typography>
        
        {currentUser ? (
          <Box>
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
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
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
                Profile
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
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;