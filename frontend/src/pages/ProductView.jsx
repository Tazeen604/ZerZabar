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
  Help,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartReservationContext";
import api from "../services/api";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Footer from "../components/Footer";
import { getProductImageUrl, getImageUrl } from "../utils/imageUtils";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import CartSelectionModal from "../components/CartSelectionModal";
import SizeChartDrawer from "../components/SizeChartDrawer";

const ProductView = () => {
  const { productId } = useParams();
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
  const [stockErrorMessage, setStockErrorMessage] = useState("");
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
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [relatedCarouselIndex, setRelatedCarouselIndex] = useState(0);
  const [relatedScreenSize, setRelatedScreenSize] = useState('desktop');
  const [imageZoom, setImageZoom] = useState(1);
  const [hoverZoom, setHoverZoom] = useState({ show: false, x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
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

  // Update price when size or color changes
  useEffect(() => {
    // This will trigger a re-render when selectedSize or selectedColor changes
    // The price display logic will automatically update
  }, [selectedSize, selectedColor, product]);

  // Fetch product - Reset state when productId changes
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    
    // Get the actual product ID from params or URL
    let actualId = productId;
    if (!actualId) {
      const pathParts = window.location.pathname.split("/");
      const productIndex = pathParts.indexOf("product");
      if (productIndex !== -1 && pathParts[productIndex + 1]) {
        actualId = pathParts[productIndex + 1];
      }
    }
    
    if (!actualId) {
      setError("Product ID is missing");
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    // Reset state when navigating to a new product (always reset when productId changes)
    setProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setSelectedImageIndex(0);
    setCurrentIndex(0);
    setError(null);
    setStockErrorMessage("");
    setSizeError("");
    setColorError("");
    setImageZoom(1); // Reset zoom
    setHoverZoom({ show: false, x: 0, y: 0 }); // Reset hover zoom
    setImagePosition({ x: 0, y: 0 }); // Reset image position
    setIsDragging(false); // Reset dragging state
    setLoading(true);
    
    const fetchProduct = async (productIdParam) => {
      try {
        let response;
        try {
          response = await api.getProduct(productIdParam);
        } catch (apiError) {
          console.error("API error:", apiError);
          try {
            const directResponse = await fetch(`/api/products/${productIdParam}`);
            if (directResponse.ok) {
              const directData = await directResponse.json();
              if (isMounted) {
                setProduct(directData.data || directData);
                setLoading(false);
                // Scroll to top when new product loads
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              return;
            } else {
              throw new Error("API fetch failed");
            }
          } catch (fetchError) {
            console.error("Fetch error:", fetchError);
            throw fetchError;
          }
        }

        if (isMounted) {
          if (response?.data) setProduct(response.data);
          else if (response?.product) setProduct(response.product);
          else if (response) setProduct(response);
          
          setLoading(false);
          // Scroll to top when new product loads
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        console.error("Product fetch error:", err);
        if (isMounted) {
          setError("Failed to load product");
          setLoading(false);
        }
      }
    };

    fetchProduct(actualId);
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Handle screen size changes for related products carousel
  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = window.innerWidth < 600 ? 'mobile' : 
                           window.innerWidth < 960 ? 'tablet' : 
                           window.innerWidth < 1200 ? 'desktop' : 'large';
      
      if (newScreenSize !== relatedScreenSize) {
        setRelatedScreenSize(newScreenSize);
        // Reset to first item when screen size changes
        setRelatedCarouselIndex(0);
      }
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [relatedScreenSize]);

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

  // Set default size when product loads
  useEffect(() => {
    if (product?.variants?.length && !selectedSize) {
      const availableSizes = getAvailableSizes();
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [product, selectedSize]);

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

  // Get button text based on selection status
  const getButtonText = () => {
    return areAllOptionsSelected() ? "Add to Cart" : "Select Options";
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

  // Handle option selection with error clearing
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSizeError("");
    
    // If color is selected, check if it's available for the new size
    if (selectedColor) {
      const availableColorsForNewSize = product?.variants
        ?.filter(variant => variant.size === size)
        ?.map(variant => variant.color)
        ?.filter(Boolean) || [];
      
      // If current color is not available for new size, clear it
      if (!availableColorsForNewSize.includes(selectedColor)) {
        setSelectedColor("");
        setColorError("");
      }
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setColorError("");
  };

  const handleAddToCart = () => {
    // Clear previous errors
    setSizeError("");
    setColorError("");
    setStockErrorMessage("");

    // Check for missing selections and set errors
    let hasErrors = false;
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();
    
    if (!selectedSize && availableSizes.length) {
      setSizeError("Please select a size");
      hasErrors = true;
    }
    if (!selectedColor && availableColors.length) {
      setColorError("Please select a color");
      hasErrors = true;
    }

    if (hasErrors) return;
    
    // Check stock availability before adding to cart
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      setStockErrorMessage("This variant is out of stock");
      setTimeout(() => setStockErrorMessage(""), 3000);
      return;
    }
    if (quantity > currentStock) {
      setStockErrorMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
      setTimeout(() => setStockErrorMessage(""), 3000);
      return;
    }
    
    // Find the selected variant to get the correct price
    const selectedVariant = product.variants?.find(variant => 
      variant.size === selectedSize && variant.color === selectedColor
    );
    
    const variantPrice = selectedVariant?.sale_price || selectedVariant?.price || 0;
    const variantOriginalPrice = selectedVariant?.sale_price ? selectedVariant?.price : null;
    
    addToCart({
      id: product.id,
      name: product.name,
      product_id: product.product_id, // Admin-entered Product ID
      price: parseFloat(variantPrice),
      originalPrice: variantOriginalPrice ? parseFloat(variantOriginalPrice) : null,
      image: product.images?.[0]?.image_path,
      size: selectedSize,
      color: selectedColor,
      quantity,
      // Include product variants for cart editing
      sizes: getAvailableSizes(),
      colors: getAvailableColors(),
      variants: product.variants || []
    });

    // Open cart drawer
    setCartDrawerOpen(true);
  };

  const handleCheckout = () => {
    // Clear previous errors
    setSizeError("");
    setColorError("");
    setStockErrorMessage("");

    // Check for missing selections and set errors
    let hasErrors = false;
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();
    
    if (!selectedSize && availableSizes.length) {
      setSizeError("Please select a size");
      hasErrors = true;
    }
    if (!selectedColor && availableColors.length) {
      setColorError("Please select a color");
      hasErrors = true;
    }

    if (hasErrors) return;
    
    // Check stock availability before adding to cart
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      setStockErrorMessage("This variant is out of stock");
      setTimeout(() => setStockErrorMessage(""), 3000);
      return;
    }
    if (quantity > currentStock) {
      setStockErrorMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
      setTimeout(() => setStockErrorMessage(""), 3000);
      return;
    }
    
    // Find the selected variant to get the correct price
    const selectedVariant = product.variants?.find(variant => 
      variant.size === selectedSize && variant.color === selectedColor
    );
    
    const variantPrice = selectedVariant?.sale_price || selectedVariant?.price || 0;
    const variantOriginalPrice = selectedVariant?.sale_price ? selectedVariant?.price : null;
    
    // Add to cart first
    addToCart({
      id: product.id,
      name: product.name,
      product_id: product.product_id, // Admin-entered Product ID
      price: parseFloat(variantPrice),
      originalPrice: variantOriginalPrice ? parseFloat(variantOriginalPrice) : null,
      image: product.images?.[0]?.image_path,
      size: selectedSize,
      color: selectedColor,
      quantity,
      // Include product variants for cart editing
      sizes: getAvailableSizes(),
      colors: getAvailableColors(),
      variants: product.variants || []
    });

    // Navigate to checkout
    navigate("/checkout");
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    setImageZoom(1); // Reset zoom when navigating images
    setImagePosition({ x: 0, y: 0 }); // Reset image position
    
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
    setImageZoom(1); // Reset zoom when changing image
    setImagePosition({ x: 0, y: 0 }); // Reset image position
  };

  const handleRelatedProductClick = (productId) => {
    // Force navigation - the useEffect will handle state reset
    navigate(`/product/${productId}`);
  };

  // Related products carousel navigation
  const handleRelatedPrevious = () => {
    const itemsPerView = relatedScreenSize === 'mobile' ? 2 : 
                        relatedScreenSize === 'tablet' ? 2 : 
                        relatedScreenSize === 'desktop' ? 3 : 4;
    setRelatedCarouselIndex((prev) => 
      prev === 0 ? Math.max(0, relatedProducts.length - itemsPerView) : prev - 1
    );
  };

  const handleRelatedNext = () => {
    const itemsPerView = relatedScreenSize === 'mobile' ? 2 : 
                        relatedScreenSize === 'tablet' ? 2 : 
                        relatedScreenSize === 'desktop' ? 3 : 4;
    setRelatedCarouselIndex((prev) => 
      prev >= relatedProducts.length - itemsPerView ? 0 : prev + 1
    );
  };

  // Get visible products for carousel
  const getVisibleRelatedProducts = () => {
    const itemsPerView = relatedScreenSize === 'mobile' ? 2 : 
                        relatedScreenSize === 'tablet' ? 2 : 
                        relatedScreenSize === 'desktop' ? 3 : 4;
    return relatedProducts.slice(relatedCarouselIndex, relatedCarouselIndex + itemsPerView);
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)" }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)", p: 4 }}>
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
    <Box sx={{ backgroundColor: "#000", pt: "75px" }}>
      <Breadcrumbs />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 120px)' }}>
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
        <Box sx={{ display: "flex", gap: { xs: 2, lg: 1.5 }, flexDirection: { xs: "column", lg: "row" } }}>
          {/* Left Side - Image Gallery */}
          <Box sx={{ flex: { xs: 1, lg: 1.4 }, display: "flex", gap: 2 }}>
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
              <Box 
                ref={imageContainerRef}
                sx={{ 
                  position: "relative", 
                  width: "100%", 
                  height: { xs: 400, md: 600 },
                  overflow: "hidden",
                  borderRadius: 2,
                  cursor: imageZoom > 1 ? (isDragging ? "grabbing" : "grab") : hoverZoom.show ? "zoom-in" : "default",
                  userSelect: "none"
                }}
                onMouseMove={(e) => {
                  if (imageZoom > 1 && isDragging) {
                    // Pan the image when zoomed
                    const deltaX = e.clientX - dragStart.x;
                    const deltaY = e.clientY - dragStart.y;
                    setImagePosition(prev => ({
                      x: prev.x + deltaX,
                      y: prev.y + deltaY
                    }));
                    setDragStart({ x: e.clientX, y: e.clientY });
                  } else if (imageZoom === 1) {
                    // Show hover zoom
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    setHoverZoom({ show: true, x, y });
                  }
                }}
                onMouseDown={(e) => {
                  if (imageZoom > 1) {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseUp={() => {
                  setIsDragging(false);
                }}
                onMouseLeave={() => {
                  setHoverZoom({ show: false, x: 0, y: 0 });
                  setIsDragging(false);
                }}
                onWheel={(e) => {
                  if (imageZoom === 1) {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    const delta = e.deltaY > 0 ? -0.15 : 0.15;
                    const newZoom = Math.max(1, Math.min(4, imageZoom + delta));
                    setImageZoom(newZoom);
                    
                    if (newZoom > 1) {
                      // Center zoom on mouse position
                      const containerWidth = rect.width;
                      const containerHeight = rect.height;
                      const offsetX = (containerWidth / 2 - (e.clientX - rect.left)) * (newZoom - 1);
                      const offsetY = (containerHeight / 2 - (e.clientY - rect.top)) * (newZoom - 1);
                      setImagePosition({ x: offsetX, y: offsetY });
                    }
                  } else {
                    // When already zoomed, allow panning with shift+scroll or just scroll
                    if (e.shiftKey) {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -0.15 : 0.15;
                      setImageZoom(prev => Math.max(1, Math.min(4, prev + delta)));
                      if (imageZoom + delta <= 1) {
                        setImagePosition({ x: 0, y: 0 });
                      }
                    }
                  }
                }}
                onDoubleClick={() => {
                  setImageZoom(1);
                  setImagePosition({ x: 0, y: 0 });
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(product?.images?.[selectedImageIndex]?.image_path)}
                  alt={product?.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 2,
                    transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                    transformOrigin: "center center",
                    transition: imageZoom === 1 && !isDragging ? "transform 0.3s ease" : "none",
                    imageRendering: "auto",
                    WebkitImageRendering: "auto",
                    willChange: imageZoom > 1 ? "transform" : "auto"
                  }}
                />
                
                {/* Hover Zoom Overlay - Larger rectangular view for better fabric detail */}
                {hoverZoom.show && imageZoom === 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: "auto", md: mousePosition.y - 150 },
                      bottom: { xs: 20, md: "auto" },
                      left: { xs: "50%", md: mousePosition.x - 200 },
                      transform: { xs: "translateX(-50%)", md: "none" },
                      width: { xs: "90%", md: 400 },
                      height: { xs: 300, md: 300 },
                      border: "3px solid #000",
                      borderRadius: 2,
                      pointerEvents: "none",
                      zIndex: 10,
                      background: `url(${getImageUrl(product?.images?.[selectedImageIndex]?.image_path)})`,
                      backgroundSize: "300%",
                      backgroundPosition: `${hoverZoom.x}% ${hoverZoom.y}%`,
                      backgroundRepeat: "no-repeat",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      display: { xs: "none", md: "block" },
                      overflow: "hidden"
                    }}
                  />
                )}
                
                {/* Zoom Indicator */}
                {imageZoom > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      zIndex: 10,
                      pointerEvents: "none"
                    }}
                  >
                    {Math.round(imageZoom * 100)}% • Drag to pan • Double-click to reset
                  </Box>
                )}
                
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
          <Box sx={{ flex: { xs: 1, lg: "0 0 350px" }, pl: { lg: 1 } }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 0, background: "#fff" }}>
              <Typography variant="h4" sx={{ fontWeight: 550, mb: 0.5, fontSize: "1rem", lineHeight: 1.3 }}>
                {product?.name}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 550, mb: 2, fontSize: "1rem", color: "#000" }}>
                ₨{(() => {
                  // If size and color are selected, find the specific variant
                  if (selectedSize && selectedColor) {
                    const selectedVariant = product?.variants?.find(variant => 
                      variant.size === selectedSize && variant.color === selectedColor
                    );
                    return selectedVariant?.sale_price || selectedVariant?.price || 0;
                  }
                  
                  // If no size/color selected, show first variant price or product price
                  if (product?.variants && product.variants.length > 0) {
                    const firstVariant = product.variants[0];
                    return firstVariant?.sale_price || firstVariant?.price || 0;
                  }
                  
                  // Fallback to product-level pricing
                  return product?.sale_price || product?.price || 0;
                })()}
              </Typography>


              {/* Size Selection */}
              {getAvailableSizes().length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>Size</Typography>
                  <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} flexWrap="wrap">
                    {getAvailableSizes().map((size, idx) => (
                      <Button
                        key={idx}
                        variant={selectedSize === size ? "contained" : "outlined"}
                        onClick={() => handleSizeChange(size)}
                        sx={{
                          minWidth: { xs: 32, sm: 36 },
                          height: { xs: 32, sm: 36 },
                          borderRadius: "18px",
                          fontSize: { xs: "0.75rem", sm: "0.8rem" },
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
              <Button
                variant="text"
                onClick={() => setSizeChartOpen(true)}
                sx={{
                  mt: 1,
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                  color: "#666",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "#000"
                  }
                }}
                startIcon={<Help sx={{ fontSize: "0.9rem" }} />}
              >
                Size Chart
              </Button>
          </Box>
        )}

              {/* Color Selection */}
              {getAvailableColors().length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>Color</Typography>
                  <Stack direction="row" spacing={{ xs: 1, sm: 1,md:2 }} flexWrap="wrap" rowGap={{ xs: 0.5, md: 1.5 }}>
              {getAvailableColors().map((color, idx) => (
                      <Button
                  key={idx} 
                        variant={selectedColor === color ? "contained" : "outlined"}
                  onClick={() => handleColorChange(color)}
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
              {colorError && (
                <Typography variant="body2" sx={{ color: "error.main", mt: 1, fontSize: "0.8rem" }}>
                  {colorError}
                </Typography>
              )}
                </Box>
              )}

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

              {/* Quantity */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Quantity</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                  >
              -
            </IconButton>
                  <Typography sx={{ mx: 2, minWidth: 40, textAlign: "center" }}>{quantity}</Typography>
                  <IconButton 
                    onClick={() => {
                      const currentStock = getCurrentStock();
                      
                      if (currentStock === 0) {
                        setStockErrorMessage("This variant is out of stock");
                        setTimeout(() => setStockErrorMessage(""), 3000);
                        return;
                      }
                      if (quantity + 1 > currentStock) {
                        setStockErrorMessage(`Only ${currentStock} items available in stock. Please select quantity accordingly.`);
                        setTimeout(() => setStockErrorMessage(""), 3000);
                        return;
                      }
                      setQuantity(quantity + 1);
                    }}
                    sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                  >
              +
            </IconButton>
                </Box>
                </Box>

              {/* Stock Error Message */}
              {stockErrorMessage && (
                <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
                  {stockErrorMessage}
                </Alert>
              )}

              {/* Add to Cart Button */}
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleAddToCart} 
            disabled={!areAllOptionsSelected()}
            sx={{
              mb: 1.5, 
              py: 1, 
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

              {/* Checkout Button */}
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={handleCheckout} 
            disabled={!areAllOptionsSelected()}
            sx={{
              mb: 1.5, 
              py: 1, 
              borderColor: areAllOptionsSelected() ? "#000" : "#666", 
              color: areAllOptionsSelected() ? "#000" : "#666",
              "&:hover": { 
                borderColor: areAllOptionsSelected() ? "#333" : "#666",
                backgroundColor: areAllOptionsSelected() ? "#f5f5f5" : "transparent"
              },
              "&:disabled": {
                borderColor: "#666",
                color: "#666"
              },
              fontSize: "0.9rem",
              fontWeight: 600,
              textTransform: "uppercase"
            }}
          >
            BUY IT NOW
          </Button>

              {/* Product Description */}
              {product?.description && (
            <Typography sx={{ 
              lineHeight: 1.5, 
                  color: "text.secondary", 
                  fontSize: "0.9rem",
                  mb: 1.5
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
               {selectedSize && selectedColor && (
                 <Typography variant="body2" sx={{ 
                   color: getCurrentStock() > 0 ? 'success.main' : 'error.main',
                   fontSize: { xs: '0.85rem', md: '0.8rem' },
                   mb: { xs: 1, sm: 0.5 },
                   fontWeight: 500
                 }}>
                   {getCurrentStock() > 0 ? `${getCurrentStock()} items available` : 'Out of stock'}
                 </Typography>
               )}
               <Typography variant="body2" sx={{ 
                 fontWeight: 600, 
                 fontSize: { xs: '0.9rem', md: '0.85rem' }
               }}>
                 ₨{(() => {
                   // If size and color are selected, find the specific variant
                   if (selectedSize && selectedColor) {
                     const selectedVariant = product?.variants?.find(variant => 
                       variant.size === selectedSize && variant.color === selectedColor
                     );
                     return selectedVariant?.sale_price || selectedVariant?.price || 0;
                   }
                   
                   // If no size/color selected, show first variant price or product price
                   if (product?.variants && product.variants.length > 0) {
                     const firstVariant = product.variants[0];
                     return firstVariant?.sale_price || firstVariant?.price || 0;
                   }
                   
                   // Fallback to product-level pricing
                   return product?.sale_price || product?.price || 0;
                 })()} × {quantity}
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
             ₨{(() => {
               let unitPrice = 0;
               
               // If size and color are selected, find the specific variant
               if (selectedSize && selectedColor) {
                 const selectedVariant = product?.variants?.find(variant => 
                   variant.size === selectedSize && variant.color === selectedColor
                 );
                 unitPrice = selectedVariant?.sale_price || selectedVariant?.price || 0;
               } else if (product?.variants && product.variants.length > 0) {
                 // If no size/color selected, show first variant price
                 const firstVariant = product.variants[0];
                 unitPrice = firstVariant?.sale_price || firstVariant?.price || 0;
               } else {
                 // Fallback to product-level pricing
                 unitPrice = product?.sale_price || product?.price || 0;
               }
               
               return (unitPrice * quantity).toLocaleString();
             })()}
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

       {/* Related Products Section - Carousel */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, mb: 6, py: 2 }}>
        {/* Header with Navigation */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, textAlign: { xs: "center", sm: "left" } }}>
            YOU MAY ALSO LIKE
          </Typography>
          
          {/* Navigation Arrows */}
          {relatedProducts.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "center", sm: "flex-end" } }}>
              <IconButton
                onClick={handleRelatedPrevious}
                disabled={relatedCarouselIndex === 0}
                sx={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  "&:disabled": {
                    backgroundColor: "#f5f5f5",
                    color: "#ccc",
                  },
                }}
              >
                <ArrowBackIosIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              </IconButton>
              <IconButton
                onClick={handleRelatedNext}
                disabled={(() => {
                  const itemsPerView = relatedScreenSize === 'mobile' ? 2 : 
                                      relatedScreenSize === 'tablet' ? 2 : 
                                      relatedScreenSize === 'desktop' ? 3 : 4;
                  return relatedCarouselIndex >= relatedProducts.length - itemsPerView;
                })()}
                sx={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  "&:disabled": {
                    backgroundColor: "#f5f5f5",
                    color: "#ccc",
                  },
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              </IconButton>
            </Box>
          )}
        </Box>
         
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
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: { xs: 1.5, sm: 2.5, md: 3 },
              px: { xs: 0, sm: 1 },
              overflow: "hidden",
            }}
          >
            {getVisibleRelatedProducts().map((relatedProduct) => {
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
                        ₨{relatedProduct?.variants?.[0]?.sale_price || relatedProduct?.variants?.[0]?.price || relatedProduct?.sale_price || relatedProduct?.price || 0}
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
                                return sum + (variant.quantity || 0);
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
                              return sum + (variant.quantity || 0);
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

      {/* Size Chart Drawer */}
      <SizeChartDrawer
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        selectedSize={selectedSize}
        productCategory={product?.category?.name}
        availableSizes={product?.sizes}
      />

       {/* Footer */}
       <Footer />
      </Box>
    </Box>
  );
};

export default ProductView;
                     