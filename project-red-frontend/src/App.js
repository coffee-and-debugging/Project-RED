import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import RequestBlood from './components/Patient/RequestBlood';
import BloodRequestsList from './components/Patient/BloodRequestsList';
import DonateBlood from './components/Donor/DonateBlood';
import HospitalList from './components/Hospital/HospitalList';
import ChatRoom from './components/Common/ChatRoom';
import ChatRoomsList from './components/Common/ChatRoomsList'; // Add this import

const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#ff6659',
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/request-blood" 
                element={
                  <ProtectedRoute>
                    <RequestBlood />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blood-requests" 
                element={
                  <ProtectedRoute>
                    <BloodRequestsList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donate-blood" 
                element={
                  <ProtectedRoute>
                    <DonateBlood />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hospitals" 
                element={
                  <ProtectedRoute>
                    <HospitalList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat-room/:chatRoomId" 
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat-rooms" 
                element={
                  <ProtectedRoute>
                    <ChatRoomsList />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;