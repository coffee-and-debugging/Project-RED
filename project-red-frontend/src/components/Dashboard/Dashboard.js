import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import {
  Bloodtype as BloodtypeIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Notifications from '../Common/Notifications';
import DonationHistory from '../Donor/DonationHistory';

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
            Here's your blood donation dashboard. You can view your notifications, donation history, and account information.
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
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Notifications />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DonationHistory />
        </TabPanel>
      </Paper>

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