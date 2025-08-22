import React from 'react';
import { Container, Typography, Paper, Grid, Box, Card, CardContent } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Welcome, {currentUser?.first_name} {currentUser?.last_name}!
            </Typography>
            <Typography variant="body1">
              Blood Group: {currentUser?.blood_group}
            </Typography>
            <Typography variant="body1">
              Role: {currentUser?.is_donor ? 'Donor' : ''} {currentUser?.is_recipient ? 'Recipient' : ''}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {currentUser?.is_recipient && (
                  <Typography variant="body2">
                    • <a href="/request-blood" style={{ textDecoration: 'none' }}>Request Blood</a>
                  </Typography>
                )}
                {currentUser?.is_donor && (
                  <Typography variant="body2">
                    • <a href="/donate-blood" style={{ textDecoration: 'none' }}>Donate Blood</a>
                  </Typography>
                )}
                <Typography variant="body2">
                  • <a href="/hospitals" style={{ textDecoration: 'none' }}>Find Hospitals</a>
                </Typography>
                <Typography variant="body2">
                  • <a href="/profile" style={{ textDecoration: 'none' }}>Update Profile</a>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;