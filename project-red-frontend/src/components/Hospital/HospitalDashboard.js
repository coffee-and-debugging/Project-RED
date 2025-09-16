import React, { useState, useEffect } from "react";
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
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Grid,
} from "@mui/material";
import { hospitalApi } from "../../services/api";
import BloodTestForm from "./BloodTestForm";

const HospitalDashboard = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [bloodTestFormOpen, setBloodTestFormOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchDonors();
  }, []);

  const generatePrediction = async (assignmentId) => {
    try {
      await hospitalApi.post(`/hospital-dashboard/assignments/${assignmentId}/generate_prediction/`);
      setSuccess('AI prediction generated successfully!');
      fetchDonors(); // Refresh data
    } catch (error) {
      setError('Failed to generate prediction: ' + (error.response?.data?.detail || error.message));
    }
  };

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await hospitalApi.get("/hospital-dashboard/donors/");
      setDonors(response.data);
    } catch (error) {
      setError("Failed to fetch donor data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPrediction = (donor) => {
    setSelectedDonor(donor);
    setPredictionDialogOpen(true);
  };

  const openBloodTestForm = (donor, isEdit = false) => {
    setCurrentAssignment(donor.assignment_id);
    setSelectedDonor(donor);
    setIsEditMode(isEdit);
    setBloodTestFormOpen(true);
  };

  const handleBloodTestSubmit = async (bloodTestData) => {
    try {
      if (isEditMode) {
        // Update existing blood test
        await hospitalApi.put(
          `/hospital-dashboard/assignments/${currentAssignment}/update_blood_test/`,
          bloodTestData
        );
        setSuccess("Blood test results updated successfully!");
      } else {
        // Submit new blood test
        await hospitalApi.post(
          `/hospital-dashboard/assignments/${currentAssignment}/submit_blood_test/`,
          bloodTestData
        );
        setSuccess("Blood test results submitted successfully!");
      }

      setBloodTestFormOpen(false);
      fetchDonors(); // Refresh data
    } catch (error) {
      setError(
        "Failed to submit blood test: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  const markAsCompleted = async (assignmentId) => {
    try {
      await hospitalApi.post(
        `/hospital-dashboard/assignments/${assignmentId}/mark_completed/`
      );
      setSuccess("Donation marked as completed successfully!");
      fetchDonors(); // Refresh data
    } catch (error) {
      setError(
        "Failed to mark as completed: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hospital Dashboard
      </Typography>

      {donors.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>No donors assigned yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Donor Name</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Age/Gender</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Blood Test</TableCell>
                <TableCell>Life Saved</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donors.map((donor) => (
                <TableRow key={donor.assignment_id}>
                  <TableCell>
                    {donor.first_name} {donor.last_name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donor.blood_group}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {donor.age}/{donor.gender}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donor.assignment_status}
                      color={
                        donor.assignment_status === "completed"
                          ? "success"
                          : donor.assignment_status === "scheduled"
                          ? "info"
                          : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {donor.blood_test_exists ? (
                      <Chip label="Completed" color="success" />
                    ) : (
                      <Chip label="Pending" color="warning" />
                    )}
                  </TableCell>
                  <TableCell>
                    {donor.life_saved ? (
                      <Chip label="Yes" color="success" size="small" />
                    ) : (
                      <Chip label="No" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {donor.blood_test_exists ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => viewPrediction(donor)}
                          >
                            View Prediction
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => openBloodTestForm(donor, true)}
                          >
                            Edit Test
                          </Button>
                          {donor.assignment_status !== "completed" && (
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              onClick={() =>
                                markAsCompleted(donor.assignment_id)
                              }
                            >
                              Mark Completed
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openBloodTestForm(donor, false)}
                        >
                          Submit Test
                        </Button>
                      )}

                      {/* AI Prediction button */}
                      {donor.blood_test_exists && !donor.blood_test.health_risk_prediction && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => generatePrediction(donor.assignment_id)}
                          sx={{ mt: 1 }}
                        >
                          Generate AI Prediction
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Health Prediction Dialog */}
      <Dialog
        open={predictionDialogOpen}
        onClose={() => setPredictionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Health Prediction for {selectedDonor?.first_name}{" "}
          {selectedDonor?.last_name}
        </DialogTitle>
        <DialogContent>
          {selectedDonor?.blood_test ? (
            <Box sx={{ mt: 2 }}>
              {/* Blood Test Results */}
              <Typography variant="h6" gutterBottom>
                Blood Test Results:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Sugar Level:</strong>{" "}
                    {selectedDonor.blood_test.sugar_level} mg/dL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Hemoglobin:</strong>{" "}
                    {selectedDonor.blood_test.hemoglobin} g/dL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Uric Acid:</strong>{" "}
                    {selectedDonor.blood_test.uric_acid_level} mg/dL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>WBC Count:</strong>{" "}
                    {selectedDonor.blood_test.wbc_count} cells/mcL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>RBC Count:</strong>{" "}
                    {selectedDonor.blood_test.rbc_count} million cells/mcL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Platelet Count:</strong>{" "}
                    {selectedDonor.blood_test.platelet_count} platelets/mcL
                  </Typography>
                </Grid>
                {selectedDonor.blood_test.life_saved && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="success.main">
                      <strong>🎉 Life Saved:</strong> This donation was used to
                      save a life!
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Health Prediction */}
              {selectedDonor.blood_test.health_risk_prediction ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Health Analysis:
                  </Typography>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      whiteSpace: "pre-wrap",
                      backgroundColor: "#f5f5f5",
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    {selectedDonor.blood_test.health_risk_prediction}
                  </Typography>

                  {selectedDonor.blood_test.prediction_confidence && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Confidence Level:</strong>{" "}
                      {selectedDonor.blood_test.prediction_confidence}%
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Health prediction is being generated. Please check back later.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography>
              No blood test data available for this donor.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Blood Test Form Dialog */}
      <BloodTestForm
        open={bloodTestFormOpen}
        onClose={() => setBloodTestFormOpen(false)}
        onSubmit={handleBloodTestSubmit}
        initialData={selectedDonor?.blood_test}
        isEdit={isEditMode}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HospitalDashboard;
