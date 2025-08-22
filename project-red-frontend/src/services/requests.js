import api from './api';

export const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/blood-requests/', requestData);
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/blood-requests/');
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/blood-requests/${id}/`);
    return response.data;
  },
};