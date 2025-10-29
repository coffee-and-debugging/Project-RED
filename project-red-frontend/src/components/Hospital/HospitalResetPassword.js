import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { hospitalApi } from '../../services/api';

const HospitalResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  
  const navigate = useNavigate();
  const { uid, token } = useParams();

  useEffect(() => {
    setValidToken(true); // Assume it's valid
    setCheckingToken(false);
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await hospitalApi.post('/hospital-password-reset/confirm/', {
        token: `${uid}/${token}`,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      setMessage('Password reset successfully! You can now login with your new password.');
      setTimeout(() => navigate('/hospital-login'), 3000);
    } catch (error) {
      setError('Failed to reset password: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return <Typography>Checking reset token...</Typography>;
  }

  if (!validToken) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Alert severity="error">Invalid or expired password reset link</Alert>
            <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/hospital-login')}>
              Back to Hospital Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Reset Hospital Password
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/hospital-login')}
              disabled={loading}
            >
              Back to Hospital Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HospitalResetPassword;