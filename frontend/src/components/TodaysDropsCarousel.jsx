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

const TodaysDropsCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getCarouselProducts();
        if (response.success) {
          setProducts(response.data);
          setFilteredProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on price
  useEffect(() => {
    let filtered = [...(products || [])];
    
    switch (selectedPriceFilter) {
      case "under1000":
        filtered = (products || []).filter(p => (p?.sale_price || p?.price) < 1000);
        break;
      case "under2000":
        filtered = (products || []).filter(p => (p?.sale_price || p?.price) < 2000);
        break;
      case "under3000":
        filtered = (products || []).filter(p => (p?.sale_price || p?.price) < 3000);
        break;
      default:
        filtered = products || [];
    }
    
    setFilteredProducts(filtered);
    setCurrentIndex(0); // Reset to first page when filter changes
  }, [selectedPriceFilter, products]);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, (filteredProducts || []).length - 4) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev >= (filteredProducts || []).length - 4 ? 0 : prev + 1
    );
  };

  // Handle price filter change
  const handlePriceFilter = (filter) => {
    setSelectedPriceFilter(filter);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!product?.id) return;
    
    const cartItem = {
      id: product.id,
      name: product?.name || 'Unnamed Product',
      price: product?.sale_price || product?.price || 0,
      image: product?.images?.[0]?.image_path || "",
      size: product?.sizes?.[0] || "One Size",
      color: product?.colors?.[0] || "Default",
      quantity: 1,
    };
    addToCart(cartItem);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, salePrice) => {
    if (!salePrice || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography>Loading today's drops...</Typography>
      </Box>
    );
  }

  const visibleProducts = (filteredProducts || []).slice(currentIndex, currentIndex + 4);

  return (
    <Box
      sx={{
        backgroundColor: "white",
        py: 6,
        px: { xs: 2, md: 4 },
        mx: { xs: 2, md: 4 },
        my: 4,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Title */}
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#000",
              fontStyle: "italic",
              mb: 3,
            }}
          >
            Today's Drops
          </Typography>
          
          {/* Category Tab */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "1rem", md: "1.1rem" },
              color: "#000",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationThickness: "2px",
              mb: 3,
            }}
          >
            MEN
          </Typography>
        </Box>

        {/* Navigation Arrows */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{
              backgroundColor: "transparent",
              color: "#000",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:disabled": {
                color: "#ccc",
              },
            }}
          >
            <ArrowBackIosIcon fontSize="medium" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex >= (filteredProducts || []).length - 4}
            sx={{
              backgroundColor: "transparent",
              color: "#000",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:disabled": {
                color: "#ccc",
              },
            }}
          >
            <ArrowForwardIosIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>

      {/* Price Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 4,
          px: { xs: 2, md: 4 },
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "all", label: "All Products" },
          { key: "under1000", label: "Under 1000 Rs" },
          { key: "under2000", label: "Under 2000 Rs" },
          { key: "under3000", label: "Under 3000 Rs" },
        ].map((filter) => (
          <Button
            key={filter.key}
            onClick={() => handlePriceFilter(filter.key)}
            sx={{
              backgroundColor: selectedPriceFilter === filter.key ? "#f0f0f0" : "transparent",
              color: "#000",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              px: 2,
              py: 0.5,
              fontSize: "0.8rem",
              fontWeight: 400,
              textTransform: "none",
              minWidth: "auto",
              height: "32px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {filter.label}
          </Button>
        ))}
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
        {visibleProducts.map((product, index) => {
          const discountPercentage = getDiscountPercentage(product?.price, product?.sale_price);
          
          return (
            <Card
              key={product?.id || index}
              sx={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "white",
                boxShadow: "none",
                border: "1px solid #f0f0f0",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
              onClick={() => handleProductClick(product?.id)}
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
                  alt={product?.name || 'Product'}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    -{discountPercentage}%
                  </Box>
                )}

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
                      handleProductClick(product?.id);
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Product Details */}
              <CardContent sx={{ p: 2 }}>
                {/* Brand Name */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#000",
                    mb: 0.5,
                  }}
                >
                  {product.brand || "Zer Zabar"}
                </Typography>

                {/* Product Name */}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.85rem",
                    color: "#666",
                    mb: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {product?.name || 'Unnamed Product'}
                </Typography>

                {/* Store Info */}
                <Typography
                  variant="caption"
                  sx={{
                    color: "#999",
                    fontSize: "0.75rem",
                    mb: 1,
                    display: "block",
                  }}
                >
                  From: Zer Zabar Store
                </Typography>

                {/* Sizes */}
                {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#999",
                      fontSize: "0.75rem",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Sizes: {product.sizes.slice(0, 3).join(", ")}
                    {product.sizes.length > 3 && "..."}
                  </Typography>
                )}

                {/* Pricing */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#000",
                      fontSize: "1rem",
                    }}
                  >
                    ₨{product?.sale_price || product?.price || 0}
                  </Typography>
                  
                  {product?.sale_price && product?.sale_price < product?.price && (
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: "line-through",
                        color: "#999",
                        fontSize: "0.8rem",
                      }}
                    >
                      ₨{product?.price || 0}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Show message if no products match filter */}
      {(filteredProducts || []).length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found in this price range
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TodaysDropsCarousel;
