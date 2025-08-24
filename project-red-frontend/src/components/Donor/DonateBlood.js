import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { donationService } from '../../services/donations';
import { hospitalService } from '../../services/hospitals';
import { chatService } from '../../services/chat';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DonateBlood = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch blood requests and hospitals on mount
  useEffect(() => {
    fetchData();
    fetchHospitals();
  }, []);

  // Fetch available blood requests
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/available-blood-requests/');
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching blood requests:', err);
      if (err.response?.status === 400 && err.response?.data?.error === 'Please update your location first') {
        setError('Please update your location to see available blood requests');
      } else {
        setError('Failed to fetch blood requests: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospital list (if needed)
  const fetchHospitals = async () => {
    try {
      const hospitalData = await hospitalService.getHospitals();
      setHospitals(hospitalData.results || hospitalData);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  };

  const getCurrentLocation = () => {
    setShowLocationDialog(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(location);
          updateUserLocation(location);
        },
        (err) => {
          setError('Unable to get your location: ' + err.message);
          setShowLocationDialog(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setShowLocationDialog(false);
    }
  };

  const updateUserLocation = async (location) => {
    try {
      await api.patch(`/users/${currentUser.id}/`, {
        location_lat: location.lat,
        location_long: location.lng
      });
      setShowLocationDialog(false);
      setSuccess('Location updated successfully!');
      setTimeout(fetchData, 1000);
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update location: ' + (err.response?.data?.detail || err.message));
      setShowLocationDialog(false);
    }
  };

  // Find existing chat room
  const findChatRoomForDonation = async (donationId) => {
    try {
      const res = await api.get('/chat-rooms/');
      const rooms = res.data.results || res.data;
      const room = rooms.find(r => r.donation === donationId);
      return room ? room.id : null;
    } catch (err) {
      console.error('Error finding chat room:', err);
      return null;
    }
  };

  // Create chat room if it doesn't exist
  const createChatRoomIfMissing = async (donationId) => {
    try {
      const existingRoomId = await findChatRoomForDonation(donationId);
      if (existingRoomId) return existingRoomId;
      const newRoom = await chatService.createChatRoomForDonation(donationId);
      return newRoom.id;
    } catch (err) {
      console.error('Error creating chat room:', err);
      throw new Error('Failed to create chat room: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Core accept request logic
  const handleAcceptRequest = async (requestId, requestLat, requestLng) => {
    try {
      setError('');
      setSuccess('');

      if (!userLocation) {
        setError('Please update your location first');
        return;
      }

      const distance = calculateDistance(userLocation.lat, userLocation.lng, requestLat, requestLng);
      if (distance > 20) {
        setError(`You are ${distance.toFixed(2)} km away from this blood request (more than 20 km)`);
        return;
      }

      // Check or create donation
      let donation;
      try {
        const resp = await api.get('/donations/');
        const donations = resp.data.results || resp.data;
        donation = donations.find(d => d.blood_request === requestId && d.donor === currentUser.id);

        if (!donation) {
          const newDonResp = await donationService.createDonation({ blood_request: requestId });
          donation = newDonResp.data;
        }
      } catch (err) {
        console.error('Error handling donation:', err);
        setError('Failed to process donation: ' + (err.response?.data?.detail || err.message));
        return;
      }

      // If already accepted or in progress
      if (donation.status !== 'pending') {
        try {
          const roomId = await createChatRoomIfMissing(donation.id);
          setSuccess('Donation already accepted. Redirecting to chat room...');
          setTimeout(() => navigate(`/chat-room/${roomId}`), 2000);
        } catch (err) {
          setError('Failed to create chat room: ' + err.message);
        }
        return;
      }

      // Accept donation
      try {
        const acceptResp = await api.post(`/donations/${donation.id}/accept/`, {
          donor_lat: userLocation.lat,
          donor_lng: userLocation.lng
        });

        await api.patch(`/blood-requests/${requestId}/`, { status: 'donating' });
        let roomId = acceptResp.data.chat_room_id;

        if (!roomId) {
          roomId = await createChatRoomIfMissing(donation.id);
        }

        setSuccess('Donation accepted successfully! Redirecting to chat room...');
        setTimeout(() => navigate(`/chat-room/${roomId}`), 2000);
      } catch (acceptError) {
        if (acceptError.response?.data?.error === 'Donation has already been processed') {
          try {
            const roomId = await createChatRoomIfMissing(donation.id);
            setSuccess('Donation already accepted. Redirecting to chat room...');
            setTimeout(() => navigate(`/chat-room/${roomId}`), 2000);
          } catch (err) {
            setError('Failed to create chat room: ' + err.message);
          }
        } else {
          throw acceptError;
        }
      }
    } catch (err) {
      console.error('Full error details:', err.response);
      setError('Failed to accept donation: ' + (err.response?.data?.detail || err.message || 'Unknown error'));
    }
  };

  if (loading) return <Typography>Loading blood requests...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🩸 Available Blood Requests (Within 20 km)
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={getCurrentLocation} sx={{ mr: 2 }} color="primary">
          📍 Update My Location
        </Button>
        <Typography variant="body2" color="textSecondary">
          {userLocation
            ? `Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
            : 'Location not set. Please update your location to see available blood requests.'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {requests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            {userLocation
              ? 'No blood requests matching your blood group are currently available within 20 km.'
              : 'Please update your location to see available blood requests.'}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" color="primary">
            Found {requests.length} blood request{requests.length > 1 ? 's' : ''} matching your blood type within 20 km
          </Typography>
          {requests.map((req) => (
            <Card key={req.id} variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      🚨 Blood Request for {req.blood_group}
                    </Typography>
                    <Typography color="textSecondary">
                      {req.units_required} unit{req.units_required > 1 ? 's' : ''} required • {req.urgency} urgency
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Reason:</strong> {req.reason}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Patient:</strong> {req.patient_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Distance:</strong> {req.distance} km away
                    </Typography>
                    <Typography variant="body2">
                      <strong>Requested:</strong> {new Date(req.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={req.urgency}
                    color={
                      req.urgency === 'Critical' ? 'error' :
                      req.urgency === 'High' ? 'warning' :
                      'default'
                    }
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleAcceptRequest(req.id, req.location_lat, req.location_long)}
                  sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                >
                  {req.status === 'donating' ? 'Continue to Chat' : '✅ Accept Donation'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={showLocationDialog} onClose={() => setShowLocationDialog(false)}>
        <DialogTitle>Getting Your Location</DialogTitle>
        <DialogContent>
          <Typography>Please allow location access to find nearby blood requests.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLocationDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Distance helper
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default DonateBlood;
