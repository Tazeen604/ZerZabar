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

  // Fetch products and categories
  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date 6 days ago (to include today, making it 7 days total)
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
      const dateFilter = sixDaysAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      // Fetch new arrivals products (only from last 7 days)
      const productsResponse = await apiService.getNewArrivals({
        search: searchTerm,
        category_id: selectedCategory,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        per_page: 12,
        date_from: dateFilter, // Filter products from last 7 days
      });

      console.log('New arrivals response:', productsResponse);

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
    const [sortBy, sortOrder] = event.target.value.split('_');
    setSortBy(sortBy);
    setSortOrder(sortOrder);
    setCurrentPage(1); // Reset to first page when sorting
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
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/images/placeholder-product.jpg';
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
      <Box sx={{ pt: { xs: 14, md: 16 }, minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#FFD700' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: { xs: 14, md: 16 }, minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover the latest products added in the last 7 days including today
          </Typography>
          
          {/* Search and Filter Bar */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            justifyContent: 'center',
            mb: 4,
            p: 3,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Search Bar */}
            <TextField
              placeholder="Search new arrivals..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ 
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700',
                  },
                },
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: '#666', mr: 1 }} />,
              }}
            />

            {/* Category Filter */}
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
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
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: '#fff8e1',
                        color: '#FFD700',
                        '&:hover': {
                          backgroundColor: '#fff3c4',
                        },
                      },
                    },
                  },
                }}
                sx={{ 
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700',
                  },
                }}
              >
                <MenuItem value="" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>All Categories</MenuItem>
                {(Array.isArray(categories) ? categories : []).map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ 
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: '#fff8e1',
                      color: '#FFD700',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#fff8e1',
                      color: '#FFD700',
                      '&:hover': {
                        backgroundColor: '#fff3c4',
                      },
                    },
                  }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort Filter */}
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#FFD700',
                  }
                }}
              >Sort</InputLabel>
              <Select
                value={`${sortBy}_${sortOrder}`}
                onChange={handleSortChange}
                label="Sort"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: '#fff8e1',
                        color: '#FFD700',
                        '&:hover': {
                          backgroundColor: '#fff3c4',
                        },
                      },
                    },
                  },
                }}
                sx={{ 
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700',
                  },
                }}
              >
                <MenuItem value="created_at_desc" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>Newest First</MenuItem>
                <MenuItem value="created_at_asc" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>Oldest First</MenuItem>
                <MenuItem value="price_asc" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>Price: Low to High</MenuItem>
                <MenuItem value="price_desc" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>Price: High to Low</MenuItem>
                <MenuItem value="name_asc" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>Name: A to Z</MenuItem>
                <MenuItem value="name_desc" sx={{ 
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fff8e1',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: '#fff3c4',
                    },
                  },
                }}>Name: Z to A</MenuItem>
              </Select>
            </FormControl>
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
                : 'No new products added in the last 7 days. Check back soon for fresh arrivals!'
              }
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      }
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
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description?.substring(0, 80)}...
                      </Typography>

                      {/* Product Details */}
                      <Box sx={{ mb: 2 }}>
                        {getProductSizes(product) && (
                          <Chip 
                            label={`Sizes: ${getProductSizes(product)}`} 
                            size="small" 
                            sx={{ mr: 1, mb: 1, fontSize: '0.75rem' }}
                          />
                        )}
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
                          {formatPrice(product.price)}
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
                              {formatPrice(product.sale_price)}
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          sx={{
                            flex: 1,
                            backgroundColor: '#FFD700',
                            color: '#2C2C2C',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#F57F17',
                            },
                          }}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleViewProduct(product.id)}
                          sx={{
                            borderColor: '#FFD700',
                            color: '#FFD700',
                            '&:hover': {
                              borderColor: '#F57F17',
                              backgroundColor: '#fff8e1',
                            },
                          }}
                        >
                          View
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
