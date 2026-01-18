import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Profile from './components/Common/Profile';

import HospitalResetPassword from './components/Hospital/HospitalResetPassword';
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
import ChatRoomsList from './components/Common/ChatRoomsList';
import HospitalRegister from './components/Hospital/HospitalRegister';
import HospitalLogin from './components/Hospital/HospitalLogin';
import HospitalDashboard from './components/Hospital/HospitalDashboard';
import ResetPassword from './components/Auth/ResetPassword';
import theme from './theme';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const HospitalProtectedRoute = ({ children }) => {
  const hospitalUser = JSON.parse(localStorage.getItem('hospital_user'));
  return hospitalUser ? children : <Navigate to="/hospital-login" />;
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
              <Route path="/hospital-register" element={<HospitalRegister />} />
              <Route path="/hospital-login" element={<HospitalLogin />} />
              <Route 
                path="/hospital-dashboard" 
                element={
                  <HospitalProtectedRoute>
                    <HospitalDashboard />
                  </HospitalProtectedRoute>
                } 
              />
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
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
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
              <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
              <Route path="/hospital-reset-password/:uid/:token" element={<HospitalResetPassword />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;