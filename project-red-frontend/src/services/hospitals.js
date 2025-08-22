import api from './api';

export const hospitalService = {
  createHospital: async (hospitalData) => {
    const response = await api.post('/hospitals/', hospitalData);
    return response.data;
  },

  getHospitals: async () => {
    const response = await api.get('/hospitals/');
    return response.data;
  },

  getNearbyHospitals: async (lat, lng, maxDistance = 50) => {
    const response = await api.get(
      `/hospitals/nearby_hospitals/?lat=${lat}&lng=${lng}&max_distance=${maxDistance}`
    );
    return response.data;
  },
};