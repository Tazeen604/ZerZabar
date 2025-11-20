import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  Chip,
  Paper,
  Stack,
  Avatar,
  InputAdornment,
} from "@mui/material";
import Breadcrumbs from "../components/Breadcrumbs";
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
  Lock,
  Help,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartReservationContext";
import PageContainer from "../components/PageContainer";
import Footer from "../components/Footer";
import { getCartImageUrl } from "../utils/imageUtils";
import CartEditModal from "../components/CartEditModal";

const ViewCart = () => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
  } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Edit modal state for cart item editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 120px)", background: "#ffffff", pt: 8 }}>
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
              width: 80,
              height: 80,
              backgroundColor: "#f0f0f0",
              mb: 2,
            }}
          >
            <ShoppingBag sx={{ fontSize: 40, color: "#999" }} />
          </Avatar>
          
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: "#000", fontSize: "1.625rem" }}>
            Your Cart is Empty
          </Typography>
          
          <Typography variant="body2" sx={{ color: "#666", mb: 3, maxWidth: 400, fontSize: "0.9375rem" }}>
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            onClick={handleContinueShopping}
            sx={{
              background: "#FFD700",
              color: "#000",
              "&:hover": { background: "#E6C200" },
              px: 3,
              py: 1,
              fontSize: "0.9375rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "calc(100vh - 120px)", background: "#ffffff", pt: { xs: 10, sm: 10, md: 10 }, pb: 4 }}>
      <Breadcrumbs />
      <Box sx={{ maxWidth: "1800px", mx: "auto", px: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, mt: 4, justifyContent: "center" }}>
          <ShoppingCart sx={{ fontSize: "1.5rem", mr: 1, color: "#000" }} />
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#000", fontSize: "1.875rem" }}>
            My Cart
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          {/* Left Side - Cart Items */}
          <Grid item xs={12} lg={7} sx={{ pr: { lg: 1 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {items.map((item) => (
                <Paper
                  key={item.cartId}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    backgroundColor: "white",
                    minHeight: "200px",
                    width: "100%",
                    borderBottom: "1px solid #eee",
                    pb: { xs: 1.5, sm: 2 },
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                    {/* Product Image */}
                    <Box
                      sx={{
                        width: { xs: "100%", sm: 140 },
                        height: { xs: 220, sm: 180 },
                        overflow: "hidden",
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                        flexShrink: 0,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={getCartImageUrl(item.image)}
                            alt={item.name}
                            style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f0f0f0",
                            color: "#999",
                              }}
                            >
                              <ShoppingBag />
                            </Box>
                          )}
                        </Box>

                        {/* Product Details */}
                    <Box sx={{ flexGrow: 1, ml: { xs: 0, sm: 2, md: 6 }, mt: { xs: 1, sm: 0 } }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, fontSize: "0.9375rem" }}>
                            {item.name}
                          </Typography>
                          
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                            {item.size && (
                          <Typography variant="caption" sx={{ color: "#666", fontSize: "0.8125rem" }}>
                            Size: {item.size}
                          </Typography>
                            )}
                            {item.color && (
                          <Typography variant="caption" sx={{ color: "#666", fontSize: "0.8125rem" }}>
                            Color: {item.color}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: "#4CAF50", fontSize: "0.8125rem" }}>
                          In Stock
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: 1, sm: 0 } }}>
                        {/* Price */}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.9375rem" }}>
                            ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                          </Typography>
                          </Box>

                            {/* Quantity Controls */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <IconButton
                                onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                                size="small"
                            sx={{ 
                              border: "1px solid #ddd", 
                              width: "24px", 
                              height: "24px",
                              fontSize: "0.75rem"
                            }}
                          >
                            <Remove sx={{ fontSize: "0.875rem" }} />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.cartId, parseInt(e.target.value) || 1)}
                            sx={{ 
                              width: "40px",
                              "& .MuiInputBase-input": {
                                textAlign: "center",
                                fontSize: "0.75rem",
                                padding: "4px"
                              }
                            }}
                            size="small"
                              />
                              <IconButton
                                onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                                size="small"
                            sx={{ 
                              border: "1px solid #ddd", 
                              width: "24px", 
                              height: "24px",
                              fontSize: "0.75rem"
                            }}
                          >
                            <Add sx={{ fontSize: "0.875rem" }} />
                              </IconButton>
                            </Box>

                        {/* Remove Button */}
                              <IconButton
                                onClick={() => removeFromCart(item.cartId)}
                                size="small"
                          sx={{ color: "#666" }}
                              >
                          <Delete sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Box>

                      {/* Action Links */}
                      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ color: "#666", cursor: "pointer", fontSize: "0.8125rem" }}
                          onClick={() => handleEditItem(item)}
                        >
                          Edit
                        </Typography>
                       
                       
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}

              {/* Cart Subtotal */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.9375rem" }}>
                  {getCartTotals().itemCount} Items
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.9375rem" }}>
                 Total ₨{getCartTotals().totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Order Summary */}
          <Grid item xs={12} lg={3} sx={{ pl: { lg: 1 } }}>
            <Paper sx={{ p: 3, backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              {/* Promo Code */}
              <Box sx={{ mb: 3 }}>
                
                <Box sx={{ display: "flex", gap: 1 }}>
                 
                </Box>
                </Box>

              {/* Cost Breakdown */}
                <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8125rem" }}>
                    Shipping
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8125rem" }}>
                    ₨200
                  </Typography>
                  </Box>
                  
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8125rem" }}>
                    Discount
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8125rem" }}>
                    -₨0
                    </Typography>
                  </Box>
                  
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "0.9375rem" }}>
                    Estimated Total
                    </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "0.9375rem" }}>
                    ₨{(getCartTotals().totalAmount + 200).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

              {/* Payment Option */}
              <Box sx={{ mb: 3 }}>
               
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                
                 
                </Box>
              </Box>

             

              {/* Checkout Button */}
                  <Button
                    variant="contained"
                fullWidth
                    onClick={handleCheckout}
                    sx={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  fontWeight: "bold",
                      py: 1.5,
                  fontSize: "0.9375rem",
                  textTransform: "none",
                  mb: 2,
                  "&:hover": {
                    backgroundColor: "#E6C200",
                  }
                }}
                startIcon={<Lock sx={{ fontSize: "1rem" }} />}
              >
                Checkout
                  </Button>
                  
              {/* Continue Shopping Button */}
                  <Button
                    variant="outlined"
                fullWidth
                    onClick={handleContinueShopping}
                    sx={{
                  borderColor: "#ddd",
                  color: "#000",
                  
                  py: 1,
                  fontSize: "0.8125rem",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#000",
                    backgroundColor: "rgba(0,0,0,0.05)",
                  }
                    }}
                  >
                    Continue Shopping
                  </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Footer />
      {/* Cart Edit Modal */}
      <CartEditModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        cartItem={selectedItem}
        onUpdate={() => {}}
      />
    </Box>
  );
};

export default ViewCart;