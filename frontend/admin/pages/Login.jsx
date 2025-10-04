import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Lock,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../src/services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear any existing authentication data when component mounts
  React.useEffect(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData);
      const response = await apiService.adminLogin(formData);
      console.log('Login response:', response);
      
      if (response.success) {
        // Store token and user data
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        
        // Update API service token
        apiService.setToken(response.data.token);
        
        console.log('Login successful, navigating to dashboard');
        // Reload the page to trigger authentication check
        window.location.href = '/admin/dashboard';
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700 0%, #F57F17 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)',
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
              Admin Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Sign in to access the admin panel
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#757575' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#757575' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFD700 0%, #F57F17 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F57F17 0%, #FFD700 100%)',
                },
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/admin/forgot-password')}
                sx={{
                  color: '#FFD700',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/admin/signup')}
                sx={{
                  color: '#FFD700',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Don't have an account? Sign up
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
