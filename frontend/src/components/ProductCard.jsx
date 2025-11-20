import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Chip,
  Fade,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  ShoppingCart,
  Visibility,
  Favorite,
  FavoriteBorder,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartReservationContext";
import { getProductImageUrl } from "../utils/imageUtils";

const ProductCard = ({ 
  product, 
  showHoverButtons = true, 
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  cardHeight = "350px",
  imageHeight = "320px",
  showDiscount = true,
  showWishlist = true,
  showQuickView = true,
  showAddToCart = true,
  showStock = true,
  variant = "default" // "default", "compact", "minimal"
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [hovered, setHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };


  const handleQuickView = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product, !isWishlisted);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    setModalOpen(true);
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

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  // Extract unique sizes and colors from variants
  const getAvailableSizes = () => {
    if (!product?.variants?.length) return [];
    const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
    return sizes;
  };

  const getAvailableColors = () => {
    if (!product?.variants?.length) return [];
    
    // If a size is selected, only show colors available for that size
    if (selectedSize) {
      const colorsForSize = product.variants
        .filter(variant => variant.size === selectedSize)
        .map(variant => variant.color)
        .filter(Boolean);
      return [...new Set(colorsForSize)];
    }
    
    // If no size selected, show all available colors
    const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
    return colors;
  };

  // Check if all required options are selected
  const areAllOptionsSelected = () => {
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();
    const hasSize = !availableSizes.length || selectedSize;
    const hasColor = !availableColors.length || selectedColor;
    return hasSize && hasColor;
  };

  // Get current stock from the selected variant
  const getCurrentStock = () => {
    if (!product || !product.variants?.length) return 0;
    
    // Find the specific variant based on selected size and color
    const selectedVariant = product.variants.find(variant => 
      variant.size === selectedSize && variant.color === selectedColor
    );
    
    if (!selectedVariant) return 0;
    
    // Return the variant's inventory quantity
    return selectedVariant.quantity || 0;
  };

  // Get button text based on selection status
  const getButtonText = () => {
    if (!areAllOptionsSelected()) return "Select Options";
    const currentStock = getCurrentStock();
    if (currentStock === 0) return "Out of Stock";
    return "Add to Cart";
  };

  const handleModalAddToCart = () => {
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();
    
    // Check stock availability before adding to cart
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      setSnackbarMessage("This variant is out of stock");
      setSnackbarOpen(true);
      return;
    }
    if (quantity > currentStock) {
      setSnackbarMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
      setSnackbarOpen(true);
      return;
    }
    
    // Find the selected variant to get the correct price
    const selectedVariant = product.variants?.find(variant => 
      variant.size === (selectedSize || availableSizes[0]) && 
      variant.color === (selectedColor || availableColors[0])
    );
    
    const variantPrice = selectedVariant?.sale_price || selectedVariant?.price || 0;
    const variantOriginalPrice = selectedVariant?.sale_price ? selectedVariant?.price : null;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      product_id: product.product_id, // Admin-entered Product ID
      price: parseFloat(variantPrice),
      originalPrice: variantOriginalPrice ? parseFloat(variantOriginalPrice) : null,
      image: product.images?.[0]?.image_path,
      size: selectedSize || (availableSizes.length > 0 ? availableSizes[0] : ''),
      color: selectedColor || (availableColors.length > 0 ? availableColors[0] : ''),
      quantity: quantity,
      // Include product variants for cart editing
      sizes: availableSizes,
      colors: availableColors,
      variants: product.variants || []
    };
    
    addToCart(cartItem);
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarOpen(true);
    setModalOpen(false);
    
    if (onAddToCart) {
      onAddToCart(product, cartItem);
    }
  };




  const getDiscountPercentage = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const discountPercentage = getDiscountPercentage(product?.price, product?.sale_price);

  const renderHoverButtons = () => {
    if (!showHoverButtons || variant === "minimal") return null;

    return (
      <Fade in={hovered}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: { xs: 1, sm: 2 },
            zIndex: 2,
          }}
        >
          {showQuickView && (
            <IconButton
              onClick={handleQuickView}
              sx={{
                backgroundColor: "white",
                color: "#000",
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                "&:hover": { 
                  backgroundColor: "#f5f5f5",
                  transform: "scale(1.1)"
                },
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              <Visibility sx={{ fontSize: { xs: "16px", sm: "20px" } }} />
            </IconButton>
          )}
          
          {showAddToCart && (
            <IconButton
              onClick={handleAddToCartClick}
              sx={{
                backgroundColor: "#000",
                color: "white",
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                "&:hover": { 
                  backgroundColor: "#333",
                  transform: "scale(1.1)"
                },
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              <ShoppingCart sx={{ fontSize: { xs: "16px", sm: "20px" } }} />
            </IconButton>
          )}
          
          {showWishlist && (
            <IconButton
              onClick={handleWishlistToggle}
              sx={{
                backgroundColor: "white",
                color: isWishlisted ? "#ff6b6b" : "#000",
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                "&:hover": { 
                  backgroundColor: "#f5f5f5",
                  transform: "scale(1.1)"
                },
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              {isWishlisted ? <Favorite sx={{ fontSize: { xs: "16px", sm: "20px" } }} /> : <FavoriteBorder sx={{ fontSize: { xs: "16px", sm: "20px" } }} />}
            </IconButton>
          )}
          
        </Box>
      </Fade>
    );
  };

  const renderCardContent = () => {
    if (variant === "minimal") {
      return (
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {(() => {
              const salePrice = product?.variants?.[0]?.sale_price || product?.sale_price;
              const originalPrice = product?.variants?.[0]?.price || product?.price;
              
              if (salePrice && salePrice < originalPrice) {
                return (
                  <>
                    <Typography variant="body2" sx={{ 
                      color: "error.main", 
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" } 
                    }}>
                      ₨{salePrice}
          </Typography>
                    <Typography variant="body2" sx={{ 
                      color: "text.secondary", 
                      textDecoration: "line-through",
                      fontSize: { xs: "0.6rem", sm: "0.7rem" } 
                    }}>
                      ₨{originalPrice}
                    </Typography>
                  </>
                );
              } else {
                return (
                  <Typography variant="body2" sx={{ 
                    color: "text.secondary", 
                    fontSize: { xs: "0.7rem", sm: "0.75rem" } 
                  }}>
                    ₨{originalPrice || 0}
                  </Typography>
                );
              }
            })()}
          </Box>
        </Box>
      );
    }

    return (
      <CardContent sx={{ 
        height: "auto",
        minHeight: { xs: "auto", sm: "auto" },
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "flex-start",
        m: 0,
        mb: 0,
        p: { xs: 1.5, sm: 2 }, 
        pb: { xs: 1,sm: 1 },
        "&:last-child": { mb: 1, pb: { xs: 1, sm: 1 } },
        overflow: "visible",
      }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.1, sm: 0.5 } }}>
          {/* Category - Grey color */}
          {product.category && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#666",
                fontSize: { xs: "0.5rem", sm: "0.6rem" },
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 500
              }}
            >
              {product.category.name}
            </Typography>
          )}
          
          {/* Product Name - Black color */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: { xs: "0.6rem", sm: "0.8rem" },
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: { xs: 1, sm: 2 },
              WebkitBoxOrient: "vertical",
              color: "#000"
            }}
          >
            {product.name}
          </Typography>
          
          {/* Product Price - Black color */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {(() => {
              const salePrice = product?.variants?.[0]?.sale_price || product?.sale_price;
              const originalPrice = product?.variants?.[0]?.price || product?.price;
              
              if (salePrice && salePrice < originalPrice) {
                return (
                  <>
                    <Typography variant="h6" sx={{ 
                      color: "error.main", 
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.9rem" } 
                    }}>
                      ₨{salePrice}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: "text.secondary", 
                      textDecoration: "line-through",
                      fontSize: { xs: "0.6rem", sm: "0.8rem" } 
                    }}>
                      ₨{originalPrice}
                    </Typography>
                  </>
                );
              } else {
                return (
                  <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: "#000", 
              fontSize: { xs: "0.7rem", sm: "0.9rem" } 
                  }}>
                    ₨{originalPrice || 0}
          </Typography>
                );
              }
            })()}
          </Box>
          
          {/* Stock Status - Red/Green color */}
          {showStock && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: (() => {
                  // Calculate total stock from variants if available, otherwise use legacy fields
                  let totalStock = 0;
                  
                  if (product.variants && product.variants.length > 0) {
                    // Use variant quantity directly
                    totalStock = product.variants.reduce((sum, variant) => {
                      return sum + (variant.quantity || 0);
                    }, 0);
                  } else {
                    // Fallback to legacy inventory fields
                    totalStock = product.stock || product.inventory?.quantity || product.quantity || 0;
                  }
                  
                  return totalStock > 0 ? "#4CAF50" : "#f44336";
                })(),
                fontSize: { xs: "0.5rem", sm: "0.6rem" },
                fontWeight: 600,
                display: "block"
              }}
            >
              {(() => {
                // Calculate total stock from variants if available, otherwise use legacy fields
                let totalStock = 0;
                
                if (product.variants && product.variants.length > 0) {
                  // Use variant quantity directly - sum all variant quantities
                  totalStock = product.variants.reduce((sum, variant) => {
                    return sum + (variant.quantity || 0);
                  }, 0);
                } else {
                  // Fallback to legacy inventory fields
                  totalStock = product.stock || product.inventory?.quantity || product.quantity || 0;
                }
                
                return totalStock > 0 ? "In Stock" : "Out of Stock";
              })()}
            </Typography>
          )}
        </Box>
        
      </CardContent>
    );
  };

  return (
    <>
      <Card
        sx={{
          height: { xs: "auto", sm: cardHeight },
          minHeight: { xs: "auto", sm: "350px" },
          width: variant === "minimal" ? "100%" : { xs: "calc(100% - 1px)", sm: "100%" },
          minWidth: variant === "minimal" ? "auto" : { xs: "calc(100% - 1px)", sm: "220px" },
          maxWidth: variant === "minimal" ? "100%" : { xs: "calc(100% - 1px)", sm: "320px" },
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "all 0.2s ease",
          borderRadius: 0,
          boxShadow: "none",
          border: "1px solid #f0f0f0",
          flexShrink: 0,
          position: "relative",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          },
        }}
        onClick={handleProductClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "180px", sm: imageHeight },
            minHeight: { xs: "180px", sm: imageHeight },
            maxHeight: { xs: "180px", sm: imageHeight },
            overflow: "hidden",
            backgroundColor: "#f9f9f9",
            flexShrink: 0,
          
          }}
        >
          <img
            src={getProductImageUrl(product.images)}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
            }}
          />
          
          {showDiscount && discountPercentage > 0 && (
            <Chip
              label={`-${discountPercentage}%`}
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "#ff4444",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            />
          )}
          
          {renderHoverButtons()}
        </Box>
        
        {renderCardContent()}
      </Card>

      {/* Add to Cart Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        PaperProps={{
          sx: { 
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '100%', sm: '500px' },
            overflow: 'hidden', // Prevent scrollbar on paper
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 0, sm: '16px' },
            maxHeight: { xs: '100vh', sm: '90vh' },
            overflow: 'hidden', // Prevent scrollbar
            display: 'flex',
            flexDirection: 'column'
          },
          '& .MuiDialogContent-root': {
            overflow: 'hidden !important', // Force no scrollbar
            overflowY: 'hidden !important',
            overflowX: 'hidden !important'
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
            onClick={handleModalClose} 
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
              height: { xs:300, sm: 350 }, 
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
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {(() => {
                  const salePrice = product?.variants?.[0]?.sale_price || product?.sale_price;
                  const originalPrice = product?.variants?.[0]?.price || product?.price;
                  
                  if (salePrice && salePrice < originalPrice) {
                    return (
                      <>
                        <Typography variant="h5" sx={{ 
                          color: "error.main", 
                          fontWeight: 500,
                          fontSize: "1.25rem" 
                        }}>
                          ₨{salePrice}
              </Typography>
                        <Typography variant="h6" sx={{ 
                          color: "text.secondary", 
                          textDecoration: "line-through",
                          fontSize: "1rem" 
                        }}>
                          ₨{originalPrice}
                        </Typography>
                      </>
                    );
                  } else {
                    return (
                      <Typography variant="h5" sx={{ 
                        fontWeight: 500, 
                        color: "#000",
                        fontSize: "1.25rem" 
                      }}>
                        ₨{originalPrice || 0}
                      </Typography>
                    );
                  }
                })()}
              </Box>
              
              {/* Stock indicator */}
              {selectedSize && selectedColor && (
                <Typography variant="body2" sx={{ 
                  color: getCurrentStock() > 0 ? 'success.main' : 'error.main',
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  mb: 2,
                  fontWeight: 500
                }}>
                  {getCurrentStock() > 0 ? `${getCurrentStock()} items available` : 'Out of stock'}
                </Typography>
              )}
              
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
                        minHeight: { xs: "48px", sm: "40px" }
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
                        minHeight: { xs: "48px", sm: "40px" }
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
                  <Button
                    size="small"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    sx={{ 
                      minWidth: { xs: 44, sm: 32 }, 
                      height: { xs: 44, sm: 32 },
                      borderRadius: { xs: 2, sm: 1 },
                      border: "1px solid #e0e0e0",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                        borderColor: "#000"
                      },
                      "&:active": {
                        transform: "scale(0.95)"
                      }
                    }}
                  >
                    -
                  </Button>
                  <Typography sx={{ 
                    mx: 2, 
                    minWidth: { xs: 50, sm: 40 }, 
                    textAlign: "center",
                    fontSize: { xs: "1rem", sm: "1rem" },
                    fontWeight: 600,
                    color: "#000"
                  }}>
                    {quantity}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      const currentStock = getCurrentStock();
                      
                      if (currentStock === 0) {
                        setSnackbarMessage("This variant is out of stock");
                        setSnackbarOpen(true);
                        return;
                      }
                      if (quantity + 1 > currentStock) {
                        setSnackbarMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
                        setSnackbarOpen(true);
                        return;
                      }
                      setQuantity(quantity + 1);
                    }}
                    sx={{ 
                      minWidth: { xs: 44, sm: 32 }, 
                      height: { xs: 44, sm: 32 },
                      borderRadius: { xs: 2, sm: 1 },
                      border: "1px solid #e0e0e0",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                        borderColor: "#000"
                      },
                      "&:active": {
                        transform: "scale(0.95)"
                      }
                    }}
                  >
                    +
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          pt: 0,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={handleModalClose}
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
            onClick={handleModalAddToCart}
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
            disabled={!areAllOptionsSelected() || getCurrentStock() === 0}
          >
            {getButtonText()}
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

export default ProductCard;
