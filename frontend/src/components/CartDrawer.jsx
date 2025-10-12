import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  Chip,
  Snackbar,
  Alert,
  TextField,
  Badge,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  ShoppingCart,
  Delete,
  ShoppingBag,
  Edit,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import CartEditModal from "./CartEditModal";

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { items: cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartId);
      setSnackbarMessage("Item removed from cart");
      setSnackbarOpen(true);
    } else {
      updateQuantity(cartId, newQuantity);
    }
  };

  const handleRemoveItem = (cartId) => {
    removeFromCart(cartId);
    setSnackbarMessage("Item removed from cart");
    setSnackbarOpen(true);
  };

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    navigate("/cart");
  };

  const handleClearCart = () => {
    clearCart();
    setSnackbarMessage("Cart cleared");
    setSnackbarOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleEditUpdate = (updatedItem) => {
    if (updatedItem) {
      setSnackbarMessage("Cart item updated successfully!");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Item removed from cart!");
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "90vw", sm: "70vw", md: 450 },
            maxWidth: { xs: "90vw", sm: "70vw", md: 450 },
            minWidth: { xs: "300px", sm: "350px", md: 450 },
            height: "100vh",
            display: "flex",
            flexDirection: "column"
          }
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShoppingBag sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" }, color: "#000" }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                Shopping Cart
            </Typography>
             
            </Box>
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{ 
                fontSize: { xs: "1.4rem", sm: "1.2rem" },
                width: { xs: 40, sm: 36 },
                height: { xs: 40, sm: 36 },
                backgroundColor: { xs: "rgba(0,0,0,0.1)", sm: "transparent" },
                border: { xs: "1px solid rgba(0,0,0,0.2)", sm: "none" },
                borderRadius: { xs: "50%", sm: "4px" },
                "&:hover": { 
                  backgroundColor: "rgba(0,0,0,0.15)",
                  transform: { xs: "scale(1.1)", sm: "scale(1.05)" }
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
          
          {/* Cart Items */}
          <Box sx={{ flex: 1, overflow: "auto", mb: { xs: 2, sm: 3 } }}>
            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingCart sx={{ fontSize: "3rem", color: "#ccc", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                  Your cart is empty
                </Typography>
                <Typography variant="body2" sx={{ color: "#999" }}>
                  Add some items to get started
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {cartItems.map((item) => (
                  <Box
                    key={item.cartId}
                    sx={{
                      display: "flex",
                      gap: { xs: 1.5, sm: 2 },
                      p: { xs: 1.5, sm: 2 },
                      border: "1px solid #f0f0f0",
                      borderRadius: 2,
                      backgroundColor: "#fafafa"
                    }}
                  >
                    {/* Product Image */}
                    <Box sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, flexShrink: 0 }}>
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 1,
                  overflow: "hidden",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Box>
                    
                    {/* Product Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 550, 
                          mb: 0.5, 
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        }}
                      >
                        {item.name}
              </Typography>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 400, 
                          color: "#000", 
                          fontSize: { xs: "0.5rem", sm: "1rem" },
                          mb: 0.5
                        }}
                      >
                        ₨{parseFloat(item.price || 0).toFixed(2)}
              </Typography>
                      
                      {/* Item Options */}
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                        {item.size && (
                          <Chip 
                            label={`Size: ${item.size}`} 
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                          />
                        )}
                        {item.color && (
                          <Chip 
                            label={`Color: ${item.color}`} 
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                          />
                        )}
                      </Stack>
                      
                      {/* Quantity Controls */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                            onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                size="small"
                sx={{ 
                  border: "1px solid #e0e0e0",
                              width: { xs: 32, sm: 28 },
                              height: { xs: 32, sm: 28 },
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)"
                              }
                            }}
                          >
                            <Remove sx={{ fontSize: { xs: "0.8rem", sm: "0.8rem" } }} />
              </IconButton>
              <TextField
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.cartId, parseInt(e.target.value) || 1)}
                sx={{ 
                              width: { xs: 50, sm: 60 }, 
                  "& .MuiInputBase-input": { 
                    textAlign: "center",
                                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                padding: { xs: "6px", sm: "8px" }
                  } 
                }}
                size="small"
              />
              <IconButton
                            onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                size="small"
                sx={{ 
                  border: "1px solid #e0e0e0",
                              width: { xs: 32, sm: 28 },
                              height: { xs: 32, sm: 28 },
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)"
                              }
                            }}
                          >
                            <Add sx={{ fontSize: { xs: "0.8rem", sm: "0.8rem" } }} />
                          </IconButton>
                        </Stack>
                        
                        {/* Action Buttons */}
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            onClick={() => handleEditItem(item)}
                            size="small"
                            sx={{ 
                              color: "#1976d2",
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.1)"
                              }
                            }}
                          >
                            <Edit sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }} />
                          </IconButton>
                          <IconButton
                            onClick={() => handleRemoveItem(item.cartId)}
                            size="small"
                            sx={{ 
                              color: "#f44336",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.1)"
                              }
                            }}
                          >
                            <Delete sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }} />
              </IconButton>
            </Stack>
          </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
          
          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <>
          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
          
              {/* Total */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 550, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                  Total ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
            </Typography>
                <Typography variant="h5" sx={{ fontWeight: 550, color: "#000", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                  ₨{parseFloat(getTotalPrice() || 0).toFixed(2)}
            </Typography>
          </Box>
          
          {/* Action Buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2 } }}>
            <Button
              variant="contained"
              fullWidth
                  onClick={handleCheckout}
              sx={{
                backgroundColor: "#000",
                "&:hover": { backgroundColor: "#333" },
                    py: { xs: 1.5, sm: 1.5 },
                    fontSize: { xs: "0.9rem", sm: "0.9rem" },
                fontWeight: 600,
                    textTransform: "uppercase",
                    borderRadius: { xs: 2, sm: 1 },
                    minHeight: { xs: "48px", sm: "44px" }
              }}
                  startIcon={<ShoppingCart sx={{ fontSize: { xs: "1rem", sm: "1rem" } }} />}
            >
                  Checkout
            </Button>
            
                {cartItems.length > 0 && (
            <Button
                    variant="text"
              fullWidth
                    onClick={handleClearCart}
              sx={{
                      color: "#f44336",
                      py: { xs: 1, sm: 0.8 },
                      fontSize: { xs: "0.8rem", sm: "0.8rem" },
                      "&:hover": { 
                        backgroundColor: "rgba(244, 67, 54, 0.1)" 
                      }
                    }}
                  >
                    Clear Cart
            </Button>
                )}
          </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Cart Edit Modal */}
      <CartEditModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        cartItem={selectedItem}
        onUpdate={handleEditUpdate}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CartDrawer;