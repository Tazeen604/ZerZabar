import React, { useState } from "react";
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
  Stack,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  ShoppingCart,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { getProductImageUrl } from "../utils/imageUtils";

const CartSelectionModal = ({ open, onClose, product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.sale_price || product.price || 0),
      originalPrice: product.sale_price ? parseFloat(product.price || 0) : null,
      image: product.images?.[0]?.image_path,
      size: selectedSize || product.sizes?.[0] || 'M',
      color: selectedColor || product.colors?.[0] || '',
      quantity: quantity,
      // Include product variants for cart editing
      sizes: product.sizes || [],
      colors: product.colors || [],
      variants: product.variants || []
    };
    
    addToCart(cartItem);
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarOpen(true);
    
    onClose();
  };

  const handleClose = () => {
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    onClose();
  };

  if (!product) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: { 
            borderRadius: { xs: 2, sm: 2 },
            m: { xs: 2, sm: 2 },
            maxHeight: { xs: '90vh', sm: '90vh' },
            width: { xs: '90vw', sm: '70vw', md: 450 },
            maxWidth: { xs: '70vw', sm: '70vw', md: 450 },
            minWidth: { xs: '70vw', sm: '70vw', md: 450 },
            position: 'relative',
            mx: 'auto'
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 'auto', sm: '16px' },
            maxHeight: { xs: '90vh', sm: '90vh' },
            width: { xs: '90vw', sm: '70vw', md: 450 },
            maxWidth: { xs: '90vw', sm: '70vw', md: 450 },
            minWidth: { xs: '90vw', sm: '70vw', md: 450 },
            position: 'relative',
            mx: 'auto'
          },
          '& .MuiDialog-container': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: 2, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Add to Cart
          </Typography>
          <IconButton 
            onClick={handleClose} 
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
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: { xs: 2, sm: 3 },
          '&.MuiDialogContent-root': {
            paddingTop: { xs: 2, sm: 3 }
          }
        }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 3 }, 
            mb: { xs: 2, sm: 3 }
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
                  src={getProductImageUrl(product.images)}
                  alt={product.name}
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
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                {product.name}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 3, color: "#000", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                ₨{product.sale_price || product.price}
              </Typography>
              
              {/* Size Selection */}
              {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2 } }}>
                  <InputLabel sx={{ 
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    transform: selectedSize ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, 20px) scale(1)',
                    '&.Mui-focused': {
                      transform: 'translate(14px, -9px) scale(0.75)'
                    }
                  }}>Size</InputLabel>
                  <Select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    label="Size"
                    sx={{ 
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      "& .MuiSelect-select": {
                        padding: { xs: "16px 14px", sm: "16px 14px" },
                        minHeight: { xs: "48px", sm: "40px" },
                        width: "100%"
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000"
                      }
                    }}
                  >
                    {product.sizes.map((size) => (
                      <MenuItem key={size} value={size} sx={{ 
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        minHeight: { xs: "48px", sm: "40px" },
                        width: "100%"
                      }}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Color Selection */}
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2 } }} variant:standard>
                  <InputLabel sx={{ 
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    transform: selectedColor ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, 20px) scale(1)',
                    '&.Mui-focused': {
                      transform: 'translate(14px, -9px) scale(0.75)'
                    }
                  }}>Color</InputLabel>
                  <Select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    label="Color"
                    sx={{ 
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      "& .MuiSelect-select": {
                        padding: { xs: "16px 14px", sm: "16px 14px" },
                        minHeight: { xs: "48px", sm: "40px" },
                        width: "100%"
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000"
                      }
                    }}
                  >
                    {product.colors.map((color) => (
                      <MenuItem key={color} value={color} sx={{ 
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        minHeight: { xs: "48px", sm: "40px" },
                        width: "100%"
                      }}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Quantity Selection */}
              <Box sx={{ mb: { xs: 2, sm: 2 } }}>
                <Typography variant="body2" sx={{ 
                  mb: { xs: 1.5, sm: 1 }, 
                  fontWeight: 500, 
                  fontSize: { xs: "0.9rem", sm: "0.875rem" },
                  color: "#333"
                }}>
                  Quantity
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <IconButton
                    onClick={() => handleQuantityChange(quantity - 1)}
                    size="small"
                    sx={{ 
                      border: "1px solid #e0e0e0",
                      width: { xs: 44, sm: 36 },
                      height: { xs: 44, sm: 36 },
                      borderRadius: { xs: 2, sm: 1 },
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                        borderColor: "#000"
                      },
                      "&:active": {
                        transform: "scale(0.95)"
                      }
                    }}
                  >
                    <Remove sx={{ fontSize: { xs: "1.1rem", sm: "1rem" } }} />
                  </IconButton>
                  <Typography sx={{ 
                    minWidth: { xs: 50, sm: 40 }, 
                    textAlign: "center", 
                    fontSize: { xs: "1rem", sm: "1rem" },
                    fontWeight: 600,
                    color: "#000"
                  }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(quantity + 1)}
                    size="small"
                    sx={{ 
                      border: "1px solid #e0e0e0",
                      width: { xs: 44, sm: 36 },
                      height: { xs: 44, sm: 36 },
                      borderRadius: { xs: 2, sm: 1 },
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                        borderColor: "#000"
                      },
                      "&:active": {
                        transform: "scale(0.95)"
                      }
                    }}
                  >
                    <Add sx={{ fontSize: { xs: "1.1rem", sm: "1rem" } }} />
                  </IconButton>
                </Stack>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 1, sm: 3 }, 
          pt: 0,
          flexDirection: { xs: "column", sm: "row" },
          gap: {  sm: 1 },
          justifyContent: "center",
          width: "100%"
        }}>
          <Button 
            onClick={handleClose}
            sx={{
              width: { xs: "100%", sm: "45%" },
              py: { xs: 1, sm: 1 },
              px: { xs: 2, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              borderRadius: { xs: 2, sm: 1 },
              minHeight: { xs: "40px", sm: "40px" },
              flex: { xs: 1, sm: 0 },
              textTransform: "none",
              fontWeight: { xs: 500, sm: 500 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:"#000"
            }}
          >
            Cancel
          </Button>
          <Box sx={{ width: "auto" }}>
          <Button 
            variant="contained" 
            onClick={handleAddToCart}
            fullWidth
            sx={{ 
              backgroundColor: "#000", 
              "&:hover": { backgroundColor: "#333" },
             // maxWidth: { xs: "500px", sm: "500px" },
             // width: { xs: "100%", sm: "100%" },
              py: { xs: 1, sm: 1 },
            height:{xs:50,sm:40},
              fontSize: { xs: "0.5rem", sm: "0.5rem" },
              borderRadius: { xs: 1, sm: 1 },
              minHeight: { xs: "20px", sm: "20px" },
              flex: { xs: 1, sm: 0 },
              textTransform: "none",
              fontWeight: { xs: 400, sm: 400 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1, sm: 1 }
            }}
            startIcon={<ShoppingCart sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }} />}
          >
            <Box component="span" sx={{ 
              display: { xs: "none", sm: "inline" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" }
            }}>
              Add to Cart
            </Box>
            <Box component="span" sx={{ 
              display: { xs: "inline", sm: "none" },
              fontSize: "0.8rem"
            }}>
              Add
            </Box>
          </Button>
          </Box>
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

export default CartSelectionModal;
