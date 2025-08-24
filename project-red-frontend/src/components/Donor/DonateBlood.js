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

  useEffect(() => {
    fetchData();
    fetchHospitals();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch available blood requests that match the donor's blood type and location
      const response = await api.get('/available-blood-requests/');
      setRequests(response.data);
      
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      if (error.response?.status === 400 && error.response?.data?.error === 'Please update your location first') {
        setError('Please update your location to see available blood requests');
      } else {
        setError('Failed to fetch blood requests: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      // Use the hospital service to get coordinates
      const hospitalData = await hospitalService.getHospitals();
      setHospitals(hospitalData.results || hospitalData);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const getCurrentLocation = () => {
    setShowLocationDialog(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Update user location in backend
          updateUserLocation(location);
        },
        (error) => {
          setError('Unable to get your location: ' + error.message);
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
      
      // Refresh data after updating location
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location: ' + (error.response?.data?.detail || error.message));
      setShowLocationDialog(false);
    }
  };

  const findBestHospital = (donorLat, donorLng) => {
    if (!hospitals || hospitals.length === 0) return null;
    
    let bestHospital = null;
    let minDistance = Infinity;
    
    hospitals.forEach(hospital => {
      if (hospital.location_lat && hospital.location_long) {
        const distance = calculateDistance(
          donorLat, donorLng,
          hospital.location_lat, hospital.location_long
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          bestHospital = hospital;
        }
      }
    });
    
    return bestHospital;
  };

  const handleAcceptRequest = async (requestId, requestLat, requestLng) => {
    try {
      setError('');
      setSuccess('');
      
      if (!userLocation) {
        setError('Please update your location first');
        return;
      }
      
      // Calculate distance to request
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        requestLat, requestLng
      );
      
      if (distance > 20) {
        setError(`You are ${distance.toFixed(2)} km away from this blood request (more than 20km)`);
        return;
      }
      
      // Find the best hospital
      const bestHospital = findBestHospital(userLocation.lat, userLocation.lng);
      
      // Create donation
      const donationData = {
        blood_request: requestId,
        hospital: bestHospital ? bestHospital.id : null
      };
      
      const donation = await donationService.createDonation(donationData);
      
      // Update blood request status to "donating"
      await api.patch(`/blood-requests/${requestId}/`, {
        status: 'donating'
      });
      
      // Create chat room
      const chatRoomResponse = await api.post('/chat-rooms/', {
        donation: donation.id,
        donor: currentUser.id,
        patient: donation.blood_request.patient
      });
      
      setSuccess('Donation accepted successfully! Redirecting to chat room...');
      
      // Redirect to chat room
      setTimeout(() => {
        navigate(`/chat-room/${chatRoomResponse.data.id}`);
      }, 2000);
      
    } catch (error) {
      setError('Failed to accept donation: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) return <Typography>Loading blood requests...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🩸 Available Blood Requests (Within 20km)
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={getCurrentLocation}
          sx={{ mr: 2 }}
          color="primary"
        >
          📍 Update My Location
        </Button>
        <Typography variant="body2" color="textSecondary">
          {userLocation 
            ? `Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
            : 'Location not set. Please update your location to see available blood requests.'
          }
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {requests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            {userLocation
              ? 'No blood requests matching your blood group are currently available within 20km.'
              : 'Please update your location to see available blood requests.'
            }
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" color="primary">
            Found {requests.length} blood request(s) matching your blood type within 20km
          </Typography>
          {requests.map((request) => (
            <Card key={request.id} variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      🚨 Blood Request for {request.blood_group}
                    </Typography>
                    <Typography color="textSecondary">
                      {request.units_required} unit(s) required • {request.urgency} urgency
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Reason:</strong> {request.reason}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Patient:</strong> {request.patient_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Distance:</strong> {request.distance} km away
                    </Typography>
                    <Typography variant="body2">
                      <strong>Requested:</strong> {new Date(request.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip 
                    label={request.urgency} 
                    color={
                      request.urgency === 'Critical' ? 'error' : 
                      request.urgency === 'High' ? 'warning' : 'default'
                    } 
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleAcceptRequest(request.id, request.location_lat, request.location_long)}
                  disabled={request.status !== 'pending'}
                  sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                >
                  ✅ Accept Donation
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

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default DonateBlood;