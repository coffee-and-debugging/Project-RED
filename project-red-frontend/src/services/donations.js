import api from './api';

export const donationService = {
  createDonation: async (donationData) => {
    const response = await api.post('/donations/', donationData);
    return response;
  },

  getDonations: async () => {
    const response = await api.get('/donations/?expand=blood_request.patient,hospital');
    return response;
  },

  acceptDonation: async (donationId, locationData) => {
    const response = await api.post(`/donations/${donationId}/accept/`, locationData);
    return response;
  },
};