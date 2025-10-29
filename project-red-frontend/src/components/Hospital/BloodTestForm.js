import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
  Typography
} from '@mui/material';

const BloodTestForm = ({ open, onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    sugar_level: '',
    hemoglobin: '',
    uric_acid_level: '',
    wbc_count: '',
    rbc_count: '',
    platelet_count: '',
    life_saved: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        sugar_level: initialData.sugar_level || '',
        hemoglobin: initialData.hemoglobin || '',
        uric_acid_level: initialData.uric_acid_level || '',
        wbc_count: initialData.wbc_count || '',
        rbc_count: initialData.rbc_count || '',
        platelet_count: initialData.platelet_count || '',
        life_saved: initialData.life_saved || false
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Blood Test Results' : 'Submit Blood Test Results'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Enter the blood test results for the donor. All fields are required for accurate health prediction.
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="sugar_level"
                label="Sugar Level (mg/dL)"
                type="number"
                value={formData.sugar_level}
                onChange={handleChange}
                helperText="Normal: 70-100 mg/dL"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="hemoglobin"
                label="Hemoglobin (g/dL)"
                type="number"
                value={formData.hemoglobin}
                onChange={handleChange}
                helperText="Normal: 13.5-17.5g/dL (M), 12.0-15.5g/dL (F)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="uric_acid_level"
                label="Uric Acid Level (mg/dL)"
                type="number"
                value={formData.uric_acid_level}
                onChange={handleChange}
                helperText="Normal: 3.4-7.0mg/dL (M), 2.4-6.0mg/dL (F)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="wbc_count"
                label="WBC Count (cells/mcL)"
                type="number"
                value={formData.wbc_count}
                onChange={handleChange}
                helperText="Normal: 4,500-11,000 cells/mcL"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="rbc_count"
                label="RBC Count (million cells/mcL)"
                type="number"
                value={formData.rbc_count}
                onChange={handleChange}
                helperText="Normal: 4.7-6.1M (M), 4.2-5.4M (F)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="platelet_count"
                label="Platelet Count (platelets/mcL)"
                type="number"
                value={formData.platelet_count}
                onChange={handleChange}
                helperText="Normal: 150,000-450,000 platelets/mcL"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="life_saved"
                    checked={formData.life_saved}
                    onChange={handleChange}
                  />
                }
                label="Life Saved - This donation was used to save a life"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.sugar_level || !formData.hemoglobin || !formData.uric_acid_level || 
                   !formData.wbc_count || !formData.rbc_count || !formData.platelet_count}
        >
          {isEdit ? 'Update Results' : 'Submit Results'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BloodTestForm;