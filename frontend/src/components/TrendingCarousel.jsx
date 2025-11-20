import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import {
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartReservationContext";
import api from "../services/api";
import { getProductImageUrl } from "../utils/imageUtils";
import CartSelectionModal from "./CartSelectionModal";

const TrendingCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenSize, setScreenSize] = useState('desktop');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = window.innerWidth < 600 ? 'mobile' : 
                           window.innerWidth < 960 ? 'tablet' : 
                           window.innerWidth < 1200 ? 'desktop' : 'large';
      
      if (newScreenSize !== screenSize) {
        setScreenSize(newScreenSize);
        // Reset to first item when screen size changes to avoid index issues
        setCurrentIndex(0);
      }
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [screenSize]);

  // Fetch trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getCarouselProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  // Navigation handlers
  const handlePrevious = () => {
    const itemsPerView = screenSize === 'mobile' ? 1 : 
                        screenSize === 'tablet' ? 2 : 
                        screenSize === 'desktop' ? 3 : 4;
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, products.length - itemsPerView) : prev - 1
    );
  };

  const handleNext = () => {
    const itemsPerView = screenSize === 'mobile' ? 1 : 
                        screenSize === 'tablet' ? 2 : 
                        screenSize === 'desktop' ? 3 : 4;
    setCurrentIndex((prev) => 
      prev >= products.length - itemsPerView ? 0 : prev + 1
    );
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle mobile touch events
  const handleTouchStart = (productId) => {
    setHoveredProduct(productId);
  };

  const handleTouchEnd = () => {
    // Delay to allow button clicks
    setTimeout(() => setHoveredProduct(null), 150);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography>Loading trending products...</Typography>
      </Box>
    );
  }

  // Show different number of products based on screen size
  const getVisibleProducts = () => {
    const itemsPerView = screenSize === 'mobile' ? 1 : 
                        screenSize === 'tablet' ? 2 : 
                        screenSize === 'desktop' ? 3 : 4;
    return products.slice(currentIndex, currentIndex + itemsPerView);
  };

  const visibleProducts = getVisibleProducts();

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa",
        py: 8,
        px: { xs: 2, md: 4 },
        borderRadius: "20px",
        mx: { xs: 2, md: 4 },
        my: 4,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 4 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        {/* Title */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", md: "2rem" },
              color: "#000",
              mb: 1,
            }}
          >
            Trending Now
            <Typography
              component="span"
              sx={{
                fontSize: "0.7em",
                verticalAlign: "top",
                ml: 0.5,
                color: "#666",
              }}
            >
            </Typography>
          </Typography>
          
          {/* Category Tab */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "0.9rem", md: "1.1rem" },
              color: "#000",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationThickness: "2px",
            }}
          >
            MEN'S FAVOURITES
          </Typography>
        </Box>

        {/* Navigation Arrows - Hidden on mobile */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, alignSelf: "flex-end" }}>
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:disabled": {
                backgroundColor: "#f5f5f5",
                color: "#ccc",
              },
            }}
          >
            <ArrowBackIosIcon sx={{ fontSize: "1.25rem" }} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex >= products.length - (screenSize === 'mobile' ? 1 : screenSize === 'tablet' ? 2 : screenSize === 'desktop' ? 3 : 4)}
            sx={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:disabled": {
                backgroundColor: "#f5f5f5",
                color: "#ccc",
              },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: "1.25rem" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Products Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2, md: 4 },
        }}
      >
        {visibleProducts.map((product, index) => (
          <Card
            key={product.id}
            sx={{
              position: "relative",
              borderRadius: { xs: "8px", sm: "12px" },
              overflow: "hidden",
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              width: "100%",
              "&:hover": {
                transform: { xs: "none", sm: "translateY(-4px)" },
                boxShadow: { xs: "0 2px 8px rgba(0,0,0,0.1)", sm: "0 8px 25px rgba(0,0,0,0.15)" },
              },
            }}
            onClick={() => handleProductClick(product.id)}
            onTouchStart={() => handleTouchStart(product.id)}
            onTouchEnd={handleTouchEnd}
          >
            {/* Product Image */}
            <Box
              sx={{
                position: "relative",
                height: { xs: "260px", sm: "200px", md: "250px" },
                overflow: "hidden",
             
              }}
            >
              <img
                src={getProductImageUrl(product.images)}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />

              {/* Hover Overlay with Action Buttons */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 0.5, sm: 2 },
                  opacity: hoveredProduct === product.id ? 1 : 0, // Show on mobile touch
                  transition: "opacity 0.3s ease",
                  "&:hover": {
                    opacity: 1,
                  },
                }}
              >
                <IconButton
                  sx={{
                    backgroundColor: "white",
                    color: "#000",
                    width: { xs: "28px", sm: "40px" },
                    height: { xs: "28px", sm: "40px" },
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to wishlist logic
                  }}
                >
                  <FavoriteIcon fontSize="small" />
                </IconButton>
                <IconButton
                  sx={{
                    backgroundColor: "white",
                    color: "#000",
                    width: { xs: "28px", sm: "40px" },
                    height: { xs: "28px", sm: "40px" },
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <ShoppingCartIcon fontSize="small" />
                </IconButton>
                <IconButton
                  sx={{
                    backgroundColor: "white",
                    color: "#000",
                    width: { xs: "28px", sm: "40px" },
                    height: { xs: "28px", sm: "40px" },
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product.id);
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Product Details - Removed to show only images */}
          </Card>
        ))}
      </Box>

      {/* Mobile Navigation Buttons - Bottom */}
      <Box sx={{ 
        display: { xs: "flex", sm: "none" }, 
        justifyContent: "center", 
        gap: 2, 
        mt: 3,
        px: { xs: 1, sm: 2, md: 4 }
      }}>
        <IconButton
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          sx={{
            backgroundColor: "#FFD700",
            border: "1px solid #e0e0e0",
            color: "#333",
            width: 56,
            height: 56,
            "&:hover": {
              backgroundColor: "#E6C200",
              transform: "scale(1.1)",
            },
            "&:disabled": {
              backgroundColor: "#f5f5f5",
              color: "#ccc",
              transform: "none",
            },
          }}
        >
          <ArrowBackIosIcon sx={{ fontSize: "1.5rem" }} />
        </IconButton>
        <IconButton
          onClick={handleNext}
          disabled={currentIndex >= products.length - 1}
          sx={{
            backgroundColor: "#FFD700",
            border: "1px solid #e0e0e0",
            color: "#333",
            width: 56,
            height: 56,
            "&:hover": {
              backgroundColor: "#E6C200",
              transform: "scale(1.1)",
            },
            "&:disabled": {
              backgroundColor: "#f5f5f5",
              color: "#ccc",
              transform: "none",
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: "1.5rem" }} />
        </IconButton>
      </Box>

      {/* Cart Selection Modal */}
      <CartSelectionModal
        open={modalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
      />
    </Box>
  );
};

export default TrendingCarousel;
