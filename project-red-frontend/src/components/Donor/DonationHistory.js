import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import { donationService } from '../../services/donations';
import HealthAnalysis from '../Common/HealthAnalysis'; // Import the HealthAnalysis component

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      const response = await donationService.getDonations();
      setDonations(response.data.results || response.data);
    } catch (error) {
      setError('Failed to fetch donation history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) return <Typography>Loading donation history...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Donation History
      </Typography>

      {donations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No donation history yet.</Typography>
          <Typography variant="body2" color="textSecondary">
            Your blood donation history will appear here once you start donating.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {donations.map((donation) => (
              <ListItem key={donation.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Donation for {donation.patient_name || 'Unknown Patient'}
                      </Typography>
                      <Chip
                        label={donation.status}
                        color={getStatusColor(donation.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Patient Blood Type:</strong> {donation.patient_blood_group || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Hospital:</strong> {donation.hospital_name || 'Not assigned'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {donation.donation_date ? new Date(donation.donation_date).toLocaleDateString() : 'Not scheduled'}
                      </Typography>
                      {donation.blood_test && (
                        <Typography variant="body2" color="primary">
                          <strong>Blood Test Completed:</strong> Yes
                        </Typography>
                      )}
                      {donation.life_saved && (
                        <Typography variant="body2" color="error">
                          <strong>Life Saved:</strong> Yes 🎉
                        </Typography>
                      )}
                      {/* Add the HealthAnalysis component to the donation history item */}
                      {donation.blood_test && (
                        <Box sx={{ mt: 2 }}>
                          <HealthAnalysis bloodTest={donation.blood_test} />
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default DonationHistory;
