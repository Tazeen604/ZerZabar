import React, { useState, useEffect, useRef } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Tooltip,
  Fade,
  Chip
} from "@mui/material";
import { 
  ChevronLeft, 
  ChevronRight, 
  Visibility, 
  ShoppingCart,
  Favorite,
  FavoriteBorder
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";
import { getProductImageUrl } from "../utils/imageUtils";

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const intervalRef = useRef(null);

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1200) return 4; // Desktop: 4 products
      if (window.innerWidth >= 768) return 3;  // Tablet: 3 products
      if (window.innerWidth >= 480) return 2;  // Mobile large: 2 products
      return 1; // Mobile: 1 product
    }
    return 4; // Default for SSR
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  const maxIndex = Math.max(0, Math.ceil(products.length / itemsPerView) - 1);

  // Update items per view on window resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (products.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [products.length, itemsPerView, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleWishlistToggle = (productId, e) => {
    e.stopPropagation();
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
        setSnackbarMessage("Removed from wishlist");
      } else {
        newWishlist.add(productId);
        setSnackbarMessage("Added to wishlist");
      }
      setSnackbarOpen(true);
      return newWishlist;
    });
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarOpen(true);
  };

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching carousel products...');
        const response = await apiService.getCarouselProducts();
        console.log('Carousel API response:', response);
        if (response.success) {
          setProducts(response.data);
          console.log('Products set:', response.data);
        } else {
          setError('Failed to fetch products');
          console.error('API returned success: false');
        }
      } catch (err) {
        setError('Error fetching products: ' + err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      {/* Section Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: "#2c3e50",
            mb: 3,
            fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
            background: "linear-gradient(45deg, #2c3e50, #3498db)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Featured Collection
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "#7f8c8d",
            maxWidth: "700px",
            mx: "auto",
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          Discover our curated selection of premium fashion pieces
        </Typography>
      </Box>

      {/* Carousel Container */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "8px",
          background: "#f8f9fa",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Buttons */}
        <Fade in={isHovered} timeout={300}>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              width: 36,
              height: 36,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                transform: "translateY(-50%) scale(1.1)",
              },
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
          >
            <ChevronLeft sx={{ fontSize: 20 }} />
          </IconButton>
        </Fade>

        <Fade in={isHovered} timeout={300}>
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              width: 36,
              height: 36,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                transform: "translateY(-50%) scale(1.1)",
              },
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
          >
            <ChevronRight sx={{ fontSize: 20 }} />
          </IconButton>
        </Fade>

        {/* Products Container */}
        <Box
          sx={{
            display: "flex",
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            gap: { xs: 2, sm: 3, md: 4 },
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                minWidth: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16}px)`,
                width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16}px)`,
                height: "400px", // Fixed height for all cards
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                },
              }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={() => handleProductClick(product)}
            >
              {/* Product Image Container */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "320px", // Fixed height for image
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <img
                  src={getProductImageUrl(product.images)}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
                
                {/* Sale Badge */}
                {product.sale_price && (
                  <Chip
                    label="SALE"
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      backgroundColor: "#e74c3c",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      height: 24,
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }}
                  />
                )}

                {/* Hover Overlay with Action Buttons */}
                <Fade in={hoveredProduct === product.id} timeout={200}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    {/* Horizontal Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Tooltip title="Add to Wishlist" placement="top">
                        <IconButton
                          onClick={(e) => handleWishlistToggle(product.id, e)}
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            width: 48,
                            height: 48,
                            "&:hover": {
                              backgroundColor: "#e74c3c",
                              color: "white",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          {wishlist.has(product.id) ? (
                            <Favorite sx={{ color: "#e74c3c", fontSize: 20 }} />
                          ) : (
                            <FavoriteBorder sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Add to Cart" placement="top">
                        <IconButton
                          onClick={(e) => handleAddToCart(product, e)}
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            width: 48,
                            height: 48,
                            "&:hover": {
                              backgroundColor: "#27ae60",
                              color: "white",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <ShoppingCart sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Quick View" placement="top">
                        <IconButton
                          onClick={() => handleQuickView(product)}
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            width: 48,
                            height: 48,
                            "&:hover": {
                              backgroundColor: "#3498db",
                              color: "white",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Visibility sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Fade>
              </Box>

              {/* Product Info */}
              <Box sx={{ p: 2, textAlign: "center", flexShrink: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#2c3e50",
                    mb: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {product.name}
                </Typography>

                {/* Price */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  {product.sale_price && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#95a5a6",
                        textDecoration: "line-through",
                        fontSize: "0.7rem",
                      }}
                    >
                      ₨{product.price}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "#2c3e50",
                      fontSize: "0.8rem",
                    }}
                  >
                    ₨{product.sale_price || product.price}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Dots Indicator */}
        {maxIndex > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              p: 2,
            }}
          >
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: currentIndex === index ? "#3498db" : "#bdc3c7",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: currentIndex === index ? "#2980b9" : "#95a5a6",
                    transform: "scale(1.2)",
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* SHOP ALL Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/shop')}
          sx={{
            borderColor: "#2c3e50",
            color: "#2c3e50",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: "4px",
            textTransform: "uppercase",
            fontSize: "0.9rem",
            letterSpacing: "1px",
            "&:hover": {
              backgroundColor: "#2c3e50",
              color: "white",
              borderColor: "#2c3e50",
            },
            transition: "all 0.3s ease",
          }}
        >
          SHOP ALL
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ 
            backgroundColor: "#27ae60", 
            color: "white",
            "& .MuiAlert-icon": {
              color: "white"
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCarousel;