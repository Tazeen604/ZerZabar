import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Stack,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  ShoppingCart,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { getImageUrl } from "../utils/imageUtils";
import apiService from "../services/api";

const CartEditModal = ({ open, onClose, cartItem, onUpdate }) => {
  const { updateQuantity, removeFromCart, addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(cartItem?.size || "");
  const [selectedColor, setSelectedColor] = useState(cartItem?.color || "");
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [productVariants, setProductVariants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load product variants when modal opens
  useEffect(() => {
    if (open && cartItem) {
      setSelectedSize(cartItem.size || "");
      setSelectedColor(cartItem.color || "");
      setQuantity(cartItem.quantity || 1);
      loadProductVariants();
    }
  }, [open, cartItem]);

  const loadProductVariants = async () => {
    if (!cartItem?.id) return;
    
    console.log('Loading product variants for cart item:', cartItem);
    
    // First try to use stored variants from cart item
    if (cartItem.sizes && cartItem.colors && cartItem.sizes.length > 0 && cartItem.colors.length > 0) {
      console.log('Using stored variants from cart item:', cartItem.sizes, cartItem.colors);
      setProductVariants({
        sizes: cartItem.sizes,
        colors: cartItem.colors,
        variants: cartItem.variants || []
      });
      return;
    }
    
    // If no stored variants, fetch from API
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching product variants for ID:', cartItem.id);
      const response = await apiService.getProduct(cartItem.id);
      console.log('API response:', response);
      
      if (response && response.data) {
        const product = response.data;
        console.log('Product data:', product);
        
        // Extract sizes and colors from product data
        let sizes = [];
        let colors = [];
        
        // Check if product has direct sizes and colors
        if (product.sizes && product.sizes.length > 0) {
          sizes = product.sizes;
        }
        if (product.colors && product.colors.length > 0) {
          colors = product.colors;
        }
        
        // If no direct sizes/colors, try to extract from variants
        if (sizes.length === 0 && product.variants && product.variants.length > 0) {
          const uniqueSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
          const uniqueColors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
          sizes = uniqueSizes;
          colors = uniqueColors;
        }
        
        // If still no sizes/colors, use defaults
        if (sizes.length === 0) {
          sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        }
        if (colors.length === 0) {
          colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown'];
        }
        
        console.log('Final sizes and colors:', { sizes, colors });
        
        setProductVariants({
          sizes,
          colors,
          variants: product.variants || []
        });
      } else {
        console.error('API response not successful:', response);
        setError('Product not found or API error');
        
        // Use fallback data
        setProductVariants({
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown'],
          variants: []
        });
      }
    } catch (err) {
      console.error('Error fetching product variants:', err);
      setError('Failed to load product variants: ' + err.message);
      
      // Fallback to default sizes and colors
      setProductVariants({
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown'],
        variants: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleUpdate = () => {
    if (!cartItem) return;

    // Check if size or color changed - if so, we need to create a new cart item
    const sizeChanged = selectedSize !== cartItem.size;
    const colorChanged = selectedColor !== cartItem.color;
    
    if (sizeChanged || colorChanged) {
      // Create new cart item with updated size/color
      const updatedItem = {
        ...cartItem,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        // Generate new cartId for the updated item
        cartId: `${cartItem.id}-${selectedSize}-${selectedColor}-${Date.now()}`
      };
      
      // Remove old item and add new one
      removeFromCart(cartItem.cartId);
      
      // Add the updated item to cart
      addToCart(updatedItem);
      
      setSnackbarMessage("Cart item updated successfully!");
      setSnackbarOpen(true);
      
      if (onUpdate) {
        onUpdate(updatedItem);
      }
    } else {
      // Only quantity changed, just update quantity
      updateQuantity(cartItem.cartId, quantity);
      
      setSnackbarMessage("Cart item updated successfully!");
      setSnackbarOpen(true);
      
      if (onUpdate) {
        onUpdate({
          ...cartItem,
          quantity: quantity,
        });
      }
    }
    
    onClose();
  };

  const handleRemove = () => {
    if (!cartItem) return;
    
    removeFromCart(cartItem.cartId);
    setSnackbarMessage("Item removed from cart!");
    setSnackbarOpen(true);
    
    if (onUpdate) {
      onUpdate(null); // Signal removal
    }
    
    onClose();
  };

  if (!cartItem) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        PaperProps={{
          sx: { 
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Cart Item
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && (
            <>
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && productVariants && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Debug Info:
                </Typography>
                <Typography variant="body2">
                  Sizes: {productVariants.sizes ? productVariants.sizes.join(', ') : 'None'}
                </Typography>
                <Typography variant="body2">
                  Colors: {productVariants.colors ? productVariants.colors.join(', ') : 'None'}
                </Typography>
                <Typography variant="body2">
                  Variants: {productVariants.variants ? productVariants.variants.length : 0} items
                </Typography>
              </Box>
            )}
            
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 3 }, 
              mb: 3 
            }}>
            {/* Product Image */}
            <Box sx={{ 
              width: { xs: "100%", sm: 200 }, 
              height: { xs: 250, sm: 200 }, 
              flexShrink: 0,
              mx: { xs: "auto", sm: 0 }
            }}>
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <img
                  src={getImageUrl(cartItem.image)}
                  alt={cartItem.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Box>
            
            {/* Product Details */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {cartItem.name}
              </Typography>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#000" }}>
                ₨{cartItem.price}
              </Typography>
              
              {/* Size Selection */}
              {productVariants?.sizes && productVariants.sizes.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>Size</InputLabel>
                  <Select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    label="Size"
                    disabled={loading}
                    sx={{ 
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      "& .MuiSelect-select": {
                        padding: { xs: "12px 14px", sm: "16px 14px" }
                      }
                    }}
                  >
                    {productVariants.sizes.map((size) => (
                      <MenuItem key={size} value={size} sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Color Selection */}
              {productVariants?.colors && productVariants.colors.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>Color</InputLabel>
                  <Select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    label="Color"
                    disabled={loading}
                    sx={{ 
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      "& .MuiSelect-select": {
                        padding: { xs: "12px 14px", sm: "16px 14px" }
                      }
                    }}
                  >
                    {productVariants.colors.map((color) => (
                      <MenuItem key={color} value={color} sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Quantity Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>
                  Quantity
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <IconButton
                    onClick={() => handleQuantityChange(quantity - 1)}
                    sx={{ 
                      border: "1px solid #e0e0e0",
                      width: { xs: 36, sm: 32 },
                      height: { xs: 36, sm: 32 },
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)"
                      }
                    }}
                  >
                    <Remove sx={{ fontSize: { xs: "1rem", sm: "1rem" } }} />
                  </IconButton>
                  <TextField
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    sx={{ 
                      width: { xs: 60, sm: 80 }, 
                      "& .MuiInputBase-input": { 
                        textAlign: "center",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        padding: { xs: "8px", sm: "8px" }
                      } 
                    }}
                    size="small"
                  />
                  <IconButton
                    onClick={() => handleQuantityChange(quantity + 1)}
                    sx={{ 
                      border: "1px solid #e0e0e0",
                      width: { xs: 36, sm: 32 },
                      height: { xs: 36, sm: 32 },
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)"
                      }
                    }}
                  >
                    <Add sx={{ fontSize: { xs: "1rem", sm: "1rem" } }} />
                  </IconButton>
                </Stack>
              </Box>
              
              {/* Current Selection Display */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedSize && (
                  <Chip 
                    label={`Size: ${selectedSize}`} 
                    variant="outlined" 
                    size="small"
                  />
                )}
                {selectedColor && (
                  <Chip 
                    label={`Color: ${selectedColor}`} 
                    variant="outlined" 
                    size="small"
                  />
                )}
                <Chip 
                  label={`Qty: ${quantity}`} 
                  variant="outlined" 
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Price Summary */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total Price
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#000" }}>
              ₨{(cartItem.price * quantity).toFixed(2)}
            </Typography>
          </Box>
          </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          pt: 0,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleRemove}
            sx={{ 
              mr: { xs: 0, sm: "auto" },
              width: { xs: "100%", sm: "auto" },
              py: { xs: 1.2, sm: 1 },
              fontSize: { xs: "0.9rem", sm: "0.9rem" },
              borderRadius: { xs: 2, sm: 1 },
              minHeight: { xs: "44px", sm: "40px" }
            }}
          >
            Remove Item
          </Button>
          <Button 
            onClick={onClose}
            sx={{
              width: { xs: "100%", sm: "auto" },
              py: { xs: 1.2, sm: 1 },
              fontSize: { xs: "0.9rem", sm: "0.9rem" },
              borderRadius: { xs: 2, sm: 1 },
              minHeight: { xs: "44px", sm: "40px" }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdate}
            sx={{ 
              backgroundColor: "#000", 
              "&:hover": { backgroundColor: "#333" },
              width: { xs: "100%", sm: "auto" },
              py: { xs: 1.5, sm: 1 },
              fontSize: { xs: "0.9rem", sm: "0.9rem" },
              borderRadius: { xs: 2, sm: 1 },
              minHeight: { xs: "48px", sm: "40px" }
            }}
            startIcon={<ShoppingCart sx={{ fontSize: { xs: "1rem", sm: "1rem" } }} />}
          >
            Update Cart
          </Button>
        </DialogActions>
      </Dialog>

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

export default CartEditModal;
