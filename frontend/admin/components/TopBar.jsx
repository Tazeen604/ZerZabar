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

const TopBar = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAnchorEl(null);
    window.location.href = '/admin/login';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sidebarOpen ? 280 : 60}px)`,
        ml: `${sidebarOpen ? 280 : 60}px`,
        transition: 'all 0.3s ease',
        backgroundColor: '#FFFFFF',
        color: '#212121',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Welcome Message */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121' }}>
            WELCOME!
          </Typography>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Dark Mode Toggle */}
          <IconButton
            onClick={handleDarkModeToggle}
            sx={{
              color: '#424242',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFD700',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            sx={{
              color: '#424242',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFD700',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton
            sx={{
              color: '#424242',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: '#FFD700',
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
                backgroundColor: '#F5F5F5',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: '1px solid #FFD700',
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #FFD700',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#757575' }} />
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
                backgroundColor: '#FFD700',
                color: '#2C2C2C',
                fontWeight: 'bold',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={handleProfileMenuClose}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
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
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
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
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  color: '#F44336',
                },
              }}
            >
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
