import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Inventory,
  Star,
  StarBorder,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { getProductImageUrl } from '../../src/utils/imageUtils';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        console.log('Products response:', response);
        // Handle paginated response - the actual products are in response.data.data
        const productsData = response.data?.data || response.data || [];
        console.log('Products data:', productsData);
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          console.error('Products data is not an array:', productsData);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        setError(err.message || 'Failed to fetch products');
        setProducts([]); // Ensure products is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleAction = (action) => {
    console.log(`${action} product:`, selectedProduct);
    if (action === 'View' && selectedProduct) {
      // Navigate to product detail page or open quick view modal
      window.open(`/product/${selectedProduct.id}`, '_blank');
    }
    handleMenuClose();
  };

  const handleQuickView = (product) => {
    // Open product in new tab for quick view
    window.open(`/product/${product.id}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return '#4CAF50';
      case 'Low Stock':
        return '#FF9800';
      case 'Out of Stock':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            Products
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Manage your product inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': {
              backgroundColor: '#F57F17',
              transform: 'translateY(-2px)',
            },
            px: 3,
            py: 1.5,
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#F5F5F5',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: '1px solid #FFD700',
              },
              '&.Mui-focused fieldset': {
                border: '2px solid #FFD700',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#757575' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {(Array.isArray(filteredProducts) ? filteredProducts : []).map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {/* Product Image */}
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={getProductImageUrl(product.images)}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </Box>
                {product.is_featured && (
                  <Chip
                    label="Featured"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: '#FFD700',
                      color: '#2C2C2C',
                      fontWeight: 'bold',
                    }}
                  />
                )}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'white',
                    },
                  }}
                >
                  {product.is_featured ? <Star sx={{ color: '#FFD700' }} /> : <StarBorder />}
                </IconButton>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {/* Product Info */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#212121' }}>
                  {product.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                    ₨{product.sale_price || product.price}
                  </Typography>
                  {product.sale_price && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#757575',
                        textDecoration: 'line-through',
                      }}
                    >
                      ₨{product.price}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        sx={{
                          color: index < Math.floor(4.5) ? '#FFD700' : '#E0E0E0',
                          fontSize: 16,
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    (4.5)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock') + '20',
                      color: getStatusColor(product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'),
                      fontWeight: 'bold',
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    SKU: {product.sku}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Stock: {product.stock_quantity}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    {product.category?.name || 'Uncategorized'}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickView(product);
                  }}
                  sx={{
                    color: '#2196F3',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    },
                  }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  sx={{
                    color: '#FF9800',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    },
                  }}
                >
                  Edit
                </Button>
                <IconButton
                  onClick={(e) => handleMenuOpen(e, product)}
                  sx={{
                    color: '#757575',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <MoreVert />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}

      {/* No Products Message */}
      {!loading && !error && filteredProducts.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No products found matching your search' : 'No products available'}
          </Typography>
          {searchTerm && (
            <Button 
              variant="outlined" 
              onClick={() => setSearchTerm('')}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem
          onClick={() => handleAction('View')}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Visibility sx={{ color: '#2196F3' }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleAction('Edit')}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Edit sx={{ color: '#FF9800' }} />
          </ListItemIcon>
          <ListItemText>Edit Product</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleAction('Delete')}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: '#F44336',
            },
          }}
        >
          <ListItemIcon>
            <Delete sx={{ color: '#F44336' }} />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Products;
