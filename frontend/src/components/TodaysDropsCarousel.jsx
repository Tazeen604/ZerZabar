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
import { useCart } from "../contexts/CartReservationContext";
import api from "../services/api";
import { getProductImageUrl } from "../utils/imageUtils";
import CartSelectionModal from "./CartSelectionModal";

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
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
        filtered = (products || []).filter(p => (p?.variants?.[0]?.sale_price || p?.variants?.[0]?.price || p?.sale_price || p?.price || 0) < 1000);
        break;
      case "under2000":
        filtered = (products || []).filter(p => (p?.variants?.[0]?.sale_price || p?.variants?.[0]?.price || p?.sale_price || p?.price || 0) < 2000);
        break;
      case "under3000":
        filtered = (products || []).filter(p => (p?.variants?.[0]?.sale_price || p?.variants?.[0]?.price || p?.sale_price || p?.price || 0) < 3000);
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
      product_id: product.product_id, // Admin-entered Product ID
      price: product?.variants?.[0]?.sale_price || product?.variants?.[0]?.price || product?.sale_price || product?.price || 0,
      image: product?.images?.[0]?.image_path || "",
      size: product?.sizes?.[0] || "One Size",
      color: product?.colors?.[0] || "Default",
      quantity: 1,
      // Include product variants for cart editing
      sizes: product?.sizes || [],
      colors: product?.colors || [],
      variants: product?.variants || []
    };
    addToCart(cartItem);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setCartModalOpen(true);
  };

  const handleCartModalClose = () => {
    setCartModalOpen(false);
    setSelectedProduct(null);
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
        py: { xs: 4, sm: 5, md: 6 },
        px: { xs: 0.5, sm: 1, md: 1.5, lg: 2, xl: 3 },
        borderRadius: "20px",
        mx: { xs: 0.5, sm: 1, md: 1.5, lg: 2, xl: 3 },
        my: { xs: 3, sm: 4, md: 4 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: { xs: 3, sm: 3, md: 4 },
          px: { xs: 0.25, sm: 0.5, md: 0.75, lg: 1, xl: 1.5 },
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
              fontSize: { xs: "0.6rem", sm: "0.7rem" },
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
          mb: { xs: 3, sm: 3, md: 4 },
          px: { xs: 0.25, sm: 0.5, md: 0.75, lg: 1, xl: 1.5 },
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
              fontSize: { xs: "0.45rem", sm: "0.6rem" },
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
            xl: "repeat(4, 1fr)",
          },
          gap: { xs: 0.5, sm: 0.75, md: 1, lg: 1.5, xl: 2 },
          px: { xs: 0.25, sm: 0.5, md: 0.75, lg: 1, xl: 1.5 },
          py: { xs: 1, sm: 2 },
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
                      handleAddToCartClick(product);
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
               <CardContent sx={{ 
                 p: { xs: 1, sm: 2 },
                 height: "auto",
                 minHeight: { xs: "auto", sm: "auto" },
                 display: "flex",
                 flexDirection: "column",
                 justifyContent: "flex-start"
               }}>
                 <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.25, sm: 0.5 } }}>
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
                       WebkitLineClamp: { xs: 2, sm: 2 },
                       WebkitBoxOrient: "vertical",
                       color: "#000",
                       mb: { xs: 0.25, sm: 0.5 },
                       wordWrap: "break-word",
                       whiteSpace: "normal"
                  }}
                >
                  {product?.name || 'Unnamed Product'}
                </Typography>
                
                   {/* Product Price - Black color */}
                  <Typography
                    variant="h6"
                    sx={{
                       fontWeight: 600,
                      color: "#000",
                       fontSize: { xs: "0.7rem", sm: "0.9rem" },
                       mb: { xs: 0.25, sm: 0.5 }
                    }}
                  >
                    ₨{product?.variants?.[0]?.sale_price || product?.variants?.[0]?.price || 'Price not available'}
                  </Typography>
                  
                   {/* Stock Status - Red/Green color */}
                    <Typography
                      variant="body2"
                      sx={{
                       color: (() => {
                         // Calculate total stock from variants if available, otherwise use legacy fields
                         let totalStock = 0;
                         
                         if (product.variants && product.variants.length > 0) {
                           // Use variant inventory
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
                         // Use variant inventory
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
          mt: { xs: 4, sm: 5, md: 6 },
          px: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }
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
          mt: { xs: 4, sm: 5, md: 6 },
          px: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }
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

      {/* Cart Selection Modal */}
      <CartSelectionModal
        open={cartModalOpen}
        onClose={handleCartModalClose}
        product={selectedProduct}
      />
    </Box>
  );
};

export default TodaysDropsCarousel;
