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
import { useCart } from "../contexts/CartReservationContext";
import { getProductImageUrl } from "../utils/imageUtils";

const CartSelectionModal = ({ open, onClose, product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
    }
  }, [product]);

  // Get available sizes from variants
  const getAvailableSizes = () => {
    if (!product || !product.variants?.length) return [];
    return [...new Set(product.variants.map(variant => variant.size).filter(Boolean))];
  };

  // Get available colors from variants
  const getAvailableColors = () => {
    if (!product || !product.variants?.length) return [];
    
    // If a size is selected, only show colors available for that size
    if (selectedSize) {
      const colorsForSize = product.variants
        .filter(variant => variant.size === selectedSize)
        .map(variant => variant.color)
        .filter(Boolean);
      return [...new Set(colorsForSize)];
    }
    
    // If no size selected, show all available colors
    return [...new Set(product.variants.map(variant => variant.color).filter(Boolean))];
  };

  // Get current stock from the selected variant
  const getCurrentStock = () => {
    if (!product || !product.variants?.length) return 0;
    
    // Find the specific variant based on selected size and color
    const selectedVariant = product.variants.find(variant => 
      variant.size === selectedSize && variant.color === selectedColor
    );
    
    if (!selectedVariant) return 0;
    
    // Return the variant's quantity directly
    return selectedVariant.quantity || 0;
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else {
      // Get stock from selected variant
      const currentStock = getCurrentStock();
      
      if (currentStock === 0) {
        setSnackbarMessage("This variant is out of stock");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      if (newQuantity > currentStock) {
        setSnackbarMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setQuantity(newQuantity);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    
    // If color is selected, check if it's available for the new size
    if (selectedColor) {
      const availableColorsForNewSize = product?.variants
        ?.filter(variant => variant.size === size)
        ?.map(variant => variant.color)
        ?.filter(Boolean) || [];
      
      // If current color is not available for new size, clear it
      if (!availableColorsForNewSize.includes(selectedColor)) {
        setSelectedColor("");
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate that both size and color are selected
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();
    
    // Check if size selection is required and not selected
    if (availableSizes.length > 0 && !selectedSize) {
      setSnackbarMessage("Please select a size");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // Check if color selection is required and not selected
    if (availableColors.length > 0 && !selectedColor) {
      setSnackbarMessage("Please select a color");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // Check if both are required but not selected
    if ((availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor)) {
      setSnackbarMessage("Please select size and color");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Check stock availability before adding to cart
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      setSnackbarMessage("This variant is out of stock");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (quantity > currentStock) {
      setSnackbarMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Find the selected variant to get the correct price
    const selectedVariant = product.variants?.find(variant => 
      variant.size === selectedSize && 
      variant.color === selectedColor
    );
    
    if (!selectedVariant) {
      setSnackbarMessage("Selected variant not found. Please select a valid size and color combination.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    const variantPrice = selectedVariant?.sale_price || selectedVariant?.price || 0;
    const variantOriginalPrice = selectedVariant?.sale_price ? selectedVariant?.price : null;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      product_id: product.product_id, // Admin-entered Product ID
      price: parseFloat(variantPrice),
      originalPrice: variantOriginalPrice ? parseFloat(variantOriginalPrice) : null,
      image: product.images?.[0]?.image_path,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      // Include product variants for cart editing
      sizes: getAvailableSizes(),
      colors: getAvailableColors(),
      variants: product.variants || []
    };
    
    addToCart(cartItem);
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarSeverity("success");
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
            mx: 'auto',
            overflow: 'hidden', // Prevent scrollbar on paper
            display: 'flex',
            flexDirection: 'column'
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
            mx: 'auto',
            overflow: 'hidden', // Prevent scrollbar
            display: 'flex',
            flexDirection: 'column'
          },
          '& .MuiDialogContent-root': {
            overflow: 'hidden !important', // Force no scrollbar
            overflowY: 'hidden !important',
            overflowX: 'hidden !important'
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
          overflow: 'hidden', // Prevent scrollbar
          '&.MuiDialogContent-root': {
            paddingTop: { xs: 2, sm: 3 },
            overflow: 'hidden' // Prevent scrollbar
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
                ₨{(() => {
                  // Find the selected variant to get the correct price
                  const selectedVariant = product.variants?.find(variant => 
                    variant.size === (selectedSize || getAvailableSizes()[0]) && 
                    variant.color === (selectedColor || getAvailableColors()[0])
                  );
                  return selectedVariant?.sale_price || selectedVariant?.price || product.sale_price || product.price || 0;
                })()}
              </Typography>
              
              {/* Size Selection */}
              {getAvailableSizes().length > 0 && (
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
                    onChange={(e) => handleSizeChange(e.target.value)}
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
                    {getAvailableSizes().map((size) => (
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
              {getAvailableColors().length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>Color</Typography>
                  <Stack direction="row" spacing={{ xs: 1, sm: 1, md: 2 }} flexWrap="wrap" rowGap={{ xs: 0.5, md: 1.5 }}>
                    {getAvailableColors().map((color, idx) => (
                      <Button
                        key={idx} 
                        variant={selectedColor === color ? "contained" : "outlined"}
                        onClick={() => setSelectedColor(color)}
                        sx={{
                          width: 65,
                          minWidth: { xs: 35, sm: 45, md: 65 },
                          height: { xs: 28, sm: 28, md: 28 },
                          borderRadius: "18px",
                          fontSize: { xs: "0.55rem", sm: "0.7rem" },
                          backgroundColor: selectedColor === color ? "#000" : "transparent",
                          color: selectedColor === color ? "#fff" : "#000",
                          borderColor: "#000",
                          marginBottom: { xs: 0.5, sm: 0 },
                          "&:hover": {
                            backgroundColor: selectedColor === color ? "#333" : "rgba(0,0,0,0.04)"
                          }
                        }}
                      >
                        {color}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}
              
              {/* Validation message */}
              {(() => {
                const availableSizes = getAvailableSizes();
                const availableColors = getAvailableColors();
                const needsSize = availableSizes.length > 0 && !selectedSize;
                const needsColor = availableColors.length > 0 && !selectedColor;
                
                if (needsSize || needsColor) {
                  return (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ 
                        color: 'error.main',
                        fontSize: { xs: "0.85rem", sm: "0.875rem" },
                        fontWeight: 500
                      }}>
                        Please select {needsSize && needsColor ? 'size and color' : needsSize ? 'a size' : 'a color'}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })()}

              {/* Stock indicator */}
              {selectedSize && selectedColor && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: getCurrentStock() > 0 ? 'success.main' : 'error.main',
                    fontSize: { xs: "0.85rem", sm: "0.875rem" },
                    fontWeight: 500
                  }}>
                    {getCurrentStock() > 0 ? `${getCurrentStock()} items available` : 'Out of stock'}
                  </Typography>
                </Box>
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
            disabled={(() => {
              const availableSizes = getAvailableSizes();
              const availableColors = getAvailableColors();
              const needsSize = availableSizes.length > 0 && !selectedSize;
              const needsColor = availableColors.length > 0 && !selectedColor;
              const currentStock = getCurrentStock();
              const isOutOfStock = selectedSize && selectedColor && currentStock === 0;
              
              // Disable if size/color not selected OR if out of stock
              return needsSize || needsColor || isOutOfStock;
            })()}
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
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CartSelectionModal;

            