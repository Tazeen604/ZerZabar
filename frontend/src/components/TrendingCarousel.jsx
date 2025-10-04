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
import { useCart } from "../contexts/CartContext";
import api from "../services/api";

const TrendingCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, products.length - 4) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev >= products.length - 4 ? 0 : prev + 1
    );
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.image_path || "",
      size: product.sizes?.[0] || "One Size",
      color: product.colors?.[0] || "Default",
      quantity: 1,
    };
    addToCart(cartItem);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography>Loading trending products...</Typography>
      </Box>
    );
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + 4);

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
          mb: 4,
          px: { xs: 2, md: 4 },
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
              ®
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

        {/* Navigation Arrows */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:disabled": {
                backgroundColor: "#f5f5f5",
                color: "#ccc",
              },
            }}
          >
            <ArrowBackIosIcon fontSize="medium" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex >= products.length - 4}
            sx={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:disabled": {
                backgroundColor: "#f5f5f5",
                color: "#ccc",
              },
            }}
          >
            <ArrowForwardIosIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>

      {/* Products Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          px: { xs: 2, md: 4 },
        }}
      >
        {visibleProducts.map((product, index) => (
          <Card
            key={product.id}
            sx={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              },
            }}
            onClick={() => handleProductClick(product.id)}
          >
            {/* Product Image */}
            <Box
              sx={{
                position: "relative",
                height: { xs: "200px", md: "250px" },
                overflow: "hidden",
              }}
            >
              <img
                src={
                  product.images?.[0]?.image_path?.startsWith("http")
                    ? product.images[0].image_path
                    : `http://localhost:8000/storage/${product.images?.[0]?.image_path || ""}`
                }
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
                  gap: 2,
                  opacity: 0,
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
    
    </Box>
  );
};

export default TrendingCarousel;
