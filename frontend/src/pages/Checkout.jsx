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
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import {
  CreditCard,
  LocalShipping,
  Payment,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    billing_address: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "Pakistan",
    },
    shipping_address: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "Pakistan",
    },
    payment_method: "cod",
    use_same_address: true,
    card_details: {
      number: "",
      expiry: "",
      cvv: "",
      name: "",
    },
  });

  const steps = ["Billing Information", "Shipping Information", "Payment", "Confirmation"];

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderPayload = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        billing_address: formData.billing_address,
        shipping_address: formData.use_same_address ? formData.billing_address : formData.shipping_address,
        payment_method: formData.payment_method,
      };

      const response = await apiService.createOrder(orderPayload);
      setOrderData(response.data);
      setSuccess(true);
      clearCart();
      setActiveStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBillingForm = () => (
    <Card sx={{ 
      width: '100%', 
      maxWidth: '600px',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 215, 0, 0.2)'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Payment sx={{ mr: 2, color: '#FFD700', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Billing Information
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.billing_address.name}
              onChange={(e) => handleInputChange("billing_address.name", e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.billing_address.email}
              onChange={(e) => handleInputChange("billing_address.email", e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.billing_address.phone}
              onChange={(e) => handleInputChange("billing_address.phone", e.target.value)}
              required
              placeholder="+92 300 1234567"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.billing_address.country}
              onChange={(e) => handleInputChange("billing_address.country", e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              value={formData.billing_address.address}
              onChange={(e) => handleInputChange("billing_address.address", e.target.value)}
              required
              placeholder="House/Flat No, Street Name, Area"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.billing_address.city}
              onChange={(e) => handleInputChange("billing_address.city", e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State/Province"
              value={formData.billing_address.state}
              onChange={(e) => handleInputChange("billing_address.state", e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP/Postal Code"
              value={formData.billing_address.zip}
              onChange={(e) => handleInputChange("billing_address.zip", e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderShippingForm = () => (
    <Card sx={{ 
      width: '100%', 
      maxWidth: '600px',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 215, 0, 0.2)'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalShipping sx={{ mr: 2, color: '#FFD700', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Shipping Information
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant={formData.use_same_address ? "contained" : "outlined"}
            onClick={() => handleInputChange("use_same_address", !formData.use_same_address)}
            sx={{ 
              mb: 2,
              borderRadius: 2,
              px: 3,
              py: 1,
              backgroundColor: formData.use_same_address ? '#FFD700' : 'transparent',
              color: formData.use_same_address ? '#333' : '#FFD700',
              borderColor: '#FFD700',
              '&:hover': {
                backgroundColor: formData.use_same_address ? '#E6C200' : 'rgba(255, 215, 0, 0.1)',
              }
            }}
          >
            {formData.use_same_address ? "✓ Same as Billing Address" : "Use Different Address"}
          </Button>
        </Box>
        
        {!formData.use_same_address && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.shipping_address.name}
                onChange={(e) => handleInputChange("shipping_address.name", e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.shipping_address.email}
                onChange={(e) => handleInputChange("shipping_address.email", e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.shipping_address.phone}
                onChange={(e) => handleInputChange("shipping_address.phone", e.target.value)}
                required
                placeholder="+92 300 1234567"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.shipping_address.country}
                onChange={(e) => handleInputChange("shipping_address.country", e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.shipping_address.address}
                onChange={(e) => handleInputChange("shipping_address.address", e.target.value)}
                required
                placeholder="House/Flat No, Street Name, Area"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.shipping_address.city}
                onChange={(e) => handleInputChange("shipping_address.city", e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.shipping_address.state}
                onChange={(e) => handleInputChange("shipping_address.state", e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={formData.shipping_address.zip}
                onChange={(e) => handleInputChange("shipping_address.zip", e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );

  const renderPaymentForm = () => (
    <Card sx={{ 
      width: '100%', 
      maxWidth: '600px',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 215, 0, 0.2)'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCard sx={{ mr: 2, color: '#FFD700', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Payment Method
          </Typography>
        </Box>
        
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            Choose Payment Method
          </FormLabel>
          <RadioGroup
            value={formData.payment_method}
            onChange={(e) => handleInputChange("payment_method", e.target.value)}
          >
            <FormControlLabel
              value="cod"
              control={<Radio sx={{ color: '#FFD700', '&.Mui-checked': { color: '#FFD700' } }} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, width: '100%' }}>
                  <LocalShipping sx={{ mr: 2, color: '#4CAF50' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Cash on Delivery</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>Pay when your order arrives</Typography>
                  </Box>
                </Box>
              }
              sx={{ width: '100%', mb: 2 }}
            />
            <FormControlLabel
              value="card"
              control={<Radio sx={{ color: '#FFD700', '&.Mui-checked': { color: '#FFD700' } }} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, width: '100%' }}>
                  <CreditCard sx={{ mr: 2, color: '#1976D2' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Credit/Debit Card</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>Visa, Mastercard, American Express</Typography>
                  </Box>
                </Box>
              }
              sx={{ width: '100%' }}
            />
          </RadioGroup>
        </FormControl>
        
        {formData.payment_method === "card" && (
          <Box sx={{ 
            p: 3, 
            border: '2px dashed #FFD700', 
            borderRadius: 2, 
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            mt: 2
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
              Card Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={formData.card_details.number}
                  onChange={(e) => handleInputChange("card_details.number", e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={formData.card_details.expiry}
                  onChange={(e) => handleInputChange("card_details.expiry", e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  value={formData.card_details.cvv}
                  onChange={(e) => handleInputChange("card_details.cvv", e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name on Card"
                  placeholder="John Doe"
                  value={formData.card_details.name}
                  onChange={(e) => handleInputChange("card_details.name", e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                🔒 Your payment information is secure and encrypted
              </Typography>
            </Box>
          </Box>
        )}
        
        {formData.payment_method === "cod" && (
          <Box sx={{ 
            p: 3, 
            border: '2px dashed #4CAF50', 
            borderRadius: 2, 
            backgroundColor: 'rgba(76, 175, 80, 0.05)',
            mt: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ mr: 2, color: '#4CAF50' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                Cash on Delivery Selected
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              You will pay the delivery person when your order arrives. No online payment required.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderOrderSummary = () => (
    <Card sx={{ 
      position: 'sticky',
      top: 20,
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 215, 0, 0.2)'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
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
              border: '1px solid #f0f0f0', 
              borderRadius: 2,
              backgroundColor: '#fafafa'
            }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: 2, 
                overflow: 'hidden',
                mr: 2,
                backgroundColor: '#f5f5f5'
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
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Size: {item.size || 'M'} | Color: {item.color || 'Default'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`Qty: ${item.quantity}`} 
                    size="small" 
                    sx={{ backgroundColor: '#FFD700', color: '#333' }}
                  />
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ₨{getTotalPrice().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Tax (10%):</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ₨{(getTotalPrice() * 0.1).toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Shipping:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ₨{formData.payment_method === 'cod' ? '50.00' : '10.00'}
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Total:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            ₨{(getTotalPrice() + getTotalPrice() * 0.1 + (formData.payment_method === 'cod' ? 50 : 10)).toFixed(2)}
          </Typography>
        </Box>
        
        {/* Payment Method Display */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: formData.payment_method === 'cod' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(25, 118, 210, 0.1)',
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
            Payment Method:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {formData.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderConfirmation = () => (
    <Card sx={{ 
      width: '100%', 
      maxWidth: '600px',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(76, 175, 80, 0.2)'
    }}>
      <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#4CAF50', mb: 2, fontWeight: 'bold' }}>
            Order Placed Successfully!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
            Order Number: {orderData?.order_number || 'ORD-12345'}
          </Typography>
        </Box>
        
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'rgba(76, 175, 80, 0.1)', 
          borderRadius: 2, 
          mb: 3 
        }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
            Thank you for your purchase! You will receive a confirmation email shortly.
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {formData.payment_method === 'cod' 
              ? 'Your order will be delivered within 3-5 business days. Please have exact change ready for the delivery person.'
              : 'Your payment has been processed successfully. Your order will be delivered within 2-3 business days.'
            }
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: '#FFD700',
              color: '#333',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#E6C200',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/shop")}
            sx={{
              borderColor: '#FFD700',
              color: '#FFD700',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#E6C200',
                color: '#E6C200',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Browse Products
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 3 } }}>
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
          <Typography variant="body1" sx={{ color: '#666', maxWidth: '600px', mx: 'auto' }}>
            Complete your order with secure payment and fast delivery
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 0 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.8rem', md: '1rem' },
                      fontWeight: activeStep === index ? 'bold' : 'normal',
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%'
            }}>
              {activeStep === 0 && renderBillingForm()}
              {activeStep === 1 && renderShippingForm()}
              {activeStep === 2 && renderPaymentForm()}
              {activeStep === 3 && renderConfirmation()}
            </Box>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid item xs={12} lg={4}>
            {activeStep < 3 && renderOrderSummary()}
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        {activeStep < 3 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ 
                px: 4,
                py: 1.5,
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === 2 ? handleSubmit : handleNext}
              disabled={loading}
              endIcon={activeStep < 2 ? <ArrowForward /> : null}
              sx={{
                backgroundColor: '#FFD700',
                color: '#333',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                minWidth: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: '#E6C200',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === 2 ? (
                'Place Order'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Checkout;

