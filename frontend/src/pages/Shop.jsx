import React, { useState, useEffect } from "react";
import {
  Box,
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

const Shop = () => {
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
      console.log('Set selectedCategory to:', categoryFromUrl);
    } else {
      // Clear category if no URL parameter
      setSelectedCategory("");
    }
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change - with delay to ensure state is set
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 100); // Small delay to ensure state is properly set
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage]);

const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);

    // Build params but filter out empty strings / null / undefined
    const rawParams = {
      search: searchTerm ? searchTerm.trim() : "",
      category_id: selectedCategory,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: currentPage,
      per_page: 12,
    };
    
    // TEMPORARY: Force category_id to be included even if empty for debugging
    if (selectedCategory) {
      rawParams.category_id = selectedCategory;
    }

    // Don't filter out category_id even if it's empty string - let backend handle it
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([key, v]) => {
        if (key === 'category_id') return true; // Always include category_id
        return v !== "" && v !== null && v !== undefined;
      })
    );

    console.log('=== SHOP DEBUG ===');
    console.log('Fetching products with params:', params);
    console.log('selectedCategory value:', selectedCategory);
    console.log('searchTerm value:', searchTerm);
    console.log('sortBy value:', sortBy);
    console.log('sortOrder value:', sortOrder);
    console.log('rawParams before filtering:', rawParams);
    console.log('params after filtering:', params);
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#fff', py: 4, mb: 4 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
            Shop
          </Typography>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Discover our premium collection of gents fashion
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: '#666' }} />,
            }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="created_at">Newest</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSortBy("created_at");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {/* Products Grid */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, mb: 4 }}>
        {loading || isInitialLoad ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              No products found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '250px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={product.images?.[0]?.image_path ? `http://localhost:8000/storage/${product.images[0].image_path}` : "https://via.placeholder.com/300x250?text=No+Image"}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={product.category?.name || "FASHION"}
                        size="small"
                        sx={{
                          backgroundColor: '#f0f0f0',
                          color: '#666',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        mb: 1,
                        fontSize: '1.1rem',
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        mb: 2,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          color: '#333',
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
                          }}
                        >
                          ₨{product.price}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={(e) => handleAddToCart(product, e)}
                        sx={{
                          flex: 1,
                          backgroundColor: '#FFD700',
                          color: '#333',
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product.id);
                        }}
                        sx={{
                          borderColor: '#FFD700',
                          color: '#FFD700',
                          '&:hover': {
                            borderColor: '#F57F17',
                            color: '#F57F17',
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
        )}
      </Box>

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

      {/* Snackbar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
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
