import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight, Visibility, ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const intervalRef = useRef(null);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, products.length - 1);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCarouselProducts();
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isHovered && products.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= maxIndex ? 0 : prevIndex + 1
        );
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, maxIndex, products.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.sale_price || product.price || 0),
      originalPrice: product.sale_price ? parseFloat(product.price || 0) : null,
      image: product.images?.[0]?.image_path,
      size: 'M', // Default size for carousel
      color: '', // Default color for carousel
      quantity: 1,
    };
    
    addToCart(cartItem);
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <Typography>No products available</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
        background: "#ffffff",
        position: "relative",
      }}
    >
      {/* Section Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#333",
            mb: 2,
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          Featured Products
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#666",
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Discover our latest collection of premium gents fashion
        </Typography>
      </Box>

      {/* Carousel Container */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "12px",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Buttons */}
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* Products Container */}
        <Box
          sx={{
            display: "flex",
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            transition: "transform 0.5s ease-in-out",
            gap: 3,
          }}
        >
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                minWidth: `calc(${100 / itemsPerView}% - 16px)`,
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                },
              }}
            >
              {/* Product Image */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "300px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={product.images?.[0]?.image_path ? `http://localhost:8000/storage/${product.images[0].image_path}` : "https://via.placeholder.com/300x300?text=No+Image"}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                />
                
                {/* Sale Badge */}
                {product.sale_price && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      backgroundColor: "#ff4444",
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    SALE
                  </Box>
                )}

                {/* Quick View Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleQuickView(product)}
                    sx={{
                      backgroundColor: "#FFD700",
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "#F57F17",
                      },
                    }}
                  >
                    Quick View
                  </Button>
                </Box>
              </Box>

              {/* Product Info */}
              <Box sx={{ p: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mb: 1,
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                  }}
                >
                  {product.category?.name || "FASHION"}
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#333",
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  {product.name}
                </Typography>

                {/* Price */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    ₨{product.sale_price || product.price}
                  </Typography>
                  {product.sale_price && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#999",
                        textDecoration: "line-through",
                      }}
                    >
                      ₨{product.price}
                    </Typography>
                  )}
                </Box>

                {/* Add to Cart Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={(e) => handleAddToCart(product, e)}
                  sx={{
                    backgroundColor: "#FFD700",
                    color: "#333",
                    fontWeight: "bold",
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "#F57F17",
                    },
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Dots Indicator */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mt: 4,
        }}
      >
        {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: currentIndex === index ? "#FFD700" : "#ddd",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCarousel;