import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Chip,
  Snackbar,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import {
  LocalShipping,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  Email,
  Person,
  Home,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";
import { getImageUrl } from "../utils/imageUtils";

// Pakistan Districts List
const PAKISTAN_DISTRICTS = [
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Karachi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Sargodha",
  "Bahawalpur",
  "Sukkur",
  "Jhang",
  "Sheikhupura",
  "Rahim Yar Khan",
  "Gujrat",
  "Kasur",
  "Mardan",
  "Mingora",
  "Nawabshah",
  "Chiniot",
  "Kotri",
  "Khanpur",
  "Hafizabad",
  "Kohat",
  "Jacobabad",
  "Shikarpur",
  "Muzaffargarh",
  "Khanewal",
  "Hangu",
  "Gojra",
  "Mandi Bahauddin",
  "Eminabad",
  "Sangla Hill",
  "Nankana Sahib",
  "Chenab Nagar",
  "Abbottabad",
  "Muridke",
  "Jhelum",
  "Burewala",
  "Daska",
  "Ahmadpur East",
  "Kamalia",
  "Kot Addu",
  "Khushab",
  "Wah Cantonment",
  "Vihari",
  "New Mirpur",
  "Kamoke",
  "Haveli Lakha",
  "Kotli",
  "Tando Allahyar",
  "Narowal",
  "Shorkot",
  "Kandhkot",
  "Bhakkar",
  "Haroonabad",
  "Kahror Pakka",
  "Gujar Khan",
  "Larkana",
  "Chakwal",
  "Toba Tek Singh",
  "Nowshera",
  "Swabi",
  "Khuzdar",
  "Dadu",
  "Aliabad",
  "Layyah",
  "Tando Muhammad Khan",
  "Kambar",
  "Mirpur Khas",
  "Sanghar",
  "Naushahro Feroze",
  "Shikarpur",
  "Jacobabad",
  "Kashmore",
  "Ghotki",
  "Sukkur",
  "Khairpur",
  "Umerkot",
  "Tharparkar",
  "Badin",
  "Tando Allahyar",
  "Hyderabad",
  "Tando Muhammad Khan",
  "Matli",
  "Tando Ghulam Ali",
  "Hala",
];

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    shipping: 200,
    total: 0
  });
  const [orderItems, setOrderItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    emailNews: false,
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    district: "",
    postalCode: "",
    phone: "",
    saveInfo: false,
    shippingMethod: "standard",
    paymentMethod: "cod",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Don't redirect if we're showing the success page
    console.log('useEffect triggered:', { itemsLength: items.length, success, shouldRedirect: items.length === 0 && !success });
    if (items.length === 0 && !success) {
      console.log('Redirecting to cart because items are empty and not in success state');
      navigate("/cart");
    }
  }, [items, navigate, success]);

  const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = "Phone number must be at least 10 digits";
    }
    
    // Address validation
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      errors.address = "Please provide a complete address";
    }
    
    // City validation
    if (!formData.city.trim()) {
      errors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      errors.city = "City name must be at least 2 characters";
    }
    
    // District validation
    if (!formData.district.trim()) {
      errors.district = "District is required";
    }
    
    // Email validation (optional but if provided, must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const errorMessages = Object.values(formErrors).filter(error => error);
      setError(errorMessages.length > 0 ? errorMessages.join('. ') : "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderPayload = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email || null, // Optional email
        customer_phone: formData.phone,
        shipping_address: formData.address,
        customer_district: formData.district,
        customer_city: formData.city,
        payment_method: formData.paymentMethod,
      };

      console.log('Submitting order:', orderPayload);
      const response = await apiService.createOrder(orderPayload);
      console.log('Order response:', response);
      
      if (response.success) {
        console.log('Order successful, setting success state to true');
        
        // Store order totals and items before clearing cart
        const subtotal = getTotalPrice();
        const shipping = 200;
        const total = subtotal + shipping;
        
        setOrderTotals({
          subtotal,
          shipping,
          total
        });
        
        // Store a copy of the items for the thank you page
        setOrderItems([...items]);
        
        setOrderNumber(response.data.order_number);
      setSuccess(true);
      clearCart();
        setSnackbarMessage(`Order has been placed successfully. Your order number is ${response.data.order_number}`);
        setSnackbarOpen(true);
        
        // Scroll to top when showing thank you page
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        
        // Stay on Thank You page - no automatic redirect
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStickyCartSummary = () => (
    <Card sx={{ 
      position: 'sticky',
      top: 20,
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.1)',
      backgroundColor: '#fafafa'
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 'bold', 
          color: '#333',
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
        }}>
          Order Summary
          </Typography>
        
        {/* Items List */}
        <Box sx={{ mb: 3 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2, 
              p: 2, 
              border: '1px solid #e0e0e0', 
                  borderRadius: 2,
              backgroundColor: '#fff'
            }}>
              <Box sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: 1, 
                overflow: 'hidden',
                mr: 2,
                backgroundColor: '#f5f5f5',
                position: 'relative'
              }}>
                {item.image ? (
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#e0e0e0'
                  }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>No Image</Typography>
                  </Box>
                )}
                <Chip 
                  label={item.quantity} 
                  size="small" 
              sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#FFD700', 
                    color: '#333',
                    fontSize: '0.7rem',
                    minWidth: 20,
                    height: 20
                  }}
                />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold', 
                  mb: 0.5, 
                  lineHeight: 1.2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                }}>
                  Size: {item.size || 'M'} | Color: {item.color || 'Default'}
          </Typography>
                </Box>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold', 
                color: '#333', 
                ml: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}>
                ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              Subtotal ({items.length} items):
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              ₨{getTotalPrice().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              Shipping:
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              ₨200.00
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Total */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
          backgroundColor: '#333',
          borderRadius: 2,
          mb: 2
        }}>
          <Typography variant="h6" sx={{ 
           fontWeight: 'bold', 
            color: '#fff',
            fontSize: { xs: '0.9rem', sm: '1.0rem', md: '1rem' }
          }}>
            Total:
          </Typography>
          <Typography variant="h6" sx={{ 
           fontWeight: 'bold', 
            color: '#fff',
            fontSize: { xs: '0.9rem', sm: '1.0rem', md: '1rem' }
          }}>
            ₨{(getTotalPrice() + 200).toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderThankYouPage = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4, pt: { xs: 12, md: 16 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Grid container spacing={4}>
          {/* Left Column - Order Details (65% width) */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              {/* Main Thank You Message */}
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 4, 
                borderRadius: 2, 
                mb: 4,
                textAlign: 'center'
              }}>
                <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: '#333', 
                  mb: 2,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                }}>
                  Thank you for your order!
          </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#666', 
                  mb: 3,
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                }}>
                  Your order has been placed successfully.
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold', 
                  color: '#FFD700', 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                }}>
                  Order ID: {orderNumber}
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#333', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                }}>
                  Total Amount: ₨{orderTotals.total.toFixed(2)}
                </Typography>
                {formData.email && (
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    A confirmation email has been sent to {formData.email}
                  </Typography>
                )}
        </Box>
        
              {/* Order Details */}
          <Box sx={{ 
                backgroundColor: '#f5f5f5', 
            p: 3, 
            borderRadius: 2, 
                mb: 3 
          }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Order Details
            </Typography>
                
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Contact Information</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {formData.email || 'No email provided'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Phone</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formData.phone}
                    </Typography>
              </Grid>
                  
              <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Payment Method</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Cash on Delivery (COD) - ₨{orderTotals.total.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Shipping Method</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Standard Shipping
                    </Typography>
              </Grid>
              </Grid>
            </Box>
        
              {/* Delivery Address */}
          <Box sx={{ 
                backgroundColor: '#f5f5f5', 
            p: 3, 
            borderRadius: 2, 
                mb: 4 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Delivery Address
              </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{formData.address}</Typography>
                {formData.apartment && <Typography variant="body1" sx={{ mb: 1 }}>{formData.apartment}</Typography>}
                <Typography variant="body1" sx={{ mb: 1 }}>{formData.city}, {formData.district}, {formData.country}</Typography>
                <Typography variant="body1">{formData.phone}</Typography>
            </Box>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666', 
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Need help? Contact us
            </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/shop")}
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#333',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#E6C200',
                    },
                  }}
                >
                  Continue Shopping
                </Button>
          </Box>
            </Box>
          </Grid>

          {/* Right Column - Order Summary (35% width) */}
          <Grid item xs={12} md={4}>
    <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              height: 'fit-content'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
          Order Summary
        </Typography>
        
        {/* Items List */}
        <Box sx={{ mb: 3 }}>
                  {orderItems.map((item) => (
            <Box key={item.id} sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2, 
              p: 2, 
                      border: '1px solid #e0e0e0', 
              borderRadius: 2,
              backgroundColor: '#fafafa'
            }}>
              <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 1, 
                overflow: 'hidden',
                mr: 2,
                        backgroundColor: '#f5f5f5',
                        position: 'relative'
              }}>
                {item.image ? (
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#e0e0e0'
                  }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>No Image</Typography>
                  </Box>
                )}
                        <Box sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: '#FFD700',
                          color: '#333',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}>
                          {item.quantity}
              </Box>
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.2 }}>
                  {item.name}
                </Typography>
                </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333', ml: 1 }}>
                ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₨{orderTotals.subtotal.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₨{orderTotals.shipping.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Total */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#FFD700',
          borderRadius: 2,
          mb: 2
        }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
            Total:
          </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    ₨{orderTotals.total.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
          </Grid>
        </Grid>
        </Box>
        </Box>
  );

  if (success) {
    return renderThankYouPage();
  }

  return (
    <Box sx={{ pt: { xs: 12, md: 16}, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Breadcrumbs />
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 1, sm: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#333', 
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Checkout
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            onClose={() => setError(null)}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Please fix the following errors:
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Left Column - Checkout Form (50% on desktop) */}
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {/* Contact Section */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#333',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}>
                      Contact
                    </Typography>
                   
            </Box>
                  
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    placeholder="Enter your email (optional)"
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                  />
                  
                  <MuiFormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.emailNews}
                        onChange={(e) => handleInputChange("emailNews", e.target.checked)}
                        sx={{ color: '#333' }}
                      />
                    }
                    label="Email me with news and offers"
                  />
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />

                {/* Delivery Section */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    mb: 3,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}>
                    Delivery
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Country/Region</InputLabel>
                    <Select
                      value={formData.country}
                      label="Country/Region"
                      onChange={(e) => handleInputChange("country", e.target.value)}
                    >
                      <MenuItem value="Pakistan">Pakistan</MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        error={!!formErrors.firstName}
                        helperText={formErrors.firstName}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        error={!!formErrors.lastName}
                        helperText={formErrors.lastName}
                        required
                      />
                    </Grid>
          </Grid>

                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    required
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Apartment, suite, etc. (optional)"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange("apartment", e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        error={!!formErrors.city}
                        helperText={formErrors.city}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth required
                       variant="standard"
                       sx={{
                         m: 1,
                         minWidth: 200, // wider for full label visibility
                         width: '100%',
                       }}>
                        <InputLabel>District</InputLabel>
                        <Select
                          value={formData.district}
                          label="District"
                          onChange={(e) => handleInputChange("district", e.target.value)}
                          error={!!formErrors.district}
                        >
                          {PAKISTAN_DISTRICTS.map((district) => (
                            <MenuItem key={district} value={district}>
                              {district}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.district && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {formErrors.district}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Postal code (optional)"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        error={!!formErrors.phone}
                        helperText={formErrors.phone}
                        required
                      />
                    </Grid>
                  </Grid>


                  <MuiFormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.saveInfo}
                        onChange={(e) => handleInputChange("saveInfo", e.target.checked)}
                        sx={{ color: '#333' }}
                      />
                    }
                    label="Save this information for next time"
                  />
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />

                {/* Shipping Method */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    mb: 3,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}>
                    Shipping method
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={formData.shippingMethod}
                      onChange={(e) => handleInputChange("shippingMethod", e.target.value)}
                    >
                      <FormControlLabel
                        value="standard"
                        control={<Radio sx={{ color: '#333' }} />}
                        label={
          <Box sx={{ 
            display: 'flex', 
                            alignItems: 'center', 
            justifyContent: 'space-between', 
                            p: { xs: 1.5, sm: 2 }, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                Standard Shipping
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}>
                              Rs 200.00
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />

                {/* Payment Section */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}>
                    Payment
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666', 
                    mb: 3,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    All transactions are secure and encrypted.
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    >
                      <FormControlLabel
                        value="cod"
                        control={<Radio sx={{ color: '#333' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: { xs: 1.5, sm: 2 }, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <LocalShipping sx={{ 
                              mr: 2, 
                              color: '#4CAF50',
                              fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }} />
                            <Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                Cash on Delivery (COD)
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}>
                                Pay when your order arrives
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', mb: 2 }}
                      />
                      <FormControlLabel
                        value="card"
                        control={<Radio sx={{ color: '#333' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: { xs: 1.5, sm: 2 }, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <CreditCard sx={{ 
                              mr: 2, 
                              color: '#1976D2',
                              fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }} />
                            <Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                Card & Online Payments
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}>
                                Coming Soon - Currently Unavailable
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Place Order Button */}
            <Button
                  fullWidth
              variant="contained"
                  onClick={handleSubmit}
              disabled={loading}
              sx={{
                    backgroundColor: '#333',
                    color: '#fff',
                fontWeight: 'bold',
                    py: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                '&:hover': {
                      backgroundColor: '#555',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                    'Place Order'
              )}
            </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Sticky Cart Summary (50% on desktop) */}
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            {renderStickyCartSummary()}
          </Grid>
        </Grid>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};

export default Checkout;