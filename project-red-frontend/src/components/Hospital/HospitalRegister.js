import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const HospitalRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone_number: '',
    location_lat: '',
    location_long: '',
    username: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'name' && value) {
      const generated = value.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 30);
      setGeneratedUsername(generated);
      if (!formData.username || formData.username === generatedUsername) {
        setFormData(prev => ({
          ...prev,
          username: generated
        }));
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location_lat: position.coords.latitude,
            location_long: position.coords.longitude
          });
        },
        (error) => {
          setError('Unable to get your location: ' + error.message);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setFieldErrors({});
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/hospital-auth/register/', formData);
      
      setSuccess(`Hospital registered successfully! Your username is: ${response.data.username}`);
      setError('');
      setFieldErrors({});
      
      setTimeout(() => {
        navigate('/hospital-login');
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        const newFieldErrors = {};
        Object.keys(error.response.data).forEach(field => {
          if (error.response.data[field] && Array.isArray(error.response.data[field])) {
            newFieldErrors[field] = error.response.data[field][0];
          }
        });
        setFieldErrors(newFieldErrors);
        
        if (error.response.data.non_field_errors) {
          setError(error.response.data.non_field_errors[0]);
        } else if (Object.keys(newFieldErrors).length > 0) {
          const firstErrorKey = Object.keys(newFieldErrors)[0];
          setError(`${firstErrorKey}: ${newFieldErrors[firstErrorKey]}`);
        } else {
          setError('Registration failed. Please check your inputs.');
        }
      } else {
        setError('Failed to register hospital. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🏥 Hospital Registration
        </Typography>
        
        <Paper elevation={3} sx={{ padding: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="name"
                  label="Hospital Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.name)}
                  helperText={fieldErrors.name || ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.address)}
                  helperText={fieldErrors.address || ''}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="phone_number"
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.phone_number)}
                  helperText={fieldErrors.phone_number || ''}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  onClick={getCurrentLocation}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  📍 Use Current Location
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="location_lat"
                  label="Latitude"
                  type="number"
                  value={formData.location_lat}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.location_lat)}
                  helperText={fieldErrors.location_lat || ''}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="location_long"
                  label="Longitude"
                  type="number"
                  value={formData.location_long}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.location_long)}
                  helperText={fieldErrors.location_long || ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  helperText={generatedUsername ? `Suggested: ${generatedUsername}` : 'Will be used for login'}
                  error={Boolean(fieldErrors.username)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password || 'Minimum 8 characters'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirm_password"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.confirm_password)}
                  helperText={fieldErrors.confirm_password || ''}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
              >
                {loading ? 'Registering...' : 'Register Hospital'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/hospital-login')}
                size="large"
              >
                Already Registered? Login
              </Button>
            </Box>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                <Link to="/" style={{ textDecoration: 'none' }}>
                  ← Back to Main Site
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HospitalRegister;