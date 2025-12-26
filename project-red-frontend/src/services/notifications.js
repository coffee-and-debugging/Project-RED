import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/');
    return response;
  },

  markAsRead: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/mark_read/`);
    return response;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response;
  },

  subscribeToNotifications: (callback) => {
    // This would set up WebSocket subscription for real-time notifications
    // For now, we'll use polling or implement later
    console.log('Subscribing to notifications...');
  },
  
  unsubscribeFromNotifications: () => {
    console.log('Unsubscribing from notifications...');
  },
};