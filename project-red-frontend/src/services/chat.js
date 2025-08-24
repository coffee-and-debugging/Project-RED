import api from './api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
    this.connected = false;
  }

  connect(chatRoomId) {
    if (this.socket) {
      this.disconnect();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.socket = new WebSocket(`${protocol}//${host}/ws/chat/${chatRoomId}/`);

    this.socket.onopen = () => {
      this.connected = true;
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(data));
    };

    this.socket.onclose = () => {
      this.connected = false;
      console.log('WebSocket disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
  }

  sendMessage(message, senderId) {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify({
        message: message,
        sender_id: senderId
      }));
    }
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

export const webSocketService = new WebSocketService();

export const chatService = {
  createChatRoomForDonation: async (donationId) => {
    const response = await api.post(`/create-chatroom-for-donation/${donationId}/`);
    return response.data;
  },

  getChatRoom: async (chatRoomId) => {
    const response = await api.get(`/chat-rooms/${chatRoomId}/`);
    return response.data;
  },

  getChatRoomMessages: async (chatRoomId) => {
    const response = await api.get(`/chat-rooms/${chatRoomId}/messages/`);
    return response.data;
  },

  sendMessage: async (chatRoomId, content) => {
    const response = await api.post(`/chat-rooms/${chatRoomId}/send_message/`, {
      content: content
    });
    return response.data;
  },
};