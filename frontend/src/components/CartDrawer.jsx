import React, { useState, useEffect } from "react";
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
import { useCart } from "../contexts/CartReservationContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import CartEditModal from "./CartEditModal";
import apiService from "../services/api";

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { items: cartItems, removeFromCart, updateQuantity, getCartTotals, clearCart, loading, error } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshedItems, setRefreshedItems] = useState([]);

  // Refresh cart items with latest product data when drawer opens
  useEffect(() => {
    if (open && cartItems.length > 0) {
      refreshCartItems();
    }
  }, [open, cartItems.length]);

  const refreshCartItems = async () => {
    try {
      const refreshedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const response = await apiService.getProduct(item.productId);
            if (response && response.data) {
              const product = response.data;
              
              // Find the selected variant to get the correct price
              const selectedVariant = product.variants?.find(variant => 
                variant.size === item.size && variant.color === item.color
              );
              
              const variantPrice = selectedVariant?.sale_price || selectedVariant?.price || item.price;
              const variantOriginalPrice = selectedVariant?.sale_price ? selectedVariant?.price : null;
              
              return {
                ...item,
                product_id: product.product_id, // Admin-entered Product ID
                price: parseFloat(variantPrice),
                originalPrice: variantOriginalPrice ? parseFloat(variantOriginalPrice) : item.originalPrice,
                image: product.images?.[0]?.image_path || item.image, // Update image from product data
                variants: product.variants || [],
                sizes: product.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [],
                colors: product.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : []
              };
            }
          } catch (error) {
            console.error('Error refreshing product data for item:', item.id, error);
            return item; // Return original item if refresh fails
          }
          return item;
        })
      );
      setRefreshedItems(refreshedItems);
    } catch (error) {
      console.error('Error refreshing cart items:', error);
      setRefreshedItems(cartItems);
    }
  };

  // Get current stock for a cart item
  const getCurrentStock = (cartItem) => {
    if (!cartItem) return 0;
    
    // Use refreshed item if available, otherwise use original cart item
    const itemToCheck = refreshedItems.find(refreshed => refreshed.cartId === cartItem.cartId) || cartItem;
    
    // Check if cart item has variant data
    if (itemToCheck.variants && itemToCheck.variants.length > 0) {
      // Find the specific variant based on size and color
      const selectedVariant = itemToCheck.variants.find(variant => 
        variant.size === itemToCheck.size && variant.color === itemToCheck.color
      );
      
      if (selectedVariant) {
        return selectedVariant.quantity || 0;
      }
    }
    
    // Fallback to old stock_quantity if no variant data
    return itemToCheck.stock_quantity || 0;
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      const result = await removeFromCart(cartItemId);
      if (result.success) {
        setSnackbarMessage(result.message);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(result.message);
        setSnackbarOpen(true);
      }
    } else {
      // Find the cart item to check stock
      const cartItem = cartItems.find(item => item.id === cartItemId);
      if (cartItem) {
        // Use the getCurrentStock function which handles refreshed items
        const currentStock = getCurrentStock(cartItem);
        
        if (currentStock === 0) {
          setSnackbarMessage("This variant is out of stock");
          setSnackbarOpen(true);
          return;
        }
        if (newQuantity > currentStock) {
          setSnackbarMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
          setSnackbarOpen(true);
          return;
        }
      }
      
      const result = await updateQuantity(cartItemId, newQuantity);
      if (result.success) {
        setSnackbarMessage(result.message);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(result.message);
        setSnackbarOpen(true);
      }
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    const result = await removeFromCart(cartItemId);
    if (result.success) {
      setSnackbarMessage(result.message);
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(result.message);
      setSnackbarOpen(true);
    }
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
    onClose(); // Close the cart drawer when opening edit modal
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleEditUpdate = (updatedItem) => {
    if (updatedItem) {
      // No-op: Edit modal handles updating the cart and messages
    } else {
      setSnackbarMessage("Item removed from cart!");
      setSnackbarOpen(true);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    onClose(); // Close the cart drawer
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
            height: { xs: "calc(100vh - 80px)", sm: "100vh", md: "100vh" },
            top: { xs: 80, sm: 0, md: 0 },
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
                    <Box 
                      sx={{ 
                        width: { xs: 80, sm: 100 }, 
                        height: { xs: 80, sm: 100 }, 
                        flexShrink: 0,
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8
                        }
                      }}
                      onClick={() => handleProductClick(item.productId)}
                    >
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
                          WebkitBoxOrient: "vertical",
                          cursor: "pointer",
                          "&:hover": {
                            color: "primary.main",
                            textDecoration: "underline"
                          }
                        }}
                        onClick={() => handleProductClick(item.productId)}
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
                      
                      {/* Stock indicator */}
                      <Typography variant="body2" sx={{ 
                        color: getCurrentStock(item) > 0 ? 'success.main' : 'error.main',
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        fontWeight: 500,
                        mb: 1
                      }}>
                        {getCurrentStock(item) > 0 ? `${getCurrentStock(item)} available` : 'Out of stock'}
                      </Typography>
                      
                      {/* Quantity Controls */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
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
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
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
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
                            onClick={() => handleRemoveItem(item.id)}
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
                  Total ({getCartTotals().itemCount} {getCartTotals().itemCount === 1 ? 'item' : 'items'})
            </Typography>
                <Typography variant="h5" sx={{ fontWeight: 550, color: "#000", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                  ₨{parseFloat(getCartTotals().totalAmount || 0).toFixed(2)}
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