// components/Common/HealthAnalysis.js
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
  Lightbulb as RecommendationIcon,
  Error as DisclaimerIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const HealthAnalysis = ({ bloodTest }) => {
  if (!bloodTest) return null;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <HospitalIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            🩺 Comprehensive Health Analysis
          </Typography>
          {bloodTest.prediction_confidence && (
            <Chip 
              label={`AI Confidence: ${bloodTest.prediction_confidence}%`} 
              color="info" 
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Health Assessment Summary */}
      {bloodTest.prediction_summary && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Health Assessment Summary
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
              {bloodTest.prediction_summary}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Specific Findings */}
      {bloodTest.prediction_findings && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6">Specific Findings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
              {bloodTest.prediction_findings}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Potential Health Conditions */}
      {bloodTest.prediction_conditions && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              <Typography variant="h6">Potential Health Conditions</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
              {bloodTest.prediction_conditions}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recommendations */}
      {bloodTest.prediction_recommendations && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RecommendationIcon color="success" />
              <Typography variant="h6">Recommendations & Precautions</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
              {bloodTest.prediction_recommendations}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Disclaimer */}
      <Alert 
        severity="warning" 
        icon={<DisclaimerIcon />}
        sx={{ mt: 3 }}
      >
        <Typography variant="body2" fontWeight="bold">
          ⚠️ Important Medical Disclaimer
        </Typography>
        <Typography variant="body2">
          {bloodTest.prediction_disclaimer || 
            'This AI analysis is for informational purposes only. Please consult with a qualified healthcare professional for proper diagnosis and treatment. Do not disregard professional medical advice based on this analysis.'}
        </Typography>
      </Alert>

      <Divider sx={{ my: 3 }} />

      {/* Raw Blood Test Values */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Blood Test Results
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {bloodTest.sugar_level && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2">Sugar Level: {bloodTest.sugar_level} mg/dL</Typography>
            </Paper>
          )}
          {bloodTest.hemoglobin && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2">Hemoglobin: {bloodTest.hemoglobin} g/dL</Typography>
            </Paper>
          )}
          {bloodTest.uric_acid_level && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2">Uric Acid: {bloodTest.uric_acid_level} mg/dL</Typography>
            </Paper>
          )}
          {bloodTest.wbc_count && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2">WBC Count: {bloodTest.wbc_count} cells/mcL</Typography>
            </Paper>
          )}
          {bloodTest.rbc_count && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2">RBC Count: {bloodTest.rbc_count} million cells/mcL</Typography>
            </Paper>
          )}
          {bloodTest.platelet_count && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2">Platelet Count: {bloodTest.platelet_count} platelets/mcL</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default HealthAnalysis;