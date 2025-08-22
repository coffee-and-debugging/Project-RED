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
  Alert
} from '@mui/material';
import { donationService } from '../../services/donations';
import { requestService } from '../../services/requests';
import { useAuth } from '../../contexts/AuthContext';

const DonateBlood = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests();
      // Filter requests that match donor's blood group and are pending
      const filteredRequests = (response.results || []).filter(
        request => request.blood_group === currentUser?.blood_group && request.status === 'pending'
      );
      setRequests(filteredRequests);
    } catch (error) {
      setError('Failed to fetch blood requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setError('');
      setSuccess('');
      const donation = await donationService.createDonation({
        blood_request: requestId
      });
      
      // Accept the donation
      await donationService.acceptDonation(donation.id);
      setSuccess('Donation accepted successfully!');
      fetchRequests(); // Refresh the list
    } catch (error) {
      setError('Failed to accept donation: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Blood Requests
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {requests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No blood requests matching your blood group ({currentUser?.blood_group}) are currently available.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {requests.map((request) => (
            <Card key={request.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      {request.patient_name} needs {request.blood_group} blood
                    </Typography>
                    <Typography color="textSecondary">
                      {request.units_required} unit(s) required • {request.urgency} urgency
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Reason: {request.reason}
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
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={request.status !== 'pending'}
                >
                  Accept Donation
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default DonateBlood;