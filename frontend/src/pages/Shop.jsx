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
import { Search, FilterList, ShoppingCart, Visibility } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";
import PageContainer from "../components/PageContainer";
import Footer from "../components/Footer";
import { getProductImageUrl } from "../utils/imageUtils";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
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
    const subcategoryFromUrl = searchParams.get('subcategory');
    console.log('URL category parameter:', categoryFromUrl);
    console.log('URL subcategory parameter:', subcategoryFromUrl);
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      console.log('Set selectedCategory to:', categoryFromUrl);
    } else {
      setSelectedCategory("");
      console.log('No category in URL, clearing selectedCategory to show all products');
    }
    
    if (subcategoryFromUrl) {
      setSelectedSubcategory(subcategoryFromUrl);
      console.log('Set selectedSubcategory to:', subcategoryFromUrl);
    } else {
      setSelectedSubcategory("");
      console.log('No subcategory in URL, clearing selectedSubcategory');
    }
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change - with delay to ensure state is set
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('useEffect triggered for fetchProducts with selectedCategory:', selectedCategory, 'selectedSubcategory:', selectedSubcategory);
      fetchProducts();
    }, 100); // Small delay to ensure state is properly set
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedSubcategory, sortBy, sortOrder, currentPage]);

const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);

    // Build params but filter out empty strings / null / undefined
    const rawParams = {
      search: searchTerm ? searchTerm.trim() : "",
      sort_by: sortBy,
      sort_order: sortOrder,
      page: currentPage,
      per_page: 12,
    };
    
    // Only include category_id if selectedCategory is not empty
    if (selectedCategory && selectedCategory !== "") {
      rawParams.category_id = selectedCategory;
    }
    
    // Only include subcategory_id if selectedSubcategory is not empty
    if (selectedSubcategory && selectedSubcategory !== "") {
      rawParams.subcategory_id = selectedSubcategory;
    }

    // Filter out empty values
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([key, v]) => {
        return v !== "" && v !== null && v !== undefined;
      })
    );

    console.log('=== SHOP DEBUG ===');
    console.log('Fetching products with params:', params);
    console.log('selectedCategory value:', selectedCategory, 'type:', typeof selectedCategory);
    console.log('selectedSubcategory value:', selectedSubcategory, 'type:', typeof selectedSubcategory);
    console.log('searchTerm value:', searchTerm);
    console.log('sortBy value:', sortBy);
    console.log('sortOrder value:', sortOrder);
    console.log('rawParams before filtering:', rawParams);
    console.log('params after filtering:', params);
    console.log('Will include category_id?', selectedCategory && selectedCategory !== "");
    console.log('Will include subcategory_id?', selectedSubcategory && selectedSubcategory !== "");
    const response = await apiService.getProducts(params);
    console.log('API Response:', response);
    console.log('=== END DEBUG ===');
    
    // Mark initial load as complete
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }

    // Backend response shape can be:
    // 1) { success, data: [ ... ] }        <-- no pagination (get())
    // 2) { success, data: { data: [...], last_page, current_page, total, ... } }  <-- paginate()
    const payload = response.data; // axios response body
    const wrapper = payload?.data;

    if (Array.isArray(wrapper)) {
      // case (1): data is directly an array
      setProducts(wrapper);
      setTotalPages(1);
    } else if (wrapper && Array.isArray(wrapper.data)) {
      // case (2): paginated wrapper
      setProducts(wrapper.data);
      setTotalPages(wrapper.last_page ?? 1);
    } else {
      // unexpected shape => empty
      setProducts([]);
      setTotalPages(1);
    }
  } catch (err) {
    console.error('Error fetching products:', err);
    setError(err.response?.data?.message || err.message || 'Failed to fetch products');
  } finally {
    setLoading(false);
  }
};

