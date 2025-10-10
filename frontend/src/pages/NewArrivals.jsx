import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Pagination,
} from "@mui/material";
import { Search, FilterList, ShoppingCart, Visibility, NewReleases } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";
import Footer from "../components/Footer";
import { getProductImageUrl } from "../utils/imageUtils";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [newArrivalsDays, setNewArrivalsDays] = useState(7); // Default value

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // Handle URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    console.log('URL category parameter:', categoryFromUrl);
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);


  // Fetch settings and products
  useEffect(() => {
    fetchSettings();
    fetchData();
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage]);

  const fetchSettings = async () => {
    try {
      const settingsResponse = await apiService.get('/settings/public');
      if (settingsResponse.data && settingsResponse.data.new_arrivals_days) {
        setNewArrivalsDays(settingsResponse.data.new_arrivals_days);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default value of 7 days
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch new arrivals products (backend will use settings for date filtering)
      const productsResponse = await apiService.getNewArrivals({
        search: searchTerm,
        category_id: selectedCategory,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        per_page: 12,
        // Remove date_from parameter - let backend use settings
      });

      if (productsResponse.data) {
        setProducts(productsResponse.data.data || []);
        setTotalPages(productsResponse.data.last_page || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }

      // Fetch categories for filtering
      const categoriesResponse = await apiService.getCategories();
      console.log('Categories response:', categoriesResponse);
      
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data || []);
      } else {
        setCategories([]);
      }

      setIsInitialLoad(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load new arrivals. Please try again.');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    
    // Handle price sorting options
    if (value === 'price_low') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price_high') {
      setSortBy('price');
      setSortOrder('desc');
    } else {
      setSortBy(value);
      setSortOrder('desc'); // Default sort order for other options
    }
    
    setCurrentPage(1);
  };

  // Get the display value for sort dropdown
  const getSortDisplayValue = () => {
    if (sortBy === 'price' && sortOrder === 'asc') {
      return 'price_low';
    } else if (sortBy === 'price' && sortOrder === 'desc') {
      return 'price_high';
    }
    return sortBy;
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      setSnackbarMessage(`${product.name} added to cart!`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbarMessage('Failed to add item to cart. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product) => {
    return getProductImageUrl(product.images);
  };

  const getProductSizes = (product) => {
    if (product.sizes && Array.isArray(product.sizes)) {
      return product.sizes.slice(0, 3).join(', ');
    }
    return 'One Size';
  };

  const getProductColors = (product) => {
    if (product.colors && Array.isArray(product.colors)) {
      return product.colors.slice(0, 2).join(', ');
    }
    return '';
  };

  if (loading && isInitialLoad) {
    return (
      <Box sx={{ pt: { xs: 10, md: 16 }, minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#FFD700' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      pt: { xs: 10, md: 16 }, 
      minHeight: '100vh',
      backgroundColor: '#fff'
    }}>
      <Container 
        maxWidth="xl"
        sx={{ 
          maxWidth: '1280px !important', // Increased width for 4 cards
          mx: 'auto',
          px: { xs: 1, sm: 2, md: 2 }, // Reduced padding for 4 cards
          py: 4
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              background: 'linear-gradient(45deg, #FFD700, #FFA000)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            New Arrivals
          </Typography>
         
        </Box>
          
      {/* Filters */}
      <Box sx={{ 
        mb: 3, 
        py: { xs: 2, md: 2 }, 
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        borderRadius: { xs: 0, md: 1 },
        px: { xs: 2, md: 3 }
      }}>
        {/* Mobile Layout */}
        <Box sx={{ 
          display: { xs: 'block', md: 'none' }
        }}>
          {/* Search Bar - Full Width on Mobile */}
          <TextField
            placeholder="Search new arrivals..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.9rem',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': {
                  borderColor: '#FFD700',
                },
                '&.Mui-focused': {
                  borderColor: '#FFD700',
                  boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                }
              }
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: '#666', fontSize: '20px' }} />,
            }}
          />

          {/* Filter Row - Mobile */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  fontSize: '0.9rem',
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#FFD700',
                  }
                }}
              >Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                displayEmpty
                sx={{ 
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&:hover': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FFD700',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.9rem' }}>All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ fontSize: '0.9rem' }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  fontSize: '0.9rem',
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#FFD700',
                  }
                }}
              >Sort</InputLabel>
              <Select
                value={getSortDisplayValue()}
                onChange={handleSortChange}
                label="Sort"
                sx={{ 
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&:hover': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FFD700',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  }
                }}
              >
                <MenuItem value="created_at" sx={{ fontSize: '0.9rem' }}>Newest First</MenuItem>
                <MenuItem value="name" sx={{ fontSize: '0.9rem' }}>Name A-Z</MenuItem>
                <MenuItem value="price_low" sx={{ fontSize: '0.9rem' }}>Price: Low to High</MenuItem>
                <MenuItem value="price_high" sx={{ fontSize: '0.9rem' }}>Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Clear Button - Mobile */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="text"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSortBy("created_at");
                setCurrentPage(1);
              }}
              sx={{
                fontSize: '0.85rem',
                color: '#666',
                textTransform: 'none',
                px: 2,
                py: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                }
              }}
            >
              Clear all filters
            </Button>
          </Box>
        </Box>

        {/* Desktop Layout */}
          <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
            gap: 2, 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
            <TextField
              placeholder="Search new arrivals..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&:hover': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FFD700',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  }
                }
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#666', fontSize: '20px' }} />,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  fontSize: '0.9rem',
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#FFD700',
                  }
                }}
              >Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                displayEmpty
                sx={{ 
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&:hover': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FFD700',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.9rem' }}>All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ fontSize: '0.9rem' }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  fontSize: '0.9rem',
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#FFD700',
                  }
                }}
              >Sort</InputLabel>
              <Select
                value={getSortDisplayValue()}
                onChange={handleSortChange}
                label="Sort"
                sx={{ 
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&:hover': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FFD700',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  }
                }}
              >
                <MenuItem value="created_at" sx={{ fontSize: '0.9rem' }}>Newest First</MenuItem>
                <MenuItem value="name" sx={{ fontSize: '0.9rem' }}>Name A-Z</MenuItem>
                <MenuItem value="price_low" sx={{ fontSize: '0.9rem' }}>Price: Low to High</MenuItem>
                <MenuItem value="price_high" sx={{ fontSize: '0.9rem' }}>Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="text"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSortBy("created_at");
              setCurrentPage(1);
            }}
            sx={{
              fontSize: '0.9rem',
              color: '#666',
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            Clear all filters
          </Button>
          </Box>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <CircularProgress size={60} sx={{ color: '#FFD700' }} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <NewReleases sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No New Arrivals This Week
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria' 
                : `No new products added in the last ${newArrivalsDays} days. Check back soon for fresh arrivals!`
              }
            </Typography>
          </Box>
        ) : (
          <>
            <Grid 
              container 
              spacing={2}
              sx={{ 
                width: '100%',
                margin: 0,
                justifyContent: 'center', // Center the grid items
                '& .MuiGrid-item': {
                  paddingLeft: '8px',
                  paddingTop: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                }
              }}
            >
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={product.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  minWidth: '280px', // Minimum width for consistency
                }}>
                  <Card 
                    sx={{ 
                      height: '470px', // Increased height for better button spacing
                      width: '280px', // Fixed width for all cards
                      minWidth: '280px', // Ensure minimum width
                      maxWidth: '280px', // Prevent width expansion
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: 0, // Sharp corners like Zara/H&M
                      boxShadow: 'none',
                      border: '1px solid #f0f0f0',
                      flexShrink: 0, // Prevent shrinking
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="250"
                      image={getProductImage(product)}
                      alt={product.name}
                      sx={{ 
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewProduct(product.id)}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': { color: '#FFD700' }
                        }}
                        onClick={() => handleViewProduct(product.id)}
                      >
                        {product.name}
                      </Typography>
                      
                     

                      {/* Product Details */}
                      <Box sx={{ mb: 2 }}>
                  
                        {getProductColors(product) && (
                          <Chip 
                            label={`Colors: ${getProductColors(product)}`} 
                            size="small" 
                            sx={{ mr: 1, mb: 1, fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>

                      {/* Price */}
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#FFD700',
                            display: 'inline'
                          }}
                        >
                          ₨{Math.round(product.sale_price || product.price)}
                        </Typography>
                        {product.sale_price && product.sale_price < product.price && (
                          <>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                textDecoration: 'line-through', 
                                color: 'text.secondary',
                                ml: 1,
                                display: 'inline'
                              }}
                            >
                              ₨{Math.round(product.price)}
                            </Typography>
                            <Chip 
                              label="Sale" 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                backgroundColor: '#ff4444', 
                                color: 'white',
                                fontSize: '0.7rem'
                              }} 
                            />
                          </>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          sx={{
                            flex: 1,
                            backgroundColor: '#FFD700',
                            color: '#2C2C2C',
                            fontWeight: 'bold',
                            height: '36px',
                            fontSize: '0.85rem',
                            textTransform: 'none',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: '#F57F17',
                            },
                          }}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewProduct(product.id)}
                          sx={{
                            minWidth: '36px',
                            width: '36px',
                            height: '36px',
                            padding: 0,
                            borderColor: '#FFD700',
                            color: '#FFD700',
                            borderRadius: '4px',
                            '&:hover': {
                              borderColor: '#F57F17',
                              backgroundColor: '#fff8e1',
                            },
                          }}
                        >
                          <Visibility sx={{ fontSize: '18px' }} />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#666',
                      '&.Mui-selected': {
                        backgroundColor: '#FFD700',
                        color: '#2C2C2C',
                        '&:hover': {
                          backgroundColor: '#F57F17',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#fff8e1',
                        color: '#FFD700',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Success Snackbar */}
        {snackbarOpen && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 9999,
            }}
          >
            <Alert 
              severity="success" 
              onClose={handleSnackbarClose}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white',
                },
              }}
            >
              {snackbarMessage}
            </Alert>
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default NewArrivals;
