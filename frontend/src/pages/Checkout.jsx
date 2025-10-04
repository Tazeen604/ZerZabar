import React, { useState, useEffect } from "react";
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
import PageContainer from "../components/PageContainer";

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
    
    // Email validation (optional but must be valid if provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    
    // Required fields
    if (!formData.firstName.trim()) {
      errors.firstName = "This field is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "This field is required";
    }
    if (!formData.address.trim()) {
      errors.address = "Please enter your address";
    }
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Please enter a valid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderPayload = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email || null, // Optional email
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_district: formData.country, // Using country as district for now
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
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
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
                    src={item.image} 
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
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.2 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                  Size: {item.size || 'M'} | Color: {item.color || 'Default'}
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
            <Typography variant="body2">Subtotal ({items.length} items):</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ₨{getTotalPrice().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Shipping:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ₨200.00
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Total */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#333',
                    borderRadius: 2,
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
            Total:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
            ₨{(getTotalPrice() + 200).toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderThankYouPage = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
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
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                  Thank you for your order!
          </Typography>
                <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                  Your order has been placed successfully.
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>
                  Order ID: {orderNumber}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
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
                <Typography variant="body1" sx={{ mb: 1 }}>{formData.city}, {formData.country}</Typography>
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
                    src={item.image} 
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
    <PageContainer maxWidth="lg" sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Checkout Form (50% on desktop) */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Contact Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                      Contact
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Sign in
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
                    sx={{ mb: 2 }}
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

                <Divider sx={{ my: 4 }} />

                {/* Delivery Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
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
                      <TextField
                        fullWidth
                        label="Postal code (optional)"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
          </Grid>
        </Grid>

                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    required
                    sx={{ mb: 2 }}
                  />

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

                <Divider sx={{ my: 4 }} />

                {/* Shipping Method */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
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
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                Standard Shipping
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Rs 200.00
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Payment Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                    Payment
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
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
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <LocalShipping sx={{ mr: 2, color: '#4CAF50' }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                Cash on Delivery (COD)
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
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
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <CreditCard sx={{ mr: 2, color: '#1976D2' }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                Card & Online Payments
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
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
                    py: 2,
                    borderRadius: 2,
                    fontSize: '1.1rem',
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
          <Grid item xs={12} md={6}>
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
    </PageContainer>
  );
};

export default Checkout;