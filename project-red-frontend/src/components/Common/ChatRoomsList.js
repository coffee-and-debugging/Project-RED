import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ChatRoomsList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chat-rooms/');
      setChatRooms(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setError('Failed to load chat rooms: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading chat rooms...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        💬 Your Chat Rooms
      </Typography>
      
      {chatRooms.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>You don't have any active chat rooms yet.</Typography>
          <Typography>Accept a blood donation request to start a chat with a patient.</Typography>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <List>
            {chatRooms.map((chatRoom) => (
              <ListItem key={chatRoom.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">
                        Chat with {currentUser.id === chatRoom.donor ? chatRoom.patient_name : chatRoom.donor_name}
                      </Typography>
                      <Chip 
                        label={chatRoom.is_active ? 'Active' : 'Inactive'} 
                        color={chatRoom.is_active ? 'success' : 'default'} 
                        size="small" 
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Created: {new Date(chatRoom.created_at).toLocaleDateString()}
                    </Typography>
                  }
                />
                <Button
                  variant="contained"
                  onClick={() => navigate(`/chat-room/${chatRoom.id}`)}
                  sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                >
                  Open Chat
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default ChatRoomsList;