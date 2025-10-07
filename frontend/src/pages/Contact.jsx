import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Language,
  Facebook,
  Instagram,
  YouTube,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <>
      <Navbar />
      <Box sx={{ 
        minHeight: 'calc(100vh - 120px)', 
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 4, sm: 6, md: 8 },
        pr: { xs: 8, sm: 10, md: 12 },
        mt: { xs: 2, sm: 4, md: 6 }
      }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
          <Typography
            variant="h1"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#2c3e50',
              mb: { xs: 1, sm: 5, md: 6 },
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1,
            }}
          >
            Contact Us
          </Typography>
          <Grid container spacing={0} sx={{ 
            minHeight: '600px',
            maxHeight: '700px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'stretch',
            width: '100%',
            m: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 4, sm: 5, md: 6 }
          }}>
            {/* Left Panel - Contact Information (Yellow) */}
            <Grid item xs={12} md={3} sx={{ width: '33%', flex: '0 0 33%', display: 'flex' }}>
                <Paper
                  sx={{
                    height: '100%',
                    backgroundColor: '#FFD700', // Bright yellow
                    p: { xs: 2, sm: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRadius: 0,
                    width: '100%',
                    flex: 1
                  }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Let's talk about everything!
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: '#5a6c7d',
                    mb: { xs: 4, sm: 5, md: 6 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  We're open for any suggestion or just to have a chat
                </Typography>

                {/* Contact Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 } }}>
                  {/* Address */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <LocationOn sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#2c3e50',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      Address: Zer Zabar Bahawali road
                      
                    </Typography>
                  </Box>

                  {/* Phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Phone sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#2c3e50',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      Phone: + 1235 2355 98
                    </Typography>
                  </Box>

                  {/* Email */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Email sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#2c3e50',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      Email: info@yoursite.com
                    </Typography>
                  </Box>

                  {/* Social Media Icons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                    {/* Facebook */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#FFD700',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <Facebook sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    
                    {/* Instagram */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#FFD700',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <Instagram sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    
                    {/* YouTube */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#FFD700',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <YouTube sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Panel - Contact Form (White) */}
            <Grid item xs={12} md={9} sx={{ width: '67%', flex: '0 0 67%', display: 'flex' }}>
              <Paper
                sx={{
                  height: '100%',
                  backgroundColor: 'white',
                  p: { xs: 2, sm: 3, md: 4 },
                  pb: { xs: 3, sm: 4, md: 5 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 0,
                  width: '100%',
                  flex: 1
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    mb: { xs: 3, sm: 4 },
                    fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Fill the form. It's easy.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                    {/* First Name and Last Name (Inline) */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#2c3e50',
                            fontWeight: 600,
                            mb: 1,
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          FIRST NAME
                        </Typography>
                        <TextField
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          fullWidth
                          variant="standard"
                          sx={{
                            '& .MuiInput-underline:before': {
                              borderBottomColor: '#e0e0e0',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: '#FFD700',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.9rem',
                              padding: '6px 0',
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#2c3e50',
                            fontWeight: 600,
                            mb: 1,
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          LAST NAME
                        </Typography>
                        <TextField
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          fullWidth
                          variant="standard"
                          sx={{
                            '& .MuiInput-underline:before': {
                              borderBottomColor: '#e0e0e0',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: '#FFD700',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.9rem',
                              padding: '6px 0',
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Phone Number */}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#2c3e50',
                          fontWeight: 600,
                          mb: 1,
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        PHONE NO
                      </Typography>
                      <TextField
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        fullWidth
                        variant="standard"
                        sx={{
                          '& .MuiInput-underline:before': {
                            borderBottomColor: '#e0e0e0',
                          },
                          '& .MuiInput-underline:after': {
                            borderBottomColor: '#FFD700',
                          },
                          '& .MuiInputBase-input': {
                            fontSize: '0.9rem',
                            padding: '6px 0',
                          },
                        }}
                      />
                    </Box>

                    {/* Email Address */}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#2c3e50',
                          fontWeight: 600,
                          mb: 1,
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        EMAIL
                      </Typography>
                      <TextField
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        fullWidth
                        variant="standard"
                        sx={{
                          '& .MuiInput-underline:before': {
                            borderBottomColor: '#e0e0e0',
                          },
                          '& .MuiInput-underline:after': {
                            borderBottomColor: '#FFD700',
                          },
                          '& .MuiInputBase-input': {
                            fontSize: '0.9rem',
                            padding: '6px 0',
                          },
                        }}
                      />
                    </Box>

                    {/* Message */}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#2c3e50',
                          fontWeight: 600,
                          mb: 1,
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        MESSAGE
                      </Typography>
                      <TextField
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Message"
                        multiline
                        rows={3}
                        fullWidth
                        variant="standard"
                        sx={{
                          '& .MuiInput-underline:before': {
                            borderBottomColor: '#e0e0e0',
                          },
                          '& .MuiInput-underline:after': {
                            borderBottomColor: '#FFD700',
                          },
                          '& .MuiInputBase-input': {
                            fontSize: '0.9rem',
                            padding: '6px 0',
                          },
                        }}
                      />
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{ mt: { xs: 2, sm: 3 }, alignSelf: 'flex-start' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          backgroundColor: '#FFD700',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1rem',
                          px: 4,
                          py: 1.5,
                          borderRadius: '4px',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#FFC107',
                          },
                        }}
                      >
                        Send Message
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default Contact;