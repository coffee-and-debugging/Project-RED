import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hospital-tabpanel-${index}`}
      aria-labelledby={`hospital-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const HospitalDashboard = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [bloodTestDialog, setBloodTestDialog] = useState(false);
  const [editTestDialog, setEditTestDialog] = useState(false);
  const [bloodTestData, setBloodTestData] = useState({
    sugar_level: '',
    uric_acid_level: '',
    wbc_count: '',
    rbc_count: '',
    hemoglobin: '',
    platelet_count: '',
    life_saved: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitalData();
    fetchDonors();
  }, []);

  useEffect(() => {
    // Filter donors based on selected tab
    if (tabValue === 0) {
      // Pending tests (no blood test or scheduled status)
      setFilteredDonors(donors.filter(donor => 
        !donor.blood_test_exists || donor.donation_status === 'scheduled'
      ));
    } else {
      // Completed tests
      setFilteredDonors(donors.filter(donor => 
        donor.blood_test_exists && donor.donation_status === 'completed'
      ));
    }
  }, [donors, tabValue]);

  const fetchHospitalData = () => {
    const hospitalUser = JSON.parse(localStorage.getItem('hospital_user'));
    setHospitalInfo(hospitalUser?.hospital);
  };

  // Update the fetchDonors function
  const fetchDonors = async () => {
    try {
      const response = await hospitalApi.get('/hospital-dashboard/donors/');
      setDonors(response.data);
    } catch (error) {
      console.error('Error fetching donors:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch donors: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_access_token');
    localStorage.removeItem('hospital_refresh_token');
    localStorage.removeItem('hospital_user');
    navigate('/hospital-login');
  };

  const openBloodTestDialog = (donor) => {
    setSelectedDonor(donor);
    setBloodTestData({
      sugar_level: '',
      uric_acid_level: '',
      wbc_count: '',
      rbc_count: '',
      hemoglobin: '',
      platelet_count: '',
      life_saved: false
    });
    setBloodTestDialog(true);
  };

  const openEditTestDialog = (donor) => {
    setSelectedDonor(donor);
    if (donor.blood_test) {
      setBloodTestData({
        sugar_level: donor.blood_test.sugar_level || '',
        uric_acid_level: donor.blood_test.uric_acid_level || '',
        wbc_count: donor.blood_test.wbc_count || '',
        rbc_count: donor.blood_test.rbc_count || '',
        hemoglobin: donor.blood_test.hemoglobin || '',
        platelet_count: donor.blood_test.platelet_count || '',
        life_saved: donor.blood_test.life_saved || false
      });
    }
    setEditTestDialog(true);
  };

  // Update the API calls to use assignment IDs instead of donation IDs
  const handleBloodTestSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await hospitalApi.post(
        `/hospital-dashboard/assignments/${selectedDonor.assignment_id}/submit_blood_test/`,
        bloodTestData
      );

      setSuccess('Blood test submitted successfully!');
      setBloodTestDialog(false);
      fetchDonors();

    } catch (error) {
      setError('Failed to submit blood test: ' + 
        (error.response?.data?.detail || error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBloodTestUpdate = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await hospitalApi.put(
        `/hospital-dashboard/assignments/${selectedDonor.assignment_id}/update_blood_test/`,
        bloodTestData
      );

      setSuccess('Blood test updated successfully!');
      setEditTestDialog(false);
      fetchDonors();

    } catch (error) {
      setError('Failed to update blood test: ' + 
        (error.response?.data?.detail || error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🏥 Hospital Dashboard
          </Typography>
          {hospitalInfo && (
            <Typography variant="h6" color="primary">
              {hospitalInfo.name}
            </Typography>
          )}
        </Box>
        <Button variant="outlined" onClick={handleLogout} color="error">
          Logout
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Pending Blood Tests" />
          <Tab label="Completed Blood Tests" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>
          Donors Needing Blood Tests
        </Typography>

        {filteredDonors.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No donors currently needing blood tests.</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Donors will appear here when they are scheduled for blood tests at your hospital.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredDonors.map((donor) => (
              <Card key={donor.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6">
                        {donor.first_name} {donor.last_name}
                      </Typography>
                      <Typography color="textSecondary">
                        Blood Type: {donor.blood_group} • Age: {donor.age} • {donor.gender}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Phone:</strong> {donor.phone_number}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {donor.address}
                      </Typography>
                      <Chip 
                        label={donor.donation_status} 
                        color={donor.donation_status === 'completed' ? 'success' : 'info'} 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => openBloodTestDialog(donor)}
                      startIcon={<HospitalIcon />}
                      sx={{ backgroundColor: '#d32f2f' }}
                    >
                      Submit Blood Test
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Completed Blood Tests
        </Typography>

        {filteredDonors.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No completed blood tests yet.</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Completed blood tests will appear here once they are submitted.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredDonors.map((donor) => (
              <Card key={donor.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6">
                        {donor.first_name} {donor.last_name}
                      </Typography>
                      <Typography color="textSecondary">
                        Blood Type: {donor.blood_group}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label="Blood Test Completed" 
                          color="success" 
                          size="small" 
                          icon={<CheckCircleIcon />}
                        />
                        {donor.life_saved && (
                          <Chip 
                            label="Life Saved" 
                            color="error" 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {donor.blood_test && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Sugar Level:</strong> {donor.blood_test.sugar_level} mg/dL
                          </Typography>
                          <Typography variant="body2">
                            <strong>Hemoglobin:</strong> {donor.blood_test.hemoglobin} g/dL
                          </Typography>
                          <Typography variant="body2">
                            <strong>Test Date:</strong> {new Date(donor.blood_test.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => openEditTestDialog(donor)}
                      startIcon={<EditIcon />}
                    >
                      Edit Test Results
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Blood Test Dialog */}
      <Dialog open={bloodTestDialog} onClose={() => setBloodTestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Blood Test Results</DialogTitle>
        <DialogContent>
          {selectedDonor && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              For: {selectedDonor.first_name} {selectedDonor.last_name} ({selectedDonor.blood_group})
            </Typography>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sugar Level (mg/dL)"
                type="number"
                value={bloodTestData.sugar_level}
                onChange={(e) => setBloodTestData({...bloodTestData, sugar_level: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Uric Acid Level (mg/dL)"
                type="number"
                value={bloodTestData.uric_acid_level}
                onChange={(e) => setBloodTestData({...bloodTestData, uric_acid_level: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="WBC Count (cells/mcL)"
                type="number"
                value={bloodTestData.wbc_count}
                onChange={(e) => setBloodTestData({...bloodTestData, wbc_count: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RBC Count (million cells/mcL)"
                type="number"
                value={bloodTestData.rbc_count}
                onChange={(e) => setBloodTestData({...bloodTestData, rbc_count: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hemoglobin (g/dL)"
                type="number"
                value={bloodTestData.hemoglobin}
                onChange={(e) => setBloodTestData({...bloodTestData, hemoglobin: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Platelet Count (platelets/mcL)"
                type="number"
                value={bloodTestData.platelet_count}
                onChange={(e) => setBloodTestData({...bloodTestData, platelet_count: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bloodTestData.life_saved}
                    onChange={(e) => setBloodTestData({...bloodTestData, life_saved: e.target.checked})}
                  />
                }
                label="Mark as Life Saved (send special notification to donor)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBloodTestDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBloodTestSubmit} 
            variant="contained" 
            disabled={loading}
          >
            Submit Results
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Blood Test Dialog */}
      <Dialog open={editTestDialog} onClose={() => setEditTestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Blood Test Results</DialogTitle>
        <DialogContent>
          {selectedDonor && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              For: {selectedDonor.first_name} {selectedDonor.last_name} ({selectedDonor.blood_group})
            </Typography>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sugar Level (mg/dL)"
                type="number"
                value={bloodTestData.sugar_level}
                onChange={(e) => setBloodTestData({...bloodTestData, sugar_level: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Uric Acid Level (mg/dL)"
                type="number"
                value={bloodTestData.uric_acid_level}
                onChange={(e) => setBloodTestData({...bloodTestData, uric_acid_level: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="WBC Count (cells/mcL)"
                type="number"
                value={bloodTestData.wbc_count}
                onChange={(e) => setBloodTestData({...bloodTestData, wbc_count: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RBC Count (million cells/mcL)"
                type="number"
                value={bloodTestData.rbc_count}
                onChange={(e) => setBloodTestData({...bloodTestData, rbc_count: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hemoglobin (g/dL)"
                type="number"
                value={bloodTestData.hemoglobin}
                onChange={(e) => setBloodTestData({...bloodTestData, hemoglobin: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Platelet Count (platelets/mcL)"
                type="number"
                value={bloodTestData.platelet_count}
                onChange={(e) => setBloodTestData({...bloodTestData, platelet_count: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bloodTestData.life_saved}
                    onChange={(e) => setBloodTestData({...bloodTestData, life_saved: e.target.checked})}
                  />
                }
                label="Mark as Life Saved (send special notification to donor)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTestDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBloodTestUpdate} 
            variant="contained" 
            disabled={loading}
          >
            Update Results
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HospitalDashboard;