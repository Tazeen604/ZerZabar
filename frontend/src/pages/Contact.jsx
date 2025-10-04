import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  Container,
  Divider,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  Facebook,
  Instagram,
  Twitter,
} from '@mui/icons-material';
import PageContainer from '../components/PageContainer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSnackbarMessage('Please enter a valid email address');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Simulate form submission
    console.log('Contact form submitted:', formData);
    setSnackbarMessage('Thank you for your message! We will get back to you soon.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <PageContainer maxWidth="lg" sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
          Contact Us
        </Typography>
        <Typography variant="h6" sx={{ color: '#7f8c8d', maxWidth: '600px', mx: 'auto' }}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 3 }}>
                Send us a Message
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{
                        backgroundColor: '#2c3e50',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#34495e',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Contact Details */}
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 3 }}>
                  Get in Touch
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Email sx={{ color: '#3498db', fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        info@zerzabar.com
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: '#3498db', fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        +92 300 123 4567
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOn sx={{ color: '#3498db', fontSize: 24, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        123 Fashion Street<br />
                        Karachi, Pakistan 75000
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  Business Hours
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Monday - Friday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>9:00 AM - 6:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Saturday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>10:00 AM - 4:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Sunday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#e74c3c' }}>Closed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  Follow Us
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Facebook />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#3b5998',
                      color: '#3b5998',
                      '&:hover': {
                        backgroundColor: '#3b5998',
                        color: 'white',
                      },
                    }}
                  >
                    Facebook
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Instagram />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#e4405f',
                      color: '#e4405f',
                      '&:hover': {
                        backgroundColor: '#e4405f',
                        color: 'white',
                      },
                    }}
                  >
                    Instagram
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default Contact;
