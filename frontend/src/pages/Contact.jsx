import React, { useState, useEffect } from 'react';
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
import Breadcrumbs from '../components/Breadcrumbs';
import PageHeaderWithSettings from "../components/PageHeaderWithSettings";
import {
  LocationOn,
  Phone,
  Email,
  Language,
  Facebook,
  Instagram,
  YouTube,
  MusicNote,
} from '@mui/icons-material';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove all non-digit characters for validation
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      } else if (phoneDigits.length > 15) {
        newErrors.phone = 'Phone number cannot exceed 15 digits';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically make an API call:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      console.log('Form submitted successfully:', formData);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: '',
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeaderWithSettings title="Contact Us" breadcrumb="Home / Contact" defaultBgImage="/images/new-arrival.jpg" />
      <Box sx={{ 
        minHeight: 'calc(100vh - 200px)', 
        backgroundColor: '#fff',
        py: { xs: 4, sm: 6, md: 8 },
        px: 0,
      }}>
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '100%', md: '1200px' }, mx: 'auto', px: { xs: 2, sm: 2, md: 3 } }}>
         
          <Grid container spacing={0} sx={{ 
            minHeight: { xs: 'auto', md: '600px' },
            maxHeight: { xs: 'none', md: '700px' },
            boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.1)' },
            borderRadius: { xs: '0', sm: '20px' },
            overflow: 'hidden',
            backgroundColor: { xs: 'transparent', sm: '#f8f9fa' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            columnGap: { xs: 0, md: 0.5 },
            rowGap: { xs: 1, md: 0 },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            width: '100%',
            m: { xs: 0, sm: 2, md: 4 },
            mb: { xs: 2, sm: 4, md: 6 }
          }}>
            {/* Left Panel - Contact Information (Yellow) */}
            <Grid item xs={12} md={3} sx={{ 
              width: { xs: '100%', md: '33%' }, 
              flex: { xs: 'none', md: '0 0 33%' }, 
              display: 'flex',
              order: { xs: 2, md: 1 },
              boxShadow: "0 8px 24px rgba(248, 244, 27, 0.1)",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 32px rgba(247, 213, 23, 0.2)",
              },
            }}>
                <Paper
                  sx={{
                    height: { xs: 'auto', md: '100%' },
                    backgroundColor: '#FFD700', // Bright yellow
                    p: { xs: 3, sm: 4, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: { xs: 'flex-start', md: 'center' },
                    borderRadius: { xs: '12px', md: 0 },
                    width: '100%',
                    flex: 1,
                    mb: { xs: 2, md: 0 }
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
                        boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
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
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: { xs: 1, sm: 1 }, 
                    mt: 2,
                    flexWrap: 'wrap'
                  }}>
                    {/* Facebook */}
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.1)',
                          '& .MuiSvgIcon-root': {
                            color: 'black',
                          },
                        },
                      }}
                    >
                      <Facebook sx={{ color: 'white', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    
                    {/* Instagram */}
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.1)',
                          '& .MuiSvgIcon-root': {
                            color: 'black',
                          },
                        },
                      }}
                    >
                      <Instagram sx={{ color: 'white', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    
                    {/* YouTube */}
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.1)',
                          '& .MuiSvgIcon-root': {
                            color: 'black',
                          },
                        },
                      }}
                    >
                      <YouTube sx={{ color: 'white', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    
                    {/* TikTok */}
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.1)',
                          '& .MuiSvgIcon-root': {
                            color: 'black',
                          },
                        },
                      }}
                    >
                      <MusicNote sx={{ color: 'white', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Panel - Contact Form (White) */}
            <Grid item xs={12} md={9} sx={{ 
              width: { xs: '100%', md: '67%' }, 
              flex: { xs: 'none', md: '0 0 67%' }, 
              display: 'flex',
              order: { xs: 1, md: 2 },
              boxShadow: "0 8px 24px rgba(0,0,0,0.9)",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
              },
            }}>
              <Paper
                sx={{
                  height: { xs: 'auto', md: '100%' },
                  backgroundColor: 'white',
                  p: { xs: 3, sm: 4, md: 4 },
                  pb: { xs: 4, sm: 4, md: 5 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: { xs: '12px', md: 0 },
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
                    mt: { xs: 2, sm: 3, md: 4 }, // Equal top margin as left panel
                    fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Fill the form. 
                  It's easy.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                    {/* First Name and Last Name (Inline on desktop, stacked on mobile) */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          sx={{
                            '& .MuiInput-underline:before': {
                              borderBottomColor: errors.firstName ? '#f44336' : '#e0e0e0',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: errors.firstName ? '#f44336' : '#FFD700',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.9rem',
                              padding: '6px 0',
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem',
                              marginTop: '4px',
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
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          sx={{
                            '& .MuiInput-underline:before': {
                              borderBottomColor: errors.lastName ? '#f44336' : '#e0e0e0',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: errors.lastName ? '#f44336' : '#FFD700',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.9rem',
                              padding: '6px 0',
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem',
                              marginTop: '4px',
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Phone Number and Email (Inline on desktop, stacked on mobile) */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
                          error={!!errors.phone}
                          helperText={errors.phone}
                          sx={{
                            '& .MuiInput-underline:before': {
                              borderBottomColor: errors.phone ? '#f44336' : '#e0e0e0',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: errors.phone ? '#f44336' : '#FFD700',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.9rem',
                              padding: '6px 0',
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem',
                              marginTop: '4px',
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
                          error={!!errors.email}
                          helperText={errors.email}
                          sx={{
                            '& .MuiInput-underline:before': {
                              borderBottomColor: errors.email ? '#f44336' : '#e0e0e0',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: errors.email ? '#f44336' : '#FFD700',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.9rem',
                              padding: '6px 0',
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '0.75rem',
                              marginTop: '4px',
                            },
                          }}
                        />
                      </Box>
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
                        error={!!errors.message}
                        helperText={errors.message}
                        sx={{
                          '& .MuiInput-underline:before': {
                            borderBottomColor: errors.message ? '#f44336' : '#e0e0e0',
                          },
                          '& .MuiInput-underline:after': {
                            borderBottomColor: errors.message ? '#f44336' : '#FFD700',
                          },
                          '& .MuiInputBase-input': {
                            fontSize: '0.9rem',
                            padding: '6px 0',
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '0.75rem',
                            marginTop: '4px',
                          },
                        }}
                      />
                    </Box>

                    {/* Success/Error Messages */}
                    {submitStatus === 'success' && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        backgroundColor: '#4caf50', 
                        color: 'white', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        ✅ Thank you! Your message has been sent successfully.
                      </Box>
                    )}
                    
                    {submitStatus === 'error' && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        ❌ Sorry, there was an error sending your message. Please try again.
                      </Box>
                    )}

                    {/* Submit Button */}
                    <Box sx={{ mt: { xs: 2, sm: 3 }, alignSelf: 'flex-start' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          backgroundColor: isSubmitting ? '#ccc' : '#FFD700',
                          color: '#000',
                          fontWeight: 600,
                          fontSize: '1rem',
                          px: 4,
                          py: 1.5,
                          borderRadius: '25px',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: isSubmitting ? '#ccc' : '#FFC107',
                          },
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
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