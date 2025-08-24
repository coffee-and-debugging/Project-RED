import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { chatRoomId } = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchChatRoomData();
  }, [chatRoomId]);

  const fetchChatRoomData = async () => {
    try {
      setLoading(true);
      
      // Fetch chat room details
      const chatResponse = await api.get(`/api/chat-rooms/${chatRoomId}/`);
      setChatRoom(chatResponse.data);
      
      // Fetch messages
      const messagesResponse = await api.get(`/api/chat-rooms/${chatRoomId}/messages/`);
      setMessages(messagesResponse.data);
      
      // Fetch donation details to get hospital information
      if (chatResponse.data.donation) {
        const donationResponse = await api.get(`/api/donations/${chatResponse.data.donation}/`);
        setDonation(donationResponse.data);
        
        if (donationResponse.data.hospital) {
          const hospitalResponse = await api.get(`/api/hospitals/${donationResponse.data.hospital}/`);
          setHospital(hospitalResponse.data);
        }
      }
      
    } catch (error) {
      console.error('Error fetching chat room data:', error);
      setError('Failed to load chat room: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await api.post(`/api/chat-rooms/${chatRoomId}/send_message/`, {
        content: newMessage
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) return <Typography>Loading chat room...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!chatRoom) return <Typography>Chat room not found</Typography>;

  const otherUser = currentUser.id === chatRoom.donor ? chatRoom.patient_name : chatRoom.donor_name;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        💬 Chat with {otherUser}
      </Typography>
      
      {hospital && (
        <Card sx={{ mb: 2, backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              🏥 Suggested Hospital for Donation
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>{hospital.name}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Address:</strong> {hospital.address}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Phone:</strong> {hospital.phone_number}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Coordinates:</strong> {hospital.location_lat?.toFixed(4)}, {hospital.location_long?.toFixed(4)}
            </Typography>
            <Chip 
              label="AI-Suggested Nearest Hospital" 
              color="primary" 
              variant="outlined" 
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      )}
      
      <Paper elevation={3} sx={{ height: '400px', overflow: 'auto', p: 2, mb: 2 }}>
        <List>
          {messages.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No messages yet" 
                secondary="Start the conversation by sending a message" 
              />
            </ListItem>
          ) : (
            messages.map((message) => (
              <Box key={message.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" color="primary">
                          {message.sender_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {message.content}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </Box>
            ))
          )}
        </List>
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default ChatRoom;