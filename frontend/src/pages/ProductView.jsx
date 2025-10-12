import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Paper,
  IconButton,
  Stack,
  Drawer,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import api from "../services/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Footer from "../components/Footer";
import { getProductImageUrl, getImageUrl } from "../utils/imageUtils";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import CartSelectionModal from "../components/CartSelectionModal";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [error, setError] = useState(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Current image index
  const [showImageIndex, setShowImageIndex] = useState(true); // Whether to show image index
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sizeError, setSizeError] = useState("");
  const [colorError, setColorError] = useState("");
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const stickyTop = 80;

  const containerRef = useRef(null); // slider container
  const innerRef = useRef(null);     // sliding images
  const rightRef = useRef(null);     // right section

  // Set total height for image sliding
  useEffect(() => {
    if (product?.images?.length) {
      // ✅ FIX: only scroll through (n - 1) full screens, plus the height of the last image
      const viewportHeight = window.innerHeight;
      const totalImages = product.images.length;
      const totalHeightValue = (totalImages - 1) * viewportHeight + viewportHeight / totalImages;
      setTotalHeight(totalHeightValue);
      setCurrentIndex(0); // Reset to first image when product changes
      
      console.log('SETUP: images:', product.images.length, '| totalHeight:', totalHeightValue, '| sliderEnd:', (product.images.length - 1) * window.innerHeight);
    }
  }, [product?.images]);

  // Scroll handler
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current || !innerRef.current || !rightRef.current || !product?.images) return;

      const scrollY = window.scrollY;
      const containerTop = containerRef.current.offsetTop;
      const scrollInContainer = Math.max(0, scrollY - containerTop);

      // Calculate threshold for responsive index changes
      const threshold = window.innerHeight * 0.3; // Change index when 30% through image
      
      // Slide images - stop when last image is fully visible
      const maxImageTranslation = (product.images.length - 1) * window.innerHeight;
      const imageTranslation = Math.min(scrollInContainer, maxImageTranslation);
      innerRef.current.style.transform = `translateY(-${imageTranslation}px)`;

      // Right section sticky / absolute - stop moving when slider ends
      const lastImageThreshold = (product.images.length - 1) * threshold; // When last image index starts
      const sliderEndThreshold = (product.images.length - 1) * window.innerHeight; // When last image is fully visible
      const maxTranslation = containerRef.current.offsetHeight - rightRef.current.offsetHeight;
      
      if (scrollInContainer < sliderEndThreshold) {
        // Keep fixed while scrolling through all images
        rightRef.current.style.position = "fixed";
        rightRef.current.style.top = `${stickyTop + 90}px`;
      } else {
        // When last image is fully visible, stop moving and let normal scroll take over
        rightRef.current.style.position = "absolute";
        rightRef.current.style.top = `${maxTranslation}px`;
      }

      // Update current image index - stop changing when slider ends
      const imageIndex = Math.floor(scrollInContainer / threshold);
      const index = Math.min(product.images.length - 1, Math.max(0, imageIndex));
      
      // Stop showing image index when slider ends
      const shouldShowIndex = scrollInContainer < sliderEndThreshold;
      setShowImageIndex(shouldShowIndex);
      
      // Calculate additional debug values
      const containerTopDoc = scrollY + containerRef.current.getBoundingClientRect().top;
      const start = containerTopDoc - stickyTop;
      const progress = Math.max(0, scrollY - start);
      const translate = Math.min(progress, imageTranslation);
      const visibleFrame = window.innerHeight;
      const rawIndex = Math.floor(translate / visibleFrame);
      
      // KEY DEBUG VALUES
      console.log('scrollTop:', scrollY, '| windowHeight:', window.innerHeight, '| totalHeightValue:', totalHeight, '| maxImageTranslation:', maxImageTranslation, '| sliderEndThreshold:', sliderEndThreshold, '| calculatedIndex:', index);
      
      setCurrentIndex(index);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [product?.images]);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async (productId) => {
      try {
        setLoading(true);
        let actualId = productId || id;
        if (!actualId) {
          const pathParts = window.location.pathname.split("/");
          const productIndex = pathParts.indexOf("product");
          if (productIndex !== -1 && pathParts[productIndex + 1]) actualId = pathParts[productIndex + 1];
        }
        if (!actualId) {
          setError("Product ID is missing");
          return;
        }

        let response;
        try {
          response = await api.getProduct(actualId);
        } catch {
          const directResponse = await fetch(`/api/products/${actualId}`);
          if (directResponse.ok) {
            const directData = await directResponse.json();
            setProduct(directData.data || directData);
            return;
          } else throw new Error("API fetch failed");
        }

        if (response?.data) setProduct(response.data);
        else if (response?.product) setProduct(response.product);
        else setProduct(response);
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct(id);
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      try {
        setRelatedLoading(true);
        const params = {
          category_id: product.category_id,
          per_page: 8,
          exclude_id: product.id
        };
        
        const response = await api.getProducts(params);
        const products = response.data?.data || response.data || [];
        setRelatedProducts(products.slice(0, 8)); // Limit to 8 products
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Check if all required options are selected
  const areAllOptionsSelected = () => {
    const hasSize = !product?.sizes?.length || selectedSize;
    const hasColor = !product?.colors?.length || selectedColor;
    return hasSize && hasColor;
  };

  // Get button text based on selection status
  const getButtonText = () => {
    return areAllOptionsSelected() ? "Add to Cart" : "Select Options";
  };

  // Handle option selection with error clearing
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSizeError("");
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setColorError("");
  };

  const handleAddToCart = () => {
    // Clear previous errors
    setSizeError("");
    setColorError("");

    // Check for missing selections and set errors
    let hasErrors = false;
    if (!selectedSize && product?.sizes?.length) {
      setSizeError("Please select a size");
      hasErrors = true;
    }
    if (!selectedColor && product?.colors?.length) {
      setColorError("Please select a color");
      hasErrors = true;
    }

    if (hasErrors) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.image_path,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Open cart drawer
    setCartDrawerOpen(true);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleRelatedAddToCart = (product) => {
    setModalProduct(product);
    setCartModalOpen(true);
  };

  const handleQuickAddToCart = (product) => {
    setSelectedProduct(product);
    setCartDrawerOpen(true);
  };

  const handleCartModalClose = () => {
    setCartModalOpen(false);
    setModalProduct(null);
  };

  const handleCartDrawerClose = () => {
    setCartDrawerOpen(false);
    setSelectedProduct(null);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", p: 4 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button 
          startIcon={<ArrowBackIosIcon />} 
          onClick={() => navigate("/shop")}
          sx={{
            color: '#000',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Back to Shop
        </Button>
      </Box>
    );

  return (
    <Box sx={{ backgroundColor: "#fff", pt: "100px" }}>
      <Breadcrumbs />
      {/* Back button */}
      <Box sx={{ px: 3, maxWidth: "1200px", mx: "auto", mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIosIcon />} 
          onClick={() => navigate("/shop")}
          sx={{
            color: '#000',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Back to Shop
        </Button>
      </Box>

      {/* Main Product Section */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, mb: 6 }}>
        <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", lg: "row" } }}>
          {/* Left Side - Image Gallery */}
          <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
            {/* Thumbnails */}
            <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 1, minWidth: 80 }}>
              {product?.images?.map((image, idx) => (
                <Box
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  sx={{
                    width: 80,
                    height: 80,
                    cursor: "pointer",
                    border: selectedImageIndex === idx ? "2px solid #000" : "1px solid #e0e0e0",
                    borderRadius: 1,
                    overflow: "hidden",
                    "&:hover": {
                      borderColor: "#666"
                    }
                  }}
                >
                  <Box
                    component="img"
                      src={getImageUrl(image.image_path)}
                    alt={`thumbnail-${idx + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                          />
                        </Box>
              ))}
                      </Box>

            {/* Main Image */}
            <Box sx={{ flex: 1, position: "relative" }}>
              <Box sx={{ position: "relative", width: "100%", height: { xs: 400, md: 600 } }}>
                <Box
                  component="img"
                  src={getImageUrl(product?.images?.[selectedImageIndex]?.image_path)}
                  alt={product?.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 2
                  }}
                />
                
                {/* Navigation Arrows */}
                {product?.images?.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => handleImageNavigation('prev')}
                      sx={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" }
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleImageNavigation('next')}
                      sx={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" }
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </>
                    )}
                  </Box>
                </Box>
          </Box>

          {/* Right Side - Product Details */}
          <Box sx={{ flex: { xs: 1, lg: "0 0 400px" }, pl: { lg: 4 } }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 0, background: "#fff" }}>
              <Typography variant="h4" sx={{ fontWeight: 550, mb: 1, fontSize: "1rem", lineHeight: 1.3 }}>
                {product?.name}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 550, mb: 3, fontSize: "1rem", color: "#000" }}>
                ₨{product?.sale_price || product?.price}
              </Typography>


              {/* Size Selection */}
              {product?.sizes?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>Size</Typography>
                  <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} flexWrap="wrap">
                    {product.sizes.map((size, idx) => (
                      <Button
                        key={idx}
                        variant={selectedSize === size ? "contained" : "outlined"}
                        onClick={() => handleSizeChange(size)}
                        sx={{
                          minWidth: { xs: 35, sm: 40 },
                          height: { xs: 35, sm: 40 },
                          borderRadius: "20px",
                          fontSize: { xs: "0.75rem", sm: "0.85rem" },
                          backgroundColor: selectedSize === size ? "#000" : "transparent",
                          color: selectedSize === size ? "#fff" : "#000",
                          borderColor: "#000",
                          marginBottom: { xs: 0.5, sm: 0 },
                          "&:hover": {
                            backgroundColor: selectedSize === size ? "#333" : "rgba(0,0,0,0.04)"
                          }
                        }}
                      >
                        {size}
                      </Button>
                ))}
              </Stack>
              {sizeError && (
                <Typography variant="body2" sx={{ color: "error.main", mt: 1, fontSize: "0.8rem" }}>
                  {sizeError}
                </Typography>
              )}
          </Box>
        )}

              {/* Color Selection */}
              {product?.colors?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>Color</Typography>
                  <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} flexWrap="wrap">
              {product.colors.map((color, idx) => (
                      <Button
                  key={idx} 
                        variant={selectedColor === color ? "contained" : "outlined"}
                  onClick={() => handleColorChange(color)}
                        sx={{
                          minWidth: { xs: 40, sm: 50 },
                          height: { xs: 30, sm: 35 },
                          borderRadius: "20px",
                          fontSize: { xs: "0.55rem", sm: "0.75rem" },
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
              {colorError && (
                <Typography variant="body2" sx={{ color: "error.main", mt: 1, fontSize: "0.8rem" }}>
                  {colorError}
                </Typography>
              )}
                </Box>
              )}

              {/* Quantity */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Quantity</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                  >
              -
            </IconButton>
                  <Typography sx={{ mx: 2, minWidth: 40, textAlign: "center" }}>{quantity}</Typography>
                  <IconButton 
                    onClick={() => setQuantity(quantity + 1)}
                    sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                  >
              +
            </IconButton>
                </Box>
                </Box>

              {/* Add to Cart Button */}
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleAddToCart} 
            disabled={!areAllOptionsSelected()}
            sx={{
              mb: 2, 
              py: 1.5, 
              backgroundColor: areAllOptionsSelected() ? "#000" : "#666", 
              "&:hover": { 
                backgroundColor: areAllOptionsSelected() ? "#333" : "#666" 
              },
              "&:disabled": {
                backgroundColor: "#666",
                color: "#fff"
              },
              fontSize: "0.9rem",
              fontWeight: 600,
              textTransform: "uppercase"
            }}
          >
            {getButtonText()}
          </Button>

              {/* Size Guide */}
              <Button 
                variant="text" 
                sx={{ 
                  mb: 2, 
                  color: "#000", 
                  textTransform: "none",
                  fontSize: "0.85rem"
                }}
              >
                SIZE GUIDE ↓
          </Button>

              {/* Product Description */}
              {product?.description && (
            <Typography sx={{ 
              lineHeight: 1.5, 
                  color: "text.secondary", 
                  fontSize: "0.9rem",
                  mb: 2
            }}>
                    {product.description}
                  </Typography>
          )}

              {/* Full Product Title */}
              <Typography sx={{ 
                fontSize: "0.85rem", 
                color: "text.secondary",
                fontStyle: "italic"
              }}>
                {product?.name}
              </Typography>
        </Paper>
                </Box>
        </Box>
      </Box>


       {/* Success Message */}
       <Snackbar 
         open={showSuccessMessage} 
         autoHideDuration={3000} 
         onClose={() => setShowSuccessMessage(false)}
         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
         sx={{ 
           top: { xs: '80px !important', md: '100px !important' },
           left: { xs: '16px !important', md: 'auto !important' },
           right: { xs: '16px !important', md: 'auto !important' },
           width: { xs: 'calc(100% - 32px) !important', md: 'auto !important' }
         }}
       >
         <Alert 
           severity="success" 
                          sx={{
             width: '100%', 
             fontSize: { xs: '0.85rem', md: '0.9rem' },
             '& .MuiAlert-message': {
               fontSize: { xs: '0.85rem', md: '0.9rem' }
             }
           }}
         >
           Product has been added to cart
         </Alert>
       </Snackbar>

       {/* Cart Drawer */}
       <Drawer
         anchor="right"
         open={cartDrawerOpen}
         onClose={() => setCartDrawerOpen(false)}
                          sx={{
           '& .MuiDrawer-paper': {
             width: { xs: '100vw', sm: '90vw', md: 400 },
             maxWidth: { xs: '100vw', md: 400 },
             p: { xs: 2, md: 3 },
             height: '100vh',
                            },
                          }}
                        >
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, md: 2 } }}>
           <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.1rem' } }}>Shopping Cart</Typography>
           <IconButton onClick={() => setCartDrawerOpen(false)} size="small" sx={{ fontSize: { xs: '1.2rem', md: '1rem' } }}>×</IconButton>
         </Box>
         <Divider sx={{ mb: 2 }} />
         
         {/* Cart Items */}
         <Box sx={{ mb: { xs: 2, md: 3 } }}>
           <Box sx={{ 
             display: 'flex', 
             alignItems: { xs: 'flex-start', md: 'center' }, 
             mb: 2, 
             p: { xs: 1.5, md: 2 }, 
             border: '1px solid #f0f0f0', 
             borderRadius: 1,
             flexDirection: { xs: 'column', sm: 'row' }
           }}>
             <Box
               component="img"
               src={getProductImageUrl(product?.images)}
               alt={product?.name}
                            sx={{
                 width: { xs: '100%', sm: 60 }, 
                 height: { xs: 120, sm: 60 }, 
                 objectFit: 'cover', 
                 borderRadius: 1, 
                 mr: { xs: 0, sm: 2 },
                 mb: { xs: 1, sm: 0 }
               }}
             />
             <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
               <Typography variant="body2" sx={{ 
                 fontWeight: 450, 
                 fontSize: { xs: '0.8rem', md: '0.75rem' }, 
                 mb: 0.5,
                 lineHeight: 1.3
               }}>
                 {product?.name}
               </Typography>
               <Typography variant="body2" sx={{ 
                 color: 'text.secondary', 
                 fontSize: { xs: '0.85rem', md: '0.8rem' },
                 mb: { xs: 1, sm: 0.5 }
               }}>
                 {selectedSize && `Size: ${selectedSize}`} {selectedColor && `• Color: ${selectedColor}`}
               </Typography>
               <Typography variant="body2" sx={{ 
                 fontWeight: 600, 
                 fontSize: { xs: '0.9rem', md: '0.85rem' }
               }}>
                 ₨{product?.sale_price || product?.price} × {quantity}
                          </Typography>
                        </Box>
                    </Box>
                  </Box>

         <Divider sx={{ mb: 2 }} />
         
         <Box sx={{ 
           display: 'flex', 
           justifyContent: 'space-between', 
           mb: { xs: 2, md: 3 },
           p: { xs: 1, md: 0 },
           backgroundColor: { xs: '#f9f9f9', md: 'transparent' },
           borderRadius: { xs: 1, md: 0 }
         }}>
           <Typography variant="body1" sx={{ 
             fontWeight: 600, 
             fontSize: { xs: '1rem', md: '0.9rem' }
           }}>
             Subtotal
           </Typography>
           <Typography variant="body1" sx={{ 
             fontWeight: 600, 
             fontSize: { xs: '1rem', md: '0.9rem' }
           }}>
             ₨{((product?.sale_price || product?.price) * quantity).toLocaleString()}
                  </Typography>
                </Box>

                  <Button
                    variant="contained"
           fullWidth 
           onClick={handleCheckout}
                    sx={{
             mb: { xs: 1.5, md: 2 }, 
             py: { xs: 1.8, md: 1.5 }, 
             backgroundColor: '#000', 
             '&:hover': { backgroundColor: '#333' },
             fontSize: { xs: '0.9rem', md: '0.85rem' },
             fontWeight: 600,
             borderRadius: { xs: 2, md: 1 }
           }}
         >
           CHECKOUT
                  </Button>
                  
                  <Button
                    variant="outlined"
           fullWidth 
           onClick={() => setCartDrawerOpen(false)}
                    sx={{
             fontSize: { xs: '0.9rem', md: '0.85rem' },
             py: { xs: 1.5, md: 1.2 },
             color: '#000',
             borderColor: '#000',
             borderRadius: { xs: 2, md: 1 },
             '&:hover': { borderColor: '#333', backgroundColor: 'rgba(0,0,0,0.04)' }
           }}
         >
           Continue Shopping
                  </Button>
       </Drawer>

       {/* Related Products Section */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, mb: 6, py: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}>
           Related Products
         </Typography>
         
        {relatedLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
             </Box>
        ) : relatedProducts.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(4, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
              px: { xs: 1, sm: 2, md: 2, lg: 3 },
              py: { xs: 1, sm: 2 },
            }}
          >
            {relatedProducts.map((relatedProduct) => {
              const discountPercentage = (() => {
                if (!relatedProduct.price || !relatedProduct.sale_price || relatedProduct.sale_price >= relatedProduct.price) return 0;
                return Math.round(((relatedProduct.price - relatedProduct.sale_price) / relatedProduct.price) * 100);
              })();
              
              return (
                <Card
                key={relatedProduct.id}
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
                  onClick={() => handleRelatedProductClick(relatedProduct.id)}
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
                      src={getProductImageUrl(relatedProduct.images)}
                      alt={relatedProduct?.name || 'Product'}
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
                          handleRelatedAddToCart(relatedProduct);
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
                          handleRelatedProductClick(relatedProduct.id);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Product Details */}
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    height: "auto",
                    minHeight: { xs: "140px", sm: "auto" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start"
                  }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {/* Category - Grey color */}
                      {relatedProduct.category && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: "#666",
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontWeight: 500
                          }}
                        >
                          {relatedProduct.category.name}
                        </Typography>
                      )}
                      
                      {/* Product Name - Black color */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: { xs: 2, sm: 2 },
                          WebkitBoxOrient: "vertical",
                          color: "#000",
                          mb: 0.5,
                          wordWrap: "break-word",
                          whiteSpace: "normal"
                        }}
                      >
                        {relatedProduct?.name || 'Unnamed Product'}
                      </Typography>
                      
                      {/* Product Price - Black color */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#000",
                          fontSize: { xs: "0.9rem", sm: "1.1rem" },
                          mb: 0.5
                        }}
                      >
                        ₨{relatedProduct?.sale_price || relatedProduct?.price || 0}
                      </Typography>
                      
                      {/* Stock Status - Red/Green color */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: (() => {
                            // Calculate total stock from variants if available, otherwise use legacy fields
                            let totalStock = 0;
                            
                            if (relatedProduct.variants && relatedProduct.variants.length > 0) {
                              // Use variant inventory
                              totalStock = relatedProduct.variants.reduce((sum, variant) => {
                                return sum + (variant.inventory?.quantity || 0);
                              }, 0);
                            } else {
                              // Fallback to legacy inventory fields
                              totalStock = relatedProduct.stock || relatedProduct.inventory?.quantity || relatedProduct.quantity || 0;
                            }
                            
                            return totalStock > 0 ? "#4CAF50" : "#f44336";
                          })(),
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          fontWeight: 600,
                          display: "block"
                        }}
                      >
                        {(() => {
                          // Calculate total stock from variants if available, otherwise use legacy fields
                          let totalStock = 0;
                          
                          if (relatedProduct.variants && relatedProduct.variants.length > 0) {
                            // Use variant inventory
                            totalStock = relatedProduct.variants.reduce((sum, variant) => {
                              return sum + (variant.inventory?.quantity || 0);
                            }, 0);
                          } else {
                            // Fallback to legacy inventory fields
                            totalStock = relatedProduct.stock || relatedProduct.inventory?.quantity || relatedProduct.quantity || 0;
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
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              No related products found
            </Typography>
             </Box>
        )}
           </Box>
           

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={handleCartDrawerClose}
        product={selectedProduct}
        onAddToCart={handleRelatedAddToCart}
      />

      {/* Cart Selection Modal */}
      <CartSelectionModal
        open={cartModalOpen}
        onClose={handleCartModalClose}
        product={modalProduct}
      />

       {/* Footer */}
       <Footer />
    </Box>
  );
};

export default ProductView;