import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Button
} from '@mui/material';
import { requestService } from '../../services/requests';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BloodRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests();
      setRequests(response.results || []);
    } catch (error) {
      setError('Failed to fetch blood requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blood Requests
        </Typography>
        {currentUser?.is_recipient && (
          <Button
            variant="contained"
            onClick={() => navigate('/request-blood')}
          >
            New Request
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.patient_name}</TableCell>
                <TableCell>
                  <Chip label={request.blood_group} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{request.units_required}</TableCell>
                <TableCell>
                  <Chip 
                    label={request.urgency} 
                    color={
                      request.urgency === 'Critical' ? 'error' : 
                      request.urgency === 'High' ? 'warning' : 'default'
                    } 
                  />
                </TableCell>
                <TableCell>
                  <Chip label={request.status} color={getStatusColor(request.status)} />
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {requests.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography>No blood requests found.</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default BloodRequestsList;