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
  Box,
  Button,
  TextField
} from '@mui/material';
import { hospitalService } from '../../services/hospitals';
import { useNavigate } from 'react-router-dom';

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getHospitals();
      setHospitals(response.results || []);
    } catch (error) {
      setError('Failed to fetch hospitals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hospitals
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/register-hospital')}
        >
          Register Hospital
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search hospitals..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Coordinates</TableCell>
              <TableCell>Registered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHospitals.map((hospital) => (
              <TableRow key={hospital.id}>
                <TableCell>{hospital.name}</TableCell>
                <TableCell>{hospital.address}</TableCell>
                <TableCell>{hospital.phone_number}</TableCell>
                <TableCell>
                  {hospital.location_lat && hospital.location_long
                    ? `${hospital.location_lat.toFixed(4)}, ${hospital.location_long.toFixed(4)}`
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>
                  {new Date(hospital.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredHospitals.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography>No hospitals found.</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default HospitalList;