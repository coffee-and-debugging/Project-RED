import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  LocalHospital as HospitalIcon,
  Favorite as FavoriteIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { notificationService } from '../../services/notifications';
import { useAuth } from '../../contexts/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data.results || response.data);
    } catch (error) {
      setError('Failed to fetch notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'life_saved':
        return <FavoriteIcon color="error" />;
      case 'health_alert':
        return <WarningIcon color="warning" />;
      case 'hospital_assigned':
        return <HospitalIcon color="primary" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'life_saved':
        return 'error';
      case 'health_alert':
        return 'warning';
      case 'hospital_assigned':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) return <Typography>Loading notifications...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notifications
        </Typography>
        {notifications.filter(n => !n.is_read).length > 0 && (
          <Button variant="outlined" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No notifications yet.</Typography>
          <Typography variant="body2" color="textSecondary">
            You'll see notifications here when you have blood test results, donation updates, or other important information.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
                secondaryAction={
                  !notification.is_read && (
                    <Chip
                      label="New"
                      color="primary"
                      size="small"
                    />
                  )
                }
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.notification_type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.notification_type.replace('_', ' ')}
                        color={getNotificationColor(notification.notification_type)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification && getNotificationIcon(selectedNotification.notification_type)}
            <Typography variant="h6">{selectedNotification?.title}</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Chip
              label={selectedNotification?.notification_type.replace('_', ' ')}
              color={getNotificationColor(selectedNotification?.notification_type)}
              sx={{ mb: 2 }}
            />
            <Typography variant="body1" paragraph>
              {selectedNotification?.message}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Received: {selectedNotification && new Date(selectedNotification.created_at).toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;