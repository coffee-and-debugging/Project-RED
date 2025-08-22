import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/mark_read/`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },
};