const fetchCategories = async () => {
  try {
    const response = await apiService.getCategories();
    // categories API sometimes returns { success, data: [...] } - handle both
    const categoriesPayload = response.data?.data ?? response.data;
    setCategories(Array.isArray(categoriesPayload) ? categoriesPayload : []);
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.sale_price || product.price || 0),
      originalPrice: product.sale_price ? parseFloat(product.price || 0) : null,
      image: product.images?.[0]?.image_path,
      size: 'M', // Default size for shop
      color: '', // Default color for shop
      quantity: 1,
    };
    
    addToCart(cartItem);
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarOpen(true);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log('Shop component render - loading:', loading, 'products:', products, 'products.length:', products.length);

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#fff', 
      minHeight: '100vh', 
      pt: 12,
      width: '100%'
    }}>
      <Container 
        maxWidth="xl"
        sx={{ 
          maxWidth: '1280px !important', // Increased width for 4 cards
          mx: 'auto',
          px: { xs: 1, sm: 2, md: 2 } // Reduced padding for 4 cards
        }}
      >
      {/* Header */}
        <Box sx={{ backgroundColor: '#fff', py: 2, mb: 2, px: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 300, color: '#000', mb: 0.5, textAlign: 'left', fontSize: '1.8rem', letterSpacing: '0.5px' }}>
            Shop
          </Typography>
        <Typography variant="body2" sx={{ color: '#666', textAlign: 'left', fontSize: '0.85rem' }}>
          Discover our premium collection
          </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, py: 2, borderBottom: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
              placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
              size="small"
              sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.85rem',
                  borderRadius: 0,
                }
              }}
            InputProps={{
                startAdornment: <Search sx={{ mr: 0.5, color: '#666', fontSize: '18px' }} />,
            }}
          />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  fontSize: '0.85rem',
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
                }}>All Products</MenuItem>
              {categories.map((category) => (
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

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel 
                shrink={true}
                sx={{ 
                  fontSize: '0.85rem',
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#FFD700',
                  }
                }}
              >Sort</InputLabel>
            <Select
              value={sortBy}
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
                <MenuItem value="created_at" sx={{ 
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
                }}>Newest</MenuItem>
                <MenuItem value="name" sx={{ 
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
                }}>Name</MenuItem>
                <MenuItem value="price" sx={{ 
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
                }}>Price</MenuItem>
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
              fontSize: '0.8rem',
              color: '#666',
              textTransform: 'none',
              minWidth: 'auto',
              px: 1,
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              }
            }}
          >
            Clear all
          </Button>
        </Box>
      </Box>

      {/* Product Count */}
      {!loading && !isInitialLoad && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </Typography>
        </Box>
      )}

      {/* Products Grid */}
      <Box sx={{ mb: 4 }}>
        {loading || isInitialLoad ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              No products found
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
              Debug: Loading: {loading.toString()}, Products length: {products.length}
            </Typography>
          </Box>
        ) : (
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
                  onClick={() => handleProductClick(product.id)}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '280px', // Fixed width matching card
                      height: '320px', // Increased height for better proportions
                      minHeight: '320px', // Ensure minimum height
                      maxHeight: '320px', // Prevent height expansion
                      overflow: 'hidden',
                      backgroundColor: '#f9f9f9',
                      flexShrink: 0, // Prevent shrinking
                    }}
                  >
                    <img
                      src={getProductImageUrl(product.images)}
                      alt={product.name}
                      style={{
                        width: '280px', // Fixed width
                        height: '320px', // Fixed height
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block', // Prevent inline spacing issues
                      }}
                    />
                  </Box>
                  <CardContent sx={{ 
                    height: '150px', // Increased height for better button spacing
                    minHeight: '150px',
                    maxHeight: '150px',
                    width: '280px', // Fixed width matching card
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', // Distribute space evenly
                    p: 1.5, 
                    pb: 2.5, // Increased bottom padding for buttons
                    '&:last-child': { pb: 2.5 }, // Ensure bottom padding
                    overflow: 'hidden' // Prevent content overflow
                  }}>
                    <Box sx={{ mb: 0.5 }}>
                      <Chip
                        label={product.category?.name || "FASHION"}
                        size="small"
                        sx={{
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          fontSize: '0.6rem',
                          height: '18px',
                          borderRadius: 0,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 400,
                        color: '#000',
                        mb: 0.5,
                        fontSize: '0.85rem',
                        lineHeight: 1.2,
                        height: '2.4em', // Fixed height for 2 lines
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 'auto' }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: '#000',
                          fontSize: '0.9rem',
                        }}
                      >
                        ₨{product.sale_price || product.price}
                      </Typography>
                      {product.sale_price && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#999',
                            textDecoration: 'line-through',
                            fontSize: '0.8rem',
                          }}
                        >
                          ₨{product.price}
                        </Typography>
                      )}
                    </Box>

                    {/* Spacer to push buttons to bottom */}
                    <Box sx={{ flex: 1 }} />

                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, // Increased gap between buttons
                      mt: 1, // Add top margin for separation
                      mb: 1.5, // Increased bottom margin for better visibility
                      px: 0.5 // Add horizontal padding
                    }}>
                      <Button
                        variant="contained"
                        onClick={(e) => handleAddToCart(product, e)}
                        sx={{
                          width: '180px', // Fixed width instead of flex: 1
                          backgroundColor: '#FFD700',
                          color: '#000',
                          fontSize: '0.65rem', // Slightly smaller font
                          fontWeight: 600,
                          py: 0.8,
                          px: 1,
                          borderRadius: 0,
                          textTransform: 'uppercase',
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: '#FFC107',
                          },
                        }}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product.id);
                        }}
                        sx={{
                          minWidth: '45px',
                          width: '45px', // Slightly larger for better proportion
                          height: '36px', // Match Add to Cart button height
                          borderColor: '#FFD700',
                          color: '#FFD700',
                          fontSize: '0.7rem',
                          py: 0.8,
                          px: 0.5,
                          borderRadius: 0,
                          '&:hover': {
                            borderColor: '#FFC107',
                            color: '#FFC107',
                            backgroundColor: 'rgba(255, 215, 0, 0.04)',
                          },
                        }}
                      >
                        <Visibility sx={{ fontSize: '16px' }} />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
      </Box>

      </Container>

      {/* Footer */}
      <Footer />

      {/* Snackbar */}
      <Box
        sx={{
          position: 'fixed',
          top: 100, // Position below navbar
          right: 20,
          zIndex: 1000,
        }}
      >
        {snackbarOpen && (
          <Alert
            severity="success"
            onClose={() => setSnackbarOpen(false)}
            sx={{ minWidth: 300 }}
          >
            {snackbarMessage}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default Shop;
