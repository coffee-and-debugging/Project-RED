import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    blood_group: '',
    age: '',
    gender: '',
    address: '',
    phone_number: '',
    allergies: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile/');
      const userData = response.data;
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        blood_group: userData.blood_group || '',
        age: userData.age || '',
        gender: userData.gender || '',
        address: userData.address || '',
        phone_number: userData.phone_number || '',
        allergies: userData.allergies || ''
      });

      if (userData.profile_picture_url) {
        setProfilePictureUrl(userData.profile_picture_url);
      }
    } catch (error) {
      setError('Failed to load profile: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePictureUrl(previewUrl);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePictureUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      if (profilePicture) {
        submitData.append('profile_picture', profilePicture);
      } else if (profilePictureUrl === '') {
        submitData.append('profile_picture', '');
      }

      const response = await api.patch(
        `/users/${currentUser.id}/update_profile/`,
        submitData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSuccess('Profile updated successfully!');

      // Update local storage
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update profile picture URL from backend
      if (response.data.profile_picture_url) {
        setProfilePictureUrl(response.data.profile_picture_url);
      } else {
        setProfilePictureUrl('');
      }

      setProfilePicture(null);

      // Refresh user in auth context
      if (refreshUser) {
        await refreshUser();
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.values(errorData).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(error.response.data.detail || 'Failed to update profile');
        }
      } else {
        setError('Failed to update profile: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/users/${currentUser.id}/change_password/`, passwordData);
      setSuccess('Password changed successfully!');
      setChangePasswordOpen(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });

      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.old_password) setError(errors.old_password);
        else if (errors.new_password) setError(errors.new_password);
        else if (errors.confirm_password) setError(errors.confirm_password);
        else if (errors.detail) setError(errors.detail);
        else setError('Failed to change password');
      } else {
        setError('Failed to change password: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayPictureUrl = profilePictureUrl;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        👤 My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Profile Picture */}
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={displayPictureUrl}
                  sx={{ width: 120, height: 120, margin: '0 auto 16px', border: '3px solid #d32f2f' }}
                />
                {displayPictureUrl && (
                  <IconButton
                    sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    onClick={removeProfilePicture}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
              
              <Button 
                variant="outlined" 
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mt: 1 }}
              >
                Change Photo
                <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} />
              </Button>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                JPG, PNG recommended. Max 5MB.
              </Typography>
            </Grid>

            {/* Personal Information */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select name="blood_group" label="Blood Group" value={formData.blood_group} onChange={handleChange}>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="age" label="Age" type="number" value={formData.age} onChange={handleChange} inputProps={{ min: 18, max: 65 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select name="gender" label="Gender" value={formData.gender} onChange={handleChange}>
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="O">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth name="address" label="Address" multiline rows={2} value={formData.address} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="phone_number" label="Phone Number" value={formData.phone_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="allergies" label="Allergies" value={formData.allergies} onChange={handleChange} placeholder="List any allergies separated by commas" />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button type="submit" variant="contained" disabled={loading} size="large">
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button variant="outlined" onClick={() => setChangePasswordOpen(true)} size="large">
              Change Password
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth margin="normal" name="old_password" label="Current Password" type="password" value={passwordData.old_password} onChange={handlePasswordChange} required />
            <TextField fullWidth margin="normal" name="new_password" label="New Password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} required helperText="Minimum 8 characters" />
            <TextField fullWidth margin="normal" name="confirm_password" label="Confirm New Password" type="password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={loading || !passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password}>
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
