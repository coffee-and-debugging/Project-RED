import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { hospitalApi } from '../../services/api';

const HospitalLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const response = await hospitalApi.post('/hospital-auth/login/', formData);
      
      localStorage.setItem('hospital_access_token', response.data.access);
      localStorage.setItem('hospital_refresh_token', response.data.refresh);
      localStorage.setItem('hospital_user', JSON.stringify(response.data.hospital_user));
      
      navigate('/hospital-dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        if (error.response.data.non_field_errors) {
          setError(error.response.data.non_field_errors[0]);
        } else if (error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError('Invalid username or password');
        }
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetError('');
      setResetMessage('');
      setResetLoading(true);
      await hospitalApi.post('/hospital-password-reset/request/', { email: resetEmail });
      setResetMessage('Password reset link has been sent to your email');
      setResetEmail('');
    } catch (error) {
      if (error.response?.data?.email) {
        setResetError(error.response.data.email[0]);
      } else if (error.response?.data?.error) {
        setResetError(error.response.data.error);
      } else {
        setResetError('Failed to send reset email: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            🏥 Hospital Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Hospital Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              helperText="Use the username you created during registration"
              error={Boolean(error)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(error)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                component={Link}
                to="/hospital-register"
                variant="text"
                size="small"
              >
                Don't have an account? Register Hospital
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot Password?
              </Button>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                component={Link}
                to="/"
                variant="text"
                size="small"
              >
                ← Back to Main Site
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <DialogTitle>Reset Hospital Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your hospital account email address and we'll send you a link to reset your password.
          </Typography>
          {resetMessage && <Alert severity="success" sx={{ mb: 2 }}>{resetMessage}</Alert>}
          {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={resetLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)} disabled={resetLoading}>
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} disabled={resetLoading}>
            {resetLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HospitalLogin;