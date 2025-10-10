import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import api from "../services/api";
import { getProductImageUrl } from "../utils/imageUtils";

const TodaysDropsCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(40); // Start with 40 products
  const [loadingMore, setLoadingMore] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products at once to enable client-side pagination
        const response = await api.get('/products?per_page=1000'); // Get all products
        if (response.success) {
          // Handle paginated response - data.data contains the actual products array
          const productsData = response.data.data || response.data;
          console.log('Fetched products:', productsData.length, 'products');
          setProducts(productsData);
          setFilteredProducts(productsData);
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
    setVisibleCount(40); // Reset to initial 40 when filter changes
  }, [selectedPriceFilter, products]);

  // Handle price filter change
  const handlePriceFilter = (filter) => {
    setSelectedPriceFilter(filter);
  };

  // Handle "See More" button click
  const handleSeeMore = async () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setVisibleCount(prev => {
      const newCount = prev + 20;
      console.log('Loading more products. Previous:', prev, 'New:', newCount);
      return newCount;
    });
    setLoadingMore(false);
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

  // Handle mobile touch events
  const handleTouchStart = (productId) => {
    setHoveredProduct(productId);
  };

  const handleTouchEnd = () => {
    // Delay to allow button clicks
    setTimeout(() => setHoveredProduct(null), 150);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, salePrice) => {
    if (!salePrice || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={60} sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  const visibleProducts = (filteredProducts || []).slice(0, visibleCount);
  const hasMoreProducts = visibleCount < (filteredProducts || []).length;
  
  console.log('Current state:', {
    totalProducts: (filteredProducts || []).length,
    visibleCount,
    visibleProducts: visibleProducts.length,
    hasMoreProducts
  });

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa",
        py: 6,
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
          alignItems: "flex-start",
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 4 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
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
          
          
        </Box>

        {/* Product Count */}
        <Box sx={{ alignSelf: { xs: "center", sm: "flex-end" } }}>
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              fontWeight: 500,
            }}
          >
            Showing {visibleProducts.length} of {(filteredProducts || []).length} products
          </Typography>
        </Box>
      </Box>

      {/* Price Filters */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 0.5, sm: 1.5 },
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 4 },
          flexWrap: "nowrap",
          overflowX: { xs: "auto", sm: "visible" },
          justifyContent: { xs: "flex-start", sm: "flex-start" },
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
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
              px: { xs: 1, sm: 2 },
              py: 0.5,
              fontSize: { xs: "0.65rem", sm: "0.8rem" },
              fontWeight: 400,
              textTransform: "none",
              minWidth: { xs: "fit-content", sm: "auto" },
              whiteSpace: "nowrap",
              flexShrink: 0,
              height: { xs: "28px", sm: "32px" },
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
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: { xs: 1.5, sm: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 4 },
        }}
      >
        {visibleProducts.map((product, index) => {
          const discountPercentage = getDiscountPercentage(product?.price, product?.sale_price);
          
          return (
            <Card
              key={product?.id || index}
              sx={{
                position: "relative",
                borderRadius: { xs: "6px", sm: "8px" },
                overflow: "hidden",
                backgroundColor: "white",
                boxShadow: "none",
                border: "1px solid #f0f0f0",
                transition: "all 0.3s ease",
                cursor: "pointer",
                width: "100%",
                "&:hover": {
                  transform: { xs: "none", sm: "translateY(-2px)" },
                  boxShadow: { xs: "none", sm: "0 4px 12px rgba(0,0,0,0.1)" },
                },
              }}
              onClick={() => handleProductClick(product?.id)}
              onTouchStart={() => handleTouchStart(product?.id)}
              onTouchEnd={handleTouchEnd}
            >
              {/* Product Image */}
              <Box
                sx={{
                  position: "relative",
                  height: { xs: "180px", sm: "200px", md: "250px" },
                  overflow: "hidden",
                }}
              >
                <img
                  src={getProductImageUrl(product.images)}
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
                    gap: { xs: 0.5, sm: 2 },
                    opacity: hoveredProduct === product?.id ? 1 : 0, // Show on mobile touch
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
                      handleProductClick(product?.id);
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Product Details */}
              <CardContent sx={{ p: 2 }}>


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
                
                {/* Pricing */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: "#000" }}>
                    ₨{Math.round(product?.sale_price || product?.price || 0)}
                  </Typography>
                  {product?.sale_price && product?.sale_price < product?.price && (
                    <Typography sx={{ textDecoration: "line-through", color: "#888", fontSize: "0.85rem" }}>
                      ₨{Math.round(product?.price || 0)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* See More Button */}
      {hasMoreProducts && (
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          mt: { xs: 4, md: 6 },
          px: { xs: 1, sm: 2, md: 4 }
        }}>
          <Button
            onClick={handleSeeMore}
            disabled={loadingMore}
            variant="contained"
            sx={{
              backgroundColor: "#FFD700",
              color: "#2C2C2C",
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              px: { xs: 4, sm: 6 },
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: { xs: "12px", sm: "8px" },
              textTransform: "none",
              minWidth: { xs: "160px", sm: "200px" },
              height: { xs: "44px", sm: "48px" },
              boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
              "&:hover": {
                backgroundColor: "#FFC107",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(255, 215, 0, 0.4)",
              },
              "&:disabled": {
                backgroundColor: "#f5f5f5",
                color: "#999",
                transform: "none",
                boxShadow: "none",
              },
              transition: "all 0.3s ease",
            }}
          >
            {loadingMore ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} sx={{ color: "#2C2C2C" }} />
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Loading...
                </Typography>
              </Box>
            ) : (
              `See More ${(filteredProducts || []).length - visibleCount}/${(filteredProducts || []).length} products`
            )}
          </Button>
        </Box>
      )}

      {/* No More Products Message */}
      {!hasMoreProducts && (filteredProducts || []).length > 0 && (
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          mt: { xs: 4, md: 6 },
          px: { xs: 1, sm: 2, md: 4 }
        }}>
          <Box sx={{
            backgroundColor: "#f8f9fa",
            borderRadius: { xs: "12px", sm: "8px" },
            px: { xs: 3, sm: 4 },
            py: { xs: 2, sm: 2.5 },
            textAlign: "center",
            border: "1px solid #e9ecef",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            <Typography 
              variant="h6" 
              sx={{
                color: "#6c757d",
                fontWeight: 500,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                mb: 0.5,
              }}
            >
              No more products to view
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: "#adb5bd",
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
              }}
            >
              You've seen all {visibleProducts.length} products
            </Typography>
          </Box>
        </Box>
      )}

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
