import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  TextField,
  Chip,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Delete,
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  ShoppingBag,
  LocalShipping,
  Security,
  Support,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import PageContainer from "../components/PageContainer";

const ViewCart = () => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartId);
    } else {
      updateQuantity(cartId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#f8f9fa" }}>
        {/* Empty Cart */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            px: 3,
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              backgroundColor: "#f0f0f0",
              mb: 3,
            }}
          >
            <ShoppingBag sx={{ fontSize: 60, color: "#999" }} />
          </Avatar>
          
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, color: "#333" }}>
            Your Cart is Empty
          </Typography>
          
          <Typography variant="body1" sx={{ color: "#666", mb: 4, maxWidth: 400 }}>
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
            sx={{
              background: "#FFD700",
              "&:hover": { background: "#E6C200" },
              px: 4,
              py: 1.5,
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <PageContainer maxWidth="lg" sx={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <Grid container spacing={4}>
          {/* Left Half - Product Images Gallery */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Main Image Display */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  {items[selectedImageIndex]?.image ? (
                    <img
                      src={`http://localhost:8000/storage/${items[selectedImageIndex].image}`}
                      alt={items[selectedImageIndex].name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#999',
                      }}
                    >
                      <Typography variant="h6">No Image Available</Typography>
                    </Box>
                  )}
                </Box>

                {/* Thumbnail Gallery */}
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Product Images:
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      overflowX: 'auto',
                      pb: 1,
                    }}
                  >
                    {items.map((item, index) => (
                      <Box
                        key={item.cartId}
                        onClick={() => setSelectedImageIndex(index)}
                        sx={{
                          minWidth: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selectedImageIndex === index ? '3px solid #FFD700' : '3px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        {item.image ? (
                          <img
                            src={`http://localhost:8000/storage/${item.image}`}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f0f0f0',
                              color: '#999',
                            }}
                          >
                            <ShoppingBag />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Half - Cart Details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              position: { md: 'sticky' },
              top: { md: 100 }, // Below navbar
              maxHeight: { md: 'calc(100vh - 120px)' },
              overflow: { md: 'auto' }
            }}>
              <CardContent sx={{ p: 3 }}>
                {/* Cart Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Shopping Cart ({getTotalItems()} items)
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={clearCart}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear Cart
                  </Button>
                </Box>

                {/* Cart Items */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                  {items.map((item) => (
                    <Paper
                      key={item.cartId}
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Product Image */}
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            flexShrink: 0,
                          }}
                        >
                          {item.image ? (
                            <img
                              src={`http://localhost:8000/storage/${item.image}`}
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f0f0f0',
                                color: '#999',
                              }}
                            >
                              <ShoppingBag />
                            </Box>
                          )}
                        </Box>

                        {/* Product Details */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {item.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            {item.size && (
                              <Chip label={`Size: ${item.size}`} size="small" variant="outlined" />
                            )}
                            {item.color && (
                              <Chip label={`Color: ${item.color}`} size="small" variant="outlined" />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* Quantity Controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                                size="small"
                                sx={{ border: '1px solid #ddd' }}
                              >
                                <Remove />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.cartId, parseInt(e.target.value) || 1)}
                                sx={{ width: '60px' }}
                                inputProps={{ style: { textAlign: 'center' } }}
                              />
                              <IconButton
                                onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                                size="small"
                                sx={{ border: '1px solid #ddd' }}
                              >
                                <Add />
                              </IconButton>
                            </Box>

                            {/* Price and Remove */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                                ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                              </Typography>
                              <IconButton
                                onClick={() => removeFromCart(item.cartId)}
                                color="error"
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Order Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Order Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal ({getTotalItems()} items)</Typography>
                    <Typography variant="body1">₨{getTotalPrice().toFixed(2)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Shipping</Typography>
                    <Typography variant="body1" color="success.main">
                      Free
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Tax</Typography>
                    <Typography variant="body1">₨{(getTotalPrice() * 0.1).toFixed(2)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                      ₨{(getTotalPrice() + getTotalPrice() * 0.1).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCheckout}
                    sx={{
                      background: '#FFD700',
                      '&:hover': { background: '#E6C200' },
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleContinueShopping}
                    sx={{
                      borderColor: '#FFD700',
                      color: '#FFD700',
                      '&:hover': {
                        borderColor: '#E6C200',
                        background: 'rgba(255,215,0,0.1)',
                      },
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Stack>

                {/* Trust Badges */}
                <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">Free Shipping</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">Secure Payment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Support sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">24/7 Support</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </PageContainer>
  );
};

export default ViewCart;