import React, { useState, useEffect, useMemo } from "react";
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
import Breadcrumbs from "../components/Breadcrumbs";
import { Search, FilterList, ShoppingCart, Visibility } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";
import PageContainer from "../components/PageContainer";
import Footer from "../components/Footer";
import { getProductImageUrl } from "../utils/imageUtils";
import FilterMegaPanel from "../components/FilterMegaPanel";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // Handle URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const subcategoryFromUrl = searchParams.get('subcategory');
    const collectionFromUrl = searchParams.get('collection');
    console.log('URL category parameter:', categoryFromUrl);
    console.log('URL subcategory parameter:', subcategoryFromUrl);
    console.log('URL collection parameter:', collectionFromUrl);
    
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

    if (collectionFromUrl) {
      setSelectedCollection(collectionFromUrl);
      console.log('Set selectedCollection to:', collectionFromUrl);
    } else {
      setSelectedCollection("");
      console.log('No collection in URL, clearing selectedCollection');
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
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedCollection, sortBy, sortOrder, currentPage]);

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
      per_page: 1000, // Load all products at once
    };
    
    // Only include category_id if selectedCategory is not empty
    if (selectedCategory && selectedCategory !== "") {
      rawParams.category_id = selectedCategory;
    }
    
    // Only include subcategory_id if selectedSubcategory is not empty
    if (selectedSubcategory && selectedSubcategory !== "") {
      rawParams.subcategory_id = selectedSubcategory;
    }

    // Only include collection if selectedCollection is not empty
    if (selectedCollection && selectedCollection !== "") {
      rawParams.collection = selectedCollection;
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
    console.log('Categories available:', categories);
    const response = await apiService.getProducts(params);
    console.log('API Response:', response);
    console.log('Products received:', response.data?.data?.length || response.data?.length || 0);
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
    const categoryId = event.target.value;
    console.log('Category changed to:', categoryId, 'type:', typeof categoryId);
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === 'price_low') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price_high') {
      setSortBy('price');
      setSortOrder('desc');
    } else {
      setSortBy(value);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getSortDisplayValue = () => {
    if (sortBy === 'price' && sortOrder === 'asc') return 'price_low';
    if (sortBy === 'price' && sortOrder === 'desc') return 'price_high';
    return sortBy;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, cartItem) => {
    // Cart item is already added in ProductCard, just show success message
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarOpen(true);
  };

  const handleQuickAddToCart = (product) => {
    setSelectedProduct(product);
    setCartDrawerOpen(true);
  };

  const handleCartDrawerClose = () => {
    setCartDrawerOpen(false);
    setSelectedProduct(null);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSize = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  const toggleColor = (c) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]);
  const toggleCollection = (col) => setSelectedCollections(prev => prev.includes(col) ? prev.filter(x=>x!==col) : [...prev, col]);
  const clearAllFilters = () => { setSelectedSizes([]); setSelectedColors([]); setSelectedCollections([]); };

  const derivedSizes = Array.from(new Set(products.flatMap(p => Array.isArray(p.sizes)? p.sizes: [])));
  const derivedColors = Array.from(new Set(products.flatMap(p => Array.isArray(p.colors)? p.colors: []))).map(c => ({ value: c, label: c }));

  const applyPanel = () => { setPanelOpen(false); setCurrentPage(1); };

  // Handle "See More" button click
  const handleSeeMore = async () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setVisibleCount(prev => {
      const newCount = prev + 12;
      console.log('Loading more products. Previous:', prev, 'New:', newCount);
      return newCount;
    });
    setLoadingMore(false);
  };

  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (selectedColors.length) {
      list = list.filter(p => {
        const colors = Array.isArray(p.colors) ? p.colors : [];
        return colors.some(c => selectedColors.includes(c));
      });
    }
    if (selectedSizes.length) {
      list = list.filter(p => {
        const sizes = Array.isArray(p.sizes) ? p.sizes : [];
        return sizes.some(s => selectedSizes.includes(s));
      });
    }
    return list;
  }, [products, selectedColors, selectedSizes]);

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
      width: '100%',
      overflow: 'visible'
    }}>
      <Breadcrumbs />
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
        {/* Top bar right link */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, md: 0 } }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />
          <Button onClick={() => setPanelOpen(true)} sx={{ textTransform: 'none', color: '#000', fontSize: '0.9rem' }}>Sort and Filter</Button>
        </Box>

        {/* Mobile layout */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <TextField
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            fullWidth
            sx={{ 
              mb: 2, 
              '& .MuiOutlinedInput-root': { 
                fontSize: '0.85rem', 
                borderRadius: 1,
                backgroundColor: '#f9f9f9'
              } 
            }}
            InputProps={{ 
              startAdornment: <Search sx={{ mr: 1, color: '#666', fontSize: '18px' }} /> 
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ flex: 1, minWidth: '120px' }}  variant="standard">
              <InputLabel shrink={true} sx={{ fontSize: '0.8rem' }}>Category</InputLabel>
              <Select 
                value={selectedCategory} 
                onChange={handleCategoryChange} 
                label="Category" 
                displayEmpty
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Products</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ fontSize: '0.85rem' }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1, minWidth: '120px' , width: '100%',}}
             variant="standard">
              <InputLabel shrink={true} sx={{ fontSize: '0.8rem' }}>Collection</InputLabel>
              <Select 
                value={selectedCollection} 
                onChange={(e) => setSelectedCollection(e.target.value)} 
                label="Collection"
                displayEmpty
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Collections</MenuItem>
                <MenuItem value="Winter" sx={{ fontSize: '0.85rem' }}>Winter Collection</MenuItem>
                <MenuItem value="Summer" sx={{ fontSize: '0.85rem' }}>Summer Collection</MenuItem>
              </Select>
            </FormControl>
           
          </Box>
        </Box>

        {/* Desktop layout */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          gap: 2, 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: { md: 'row', lg: 'row' }
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField 
              placeholder="Search products..." 
              value={searchTerm} 
              onChange={handleSearch} 
              size="small" 
              sx={{ 
                minWidth: { md: 200, lg: 250 }, 
                '& .MuiOutlinedInput-root': { 
                  fontSize: '0.85rem', 
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9'
                } 
              }} 
              InputProps={{ 
                startAdornment: <Search sx={{ mr: 1, color: '#666', fontSize: '18px' }} /> 
              }} 
            />
            <FormControl size="small" sx={{ minWidth: { md: 160, lg: 180 } }}>
              <InputLabel shrink={true} sx={{ fontSize: '0.8rem' }}>Category</InputLabel>
              <Select 
                value={selectedCategory} 
                onChange={handleCategoryChange} 
                label="Category" 
                displayEmpty
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Products</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ fontSize: '0.85rem' }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { md: 140, lg: 160 } }}>
              <InputLabel shrink={true} sx={{ fontSize: '0.8rem' }}>Collection</InputLabel>
              <Select 
                value={selectedCollection} 
                onChange={(e) => setSelectedCollection(e.target.value)} 
                label="Collection"
                displayEmpty
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Collections</MenuItem>
                <MenuItem value="Winter" sx={{ fontSize: '0.85rem' }}>Winter Collection</MenuItem>
                <MenuItem value="Summer" sx={{ fontSize: '0.85rem' }}>Summer Collection</MenuItem>
              </Select>
            </FormControl>
           
          </Box>
          <Button 
            variant="text" 
            onClick={() => { 
              setSearchTerm(""); 
              setSelectedCategory(""); 
              setSelectedCollection("");
              setSortBy("created_at"); 
              setSortOrder('desc'); 
              setCurrentPage(1); 
            }} 
            sx={{ 
              fontSize: '0.8rem', 
              color: '#666', 
              textTransform: 'none', 
              minWidth: 'auto', 
              px: 2,
              py: 1,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Clear all
          </Button>
        </Box>
      </Box>

      <FilterMegaPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sizes={derivedSizes}
        colors={derivedColors}
        collections={[]}
        sortValue={getSortDisplayValue()}
        onSortChange={(v)=>{ handleSortChange({ target: { value: v } }); }}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedCollections={selectedCollections}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onToggleCollection={toggleCollection}
        onClearAll={clearAllFilters}
        onApply={applyPanel}
      />

      {/* Product Count */}
      {!loading && !isInitialLoad && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </Typography>
        </Box>
      )}

      {/* Products Grid */}
      <Box sx={{ mb: 4, minHeight: '400px' }}>
        {loading || isInitialLoad ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              No products found
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
              Debug: Loading: {loading.toString()}, Products length: {products.length}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{ 
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: { xs: 1, sm: 2, md: 3 },
              px: { xs: 1, sm: 2, md: 4 },
              justifyContent: "center",
              minHeight: "400px",
              alignItems: "start",
            }}
          >
            {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showHoverButtons={true}
                  showDiscount={true}
                  showWishlist={true}
                  showQuickView={true}
                  showAddToCart={true}
                  showStock={true}
                  cardHeight="auto"
                  imageHeight="250px"
                />
            ))}
                    </Box>
        )}

      {/* See More Button */}
      {filteredProducts.length > visibleCount && (
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
                backgroundColor: "#E0E0E0",
                color: "#9E9E9E",
                transform: "none",
                boxShadow: "none",
              },
              transition: "all 0.3s ease",
            }}
          >
            {loadingMore ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} sx={{ color: "#2C2C2C" }} />
                <span>Loading...</span>
                    </Box>
            ) : (
              `View More (${filteredProducts.length - visibleCount} left)`
            )}
          </Button>
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

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={handleCartDrawerClose}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </Box>
  );
};

export default Shop;
