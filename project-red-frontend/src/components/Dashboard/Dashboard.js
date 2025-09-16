import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Bloodtype as BloodtypeIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  HealthAndSafety as HealthIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Notifications from '../Common/Notifications';
import DonationHistory from '../Donor/DonationHistory';
import api from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [healthPredictions, setHealthPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthPredictions();
  }, []);

  const fetchHealthPredictions = async () => {
    try {
      setLoading(true);
      // Fetch donations with blood tests
      const response = await api.get('/donations/?expand=blood_test');
      const donations = response.data.results || response.data;
      
      // Extract health predictions from completed blood tests
      const predictions = donations
        .filter(donation => donation.blood_test && donation.blood_test.health_risk_prediction)
        .map(donation => ({
          id: donation.blood_test.id,
          donationDate: donation.donation_date,
          hospital: donation.hospital_name,
          prediction: donation.blood_test.health_risk_prediction,
          summary: donation.blood_test.disease_prediction,
          confidence: donation.blood_test.prediction_confidence,
          fullData: donation.blood_test
        }));
      
      setHealthPredictions(predictions);
    } catch (error) {
      console.error('Error fetching health predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const viewPredictionDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setPredictionDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {currentUser?.first_name} {currentUser?.last_name}!
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Here's your blood donation dashboard. You can view your notifications, donation history, health predictions, and account information.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BloodtypeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Blood Profile</Typography>
              </Box>
              <Typography variant="body2">
                <strong>Blood Type:</strong> {currentUser?.blood_group || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Age:</strong> {currentUser?.age || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {currentUser?.is_donor ? 'Donor' : ''} {currentUser?.is_recipient ? 'Recipient' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<HistoryIcon />} label="Donation History" />
          <Tab icon={<HealthIcon />} label="Health Predictions" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Notifications />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DonationHistory />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Typography>Loading health predictions...</Typography>
          ) : healthPredictions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No health predictions available yet.</Typography>
              <Typography variant="body2" color="textSecondary">
                Your health predictions will appear here after your blood tests are analyzed.
              </Typography>
            </Paper>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Health Predictions
              </Typography>
              {healthPredictions.map((prediction) => (
                <Card key={prediction.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => viewPredictionDetails(prediction)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Blood Test Analysis - {new Date(prediction.donationDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Hospital: {prediction.hospital || 'Unknown'}
                        </Typography>
                        {prediction.summary && (
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {prediction.summary}
                          </Typography>
                        )}
                        {prediction.confidence && (
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Confidence: {prediction.confidence}%
                          </Typography>
                        )}
                      </Box>
                      <Button variant="outlined" size="small">
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Health Prediction Dialog */}
      <Dialog open={predictionDialogOpen} onClose={() => setPredictionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Blood Test Analysis - {selectedPrediction && new Date(selectedPrediction.donationDate).toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          {selectedPrediction && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedPrediction.prediction}
              </Typography>
              {selectedPrediction.confidence && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Confidence Level:</strong> {selectedPrediction.confidence}%
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Actions Section */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/request-blood'}>
            <CardContent>
              <BloodtypeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Request Blood</Typography>
              <Typography variant="body2" color="textSecondary">
                Need blood? Create a request
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/donate-blood'}>
            <CardContent>
              <BloodtypeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Donate Blood</Typography>
              <Typography variant="body2" color="textSecondary">
                Help others by donating blood
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/hospitals'}>
            <CardContent>
              <BloodtypeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Find Hospitals</Typography>
              <Typography variant="body2" color="textSecondary">
                Locate nearby hospitals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/profile'}>
            <CardContent>
              <BloodtypeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">My Profile</Typography>
              <Typography variant="body2" color="textSecondary">
                Update your information
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;