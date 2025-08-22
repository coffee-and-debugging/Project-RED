import api from './api';

export const donationService = {
  createDonation: async (donationData) => {
    const response = await api.post('/donations/', donationData);
    return response.data;
  },

  getDonations: async () => {
    const response = await api.get('/donations/');
    return response.data;
  },

  acceptDonation: async (donationId) => {
    const response = await api.post(`/donations/${donationId}/accept/`);
    return response.data;
  },
};