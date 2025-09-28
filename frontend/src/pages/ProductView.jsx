import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Chip,
  Divider,
  Rating,
  TextField,
  Badge,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Favorite,
  Share,
  ShoppingCart,
  ArrowBack,
  Add,
  Remove,
  LocalShipping,
  Security,
  Support,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { useCart } from "../contexts/CartContext";

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Reset selectedImage when product changes
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(0);
    }
  }, [product]);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProduct(productId);
        console.log('Product response:', response);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleImageZoom = (event) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.sale_price || product.price || 0),
      originalPrice: product.sale_price ? parseFloat(product.price || 0) : null,
      image: product.images?.[0]?.image_path,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    };
    
    addToCart(cartItem);
    console.log('Added to cart:', cartItem);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Add a small delay to ensure cart is updated before navigation
    setTimeout(() => {
      navigate('/checkout');
    }, 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Product not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ p: 2, backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: '#666' }}
        >
          Back to Products
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={4} sx={{ maxWidth: '1400px', mx: 'auto' }}>
          {/* Left Half - Image Gallery */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Main Image */}
                <Box
                  ref={imageRef}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '500px',
                    overflow: 'hidden',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    backgroundColor: '#f5f5f5',
                  }}
                  onMouseMove={handleImageZoom}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`http://localhost:8000/storage/${product.images[selectedImage].image_path}`}
                      alt={`${product.name} - View ${selectedImage + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                        transformOrigin: isZoomed ? `${mousePosition.x}px ${mousePosition.y}px` : 'center',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#999',
                      }}
                    >
                      <Typography variant="h6">No Image Available</Typography>
                    </Box>
                  )}

                  {/* Zoom Controls */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                      sx={{
                        background: 'rgba(255,255,255,0.9)',
                        '&:hover': { background: 'white' },
                      }}
                    >
                      <ZoomIn />
                    </IconButton>
                    <IconButton
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                      sx={{
                        background: 'rgba(255,255,255,0.9)',
                        '&:hover': { background: 'white' },
                      }}
                    >
                      <ZoomOut />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setIsZoomed(!isZoomed);
                        setZoomLevel(isZoomed ? 1 : 2);
                      }}
                      sx={{
                        background: 'rgba(255,255,255,0.9)',
                        '&:hover': { background: 'white' },
                      }}
                    >
                      <Fullscreen />
                    </IconButton>
                  </Box>

                  {/* Sale Badge */}
                  {product.sale_price && (
                    <Chip
                      label="SALE"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        background: '#ff4444',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Box>

                {/* Thumbnail Gallery */}
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Different Angles:
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      overflowX: 'auto',
                      pb: 1,
                    }}
                  >
                    {product.images && product.images.length > 0 ? (
                      product.images.map((image, index) => (
                        <Box
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          sx={{
                            minWidth: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: selectedImage === index ? '3px solid #FFD700' : '3px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <img
                            src={`http://localhost:8000/storage/${image.image_path}`}
                            alt={`${product.name} angle ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          No images available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Half - Product Details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                {/* Product Title & Category */}
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={product.category?.name || 'FASHION'}
                    size="small"
                    sx={{ mb: 2, backgroundColor: '#f0f0f0', color: '#666' }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                    {product.name}
                  </Typography>
                  
                  {/* SKU */}
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    SKU: {product.sku}
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                      ₨{product.sale_price || product.price}
                    </Typography>
                    {product.sale_price && (
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#999',
                          textDecoration: 'line-through',
                        }}
                      >
                        ₨{product.price}
                      </Typography>
                    )}
                  </Box>
                  {product.sale_price && (
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      Save ₨{(product.price - product.sale_price).toFixed(2)}!
                    </Typography>
                  )}
                </Box>

                {/* Description */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Description:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666',
                      lineHeight: 1.6,
                    }}
                  >
                    {product.description}
                  </Typography>
                </Box>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Size:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'contained' : 'outlined'}
                          onClick={() => setSelectedSize(size)}
                          sx={{
                            minWidth: '50px',
                            borderColor: selectedSize === size ? '#FFD700' : '#ddd',
                            color: selectedSize === size ? 'white' : '#333',
                            background: selectedSize === size ? '#FFD700' : 'transparent',
                            '&:hover': {
                              borderColor: '#FFD700',
                              background: selectedSize === size ? '#FFD700' : 'rgba(255,215,0,0.1)',
                            },
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Color:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {product.colors.map((color, index) => (
                        <Box
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: color.toLowerCase(),
                            cursor: 'pointer',
                            border: selectedColor === color ? '3px solid #333' : '3px solid transparent',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: selectedColor === color ? 'white' : 'black',
                              fontWeight: 'bold',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            }}
                          >
                            {color}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Quantity */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Quantity:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      variant="outlined"
                      sx={{ minWidth: '40px' }}
                    >
                      <Remove />
                    </Button>
                    <TextField
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      sx={{ width: '80px' }}
                      inputProps={{ style: { textAlign: 'center' } }}
                    />
                    <Button
                      onClick={() => setQuantity(quantity + 1)}
                      variant="outlined"
                      sx={{ minWidth: '40px' }}
                    >
                      <Add />
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={!selectedSize && product.sizes && product.sizes.length > 0}
                    sx={{
                      background: '#FFD700',
                      '&:hover': { background: '#E6C200' },
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleBuyNow}
                    disabled={!selectedSize && product.sizes && product.sizes.length > 0}
                    sx={{
                      borderColor: '#FFD700',
                      color: '#FFD700',
                      '&:hover': {
                        borderColor: '#E6C200',
                        background: 'rgba(255,215,0,0.1)',
                      },
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Buy Now
                  </Button>
                </Stack>

                {/* Product Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Product Information:
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Stock:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {product.stock_quantity} available
                      </Typography>
                    </Box>
                    {product.weight && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Weight:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {product.weight} kg
                        </Typography>
                      </Box>
                    )}
                    {product.dimensions && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Dimensions:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {product.dimensions}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Features */}
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Features:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(product.attributes).map(([key, value], index) => (
                        <Chip
                          key={index}
                          label={`${key}: ${value}`}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Trust Badges */}
                <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">Free Shipping</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">Secure Payment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Support sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">24/7 Support</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductView;