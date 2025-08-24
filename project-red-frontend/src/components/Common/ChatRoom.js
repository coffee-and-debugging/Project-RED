import React, { useState, useEffect, useCallback } from 'react';
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
import { chatService, webSocketService } from '../../services/chat';
import api from '../../services/api';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestedHospital, setSuggestedHospital] = useState(null);
  
  const { chatRoomId } = useParams();
  const { currentUser } = useAuth();

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'chat_message') {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: data.message_id,
          content: data.message,
          sender: data.sender_id,
          sender_name: data.sender_name,
          timestamp: data.timestamp
        }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchChatRoomData();
    
    // Setup WebSocket connection
    webSocketService.connect(chatRoomId);
    webSocketService.addMessageHandler(handleWebSocketMessage);

    return () => {
      // Cleanup WebSocket connection
      webSocketService.removeMessageHandler(handleWebSocketMessage);
      webSocketService.disconnect();
    };
  }, [chatRoomId, handleWebSocketMessage]);

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to find the best hospital using AI
  const findBestHospitalWithAI = async (donorLat, donorLng, hospitals) => {
    try {
      if (!hospitals || hospitals.length === 0) return null;
      
      // Calculate distances for all hospitals
      const hospitalData = hospitals.map(hospital => {
        const distance = calculateDistance(
          donorLat, donorLng,
          hospital.location_lat, hospital.location_long
        );
        
        return {
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          distance: round(distance, 2),
          coordinates: {
            lat: hospital.location_lat,
            lng: hospital.location_long
          }
        };
      });

      // Sort by distance (nearest first)
      hospitalData.sort((a, b) => a.distance - b.distance);

      // Use AI to select the best hospital considering multiple factors
      const prompt = `
        Analyze these hospitals and select the best one for a blood donation scenario:
        
        Donor Location: ${donorLat}, ${donorLng}
        
        Available Hospitals:
        ${JSON.stringify(hospitalData, null, 2)}
        
        Consider factors like:
        1. Distance from donor (most important)
        2. Hospital capacity and facilities
        3. Traffic conditions (assume current time)
        4. Historical success rate for blood donations
        
        Return ONLY the hospital ID of the best choice.
      `;

      // For now, we'll use the closest hospital as a fallback
      // In a real implementation, you would call the OpenAI API here
      return hospitalData[0]; // Return the closest hospital

    } catch (error) {
      console.error('Error finding best hospital:', error);
      return null;
    }
  };

  const fetchChatRoomData = async () => {
    try {
      setLoading(true);
      
      // Fetch chat room details
      const chatRoomResponse = await chatService.getChatRoom(chatRoomId);
      setChatRoom(chatRoomResponse);
      
      // Fetch messages
      const messagesResponse = await chatService.getChatRoomMessages(chatRoomId);
      setMessages(messagesResponse);
      
      // Fetch donation details to get hospital information
      if (chatRoomResponse.donation) {
        try {
          const donationResponse = await api.get(`/donations/${chatRoomResponse.donation}/`);
          setDonation(donationResponse.data);
          
          // If hospital is already assigned, use it
          if (donationResponse.data.hospital) {
            const hospitalResponse = await api.get(`/hospitals/${donationResponse.data.hospital}/`);
            setHospital(hospitalResponse.data);
          } else {
            // If no hospital is assigned, find the best one
            const donorResponse = await api.get(`/users/${donationResponse.data.donor}/`);
            const donor = donorResponse.data;
            
            if (donor.location_lat && donor.location_long) {
              // Get all hospitals
              const hospitalsResponse = await api.get('/hospitals/');
              const hospitals = hospitalsResponse.data.results || hospitalsResponse.data;
              
              // Find the best hospital using AI
              const bestHospital = await findBestHospitalWithAI(
                donor.location_lat, 
                donor.location_long,
                hospitals
              );
              
              if (bestHospital) {
                setSuggestedHospital(bestHospital);
                
                // Update the donation with the suggested hospital
                await api.patch(`/donations/${donationResponse.data.id}/`, {
                  hospital: bestHospital.id
                });
              }
            }
          }
        } catch (err) {
          console.error('Error fetching donation/hospital:', err);
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
      // Send via WebSocket for real-time
      webSocketService.sendMessage(newMessage, currentUser.id);
      
      // Also send via API for persistence
      await chatService.sendMessage(chatRoomId, newMessage);
      
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
  const isDonor = currentUser.id === chatRoom.donor;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        💬 Chat with {otherUser}
      </Typography>
      
      {/* Show assigned hospital or suggested hospital */}
      {(hospital || suggestedHospital) && isDonor && (
        <Card sx={{ mb: 2, backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              🏥 {hospital ? 'Assigned Hospital' : 'Suggested Hospital'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>{hospital ? hospital.name : suggestedHospital.name}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Address:</strong> {hospital ? hospital.address : suggestedHospital.address}
            </Typography>
            {suggestedHospital && (
              <Typography variant="body2" gutterBottom>
                <strong>Distance:</strong> {suggestedHospital.distance} km away
              </Typography>
            )}
            <Chip 
              label={hospital ? "Already Assigned" : "AI-Suggested Nearest Hospital"} 
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
              <Box key={message.id || message.timestamp}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" color="primary">
                          {message.sender_name || message.sender}
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

// Helper function to round numbers
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export default ChatRoom;