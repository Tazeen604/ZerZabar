import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Notifications,
  Settings,
  AccountCircle,
  Logout,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const TopBar = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, getRecentNotifications } = useNotifications();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAnchorEl(null);
    window.location.href = '/admin/login';
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    handleNotificationMenuClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    handleNotificationMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sidebarOpen ? 280 : 60}px)`,
        ml: `${sidebarOpen ? 280 : 60}px`,
        transition: 'all 0.3s ease',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Welcome Message */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            WELCOME!
          </Typography>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: theme.palette.primary.main,
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationMenuOpen}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: theme.palette.primary.main,
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton
            onClick={() => navigate('/admin/settings')}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: theme.palette.primary.main,
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Settings />
          </IconButton>

          {/* Search Bar */}
          <TextField
            size="small"
            placeholder="Search..."
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F5F5F5',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: `1px solid ${theme.palette.primary.main}`,
                },
                '&.Mui-focused fieldset': {
                  border: `2px solid ${theme.palette.primary.main}`,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              ml: 1,
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.mode === 'dark' ? '#2C2C2C' : '#FFFFFF',
                fontWeight: 'bold',
                '&:hover': {
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              A
            </Avatar>
          </IconButton>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: '12px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.15)',
                mt: 1,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            <MenuItem
              onClick={handleProfileMenuClose}
              sx={{
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                },
              }}
            >
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleProfileMenuClose}
              sx={{
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                },
              }}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: `${theme.palette.error.main}20`,
                  color: theme.palette.error.main,
                },
              }}
            >
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>

          {/* Notification Dropdown Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: '12px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.15)',
                mt: 1,
                backgroundColor: theme.palette.background.paper,
                minWidth: 300,
                maxHeight: 400,
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleMarkAllAsRead}
                    sx={{ textTransform: 'none' }}
                  >
                    Mark all as read
                  </Button>
                )}
              </Box>
            </Box>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {getRecentNotifications(10).length > 0 ? (
                getRecentNotifications(10).map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      backgroundColor: notification.read ? 'transparent' : `${theme.palette.primary.main}10`,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}20`,
                      },
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              )}
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
