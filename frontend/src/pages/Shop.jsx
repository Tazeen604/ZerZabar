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
import PageHeaderWithSettings from "../components/PageHeaderWithSettings";
import { Search, FilterList, ShoppingCart, Visibility } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartReservationContext";
import apiService from "../services/api";
import PageContainer from "../components/PageContainer";
import Footer from "../components/Footer";
import { getProductImageUrl } from "../utils/imageUtils";
import FilterMegaPanel from "../components/FilterMegaPanel";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import CategoryCarousel from "../components/CategoryCarousel";

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
  const [categoryParam, setCategoryParam] = useState(null);

  // Handle URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const subcategoryFromUrl = searchParams.get('subcategory');
    const collectionFromUrl = searchParams.get('collection');
    console.log('URL category parameter:', categoryFromUrl);
    console.log('URL subcategory parameter:', subcategoryFromUrl);
    console.log('URL collection parameter:', collectionFromUrl);
    
    // Store raw category param; resolution to ID will happen after categories load
    // Only set if it's not null/undefined/empty
    if (categoryFromUrl && categoryFromUrl.trim() !== '') {
      setCategoryParam(categoryFromUrl.trim());
    } else {
      setCategoryParam(null);
      setSelectedCategory(""); // Clear category if no param in URL
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
      setSelectedCollections([collectionFromUrl]);
      console.log('Set selectedCollection to:', collectionFromUrl);
    } else {
      setSelectedCollection("");
      setSelectedCollections([]);
      console.log('No collection in URL, clearing selectedCollection');
    }
  }, [searchParams]);

  // Resolve category param (can be ID, name, or slug) to numeric ID once categories are available
  useEffect(() => {
    const normalize = (str) =>
      (str || "")
        .toString()
        .trim()
        .toLowerCase();

    const slugify = (str) =>
      normalize(str)
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    if (!categoryParam || categoryParam.trim() === '') {
      setSelectedCategory("");
      console.log('No categoryParam, clearing selectedCategory');
      return;
    }

    const trimmedParam = categoryParam.trim();
    console.log('Resolving category param:', trimmedParam, 'Categories loaded:', categories.length);

    // If param is numeric, use directly
    if (/^\d+$/.test(trimmedParam)) {
      console.log('Category param is numeric, using directly:', trimmedParam);
      setSelectedCategory(trimmedParam);
      return;
    }

    // Try resolving by slug or name from loaded categories
    const paramNorm = normalize(trimmedParam);
    const paramSlug = slugify(trimmedParam);

    let match = null;
    if (Array.isArray(categories) && categories.length > 0) {
      match = categories.find((c) => {
        const nameNorm = normalize(c?.name);
        const slugNorm = normalize(c?.slug);
        const nameSlug = slugify(c?.name);
        const idMatch = String(c?.id) === trimmedParam;
        return (
          idMatch ||
          slugNorm === paramNorm ||
          nameNorm === paramNorm ||
          nameSlug === paramSlug
        );
      });
    }

    if (match && match.id != null) {
      const categoryId = String(match.id);
      console.log('Category match found, setting selectedCategory to:', categoryId);
      setSelectedCategory(categoryId);
    } else {
      // No match found; clear filter to avoid sending invalid category_id
      console.log('No category match found for param:', trimmedParam);
      setSelectedCategory("");
    }
  }, [categoryParam, categories]);

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

    // Collection filtering is now handled client-side

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
    // The backend returns { success: true, data: [...], message: "..." }
    // The API service returns this structure directly
    const categoriesPayload = response.data;
    const categoriesArray = Array.isArray(categoriesPayload) ? categoriesPayload : [];
    
    // Debug: Check if categories now have image field
    console.log('🔍 Shop - Categories loaded:', categoriesArray.length);
    if (categoriesArray.length > 0) {
      console.log('🔍 Shop - First category structure:', categoriesArray[0]);
      console.log('🔍 Shop - First category has image field?', 'image' in categoriesArray[0]);
      console.log('🔍 Shop - First category image value:', categoriesArray[0].image);
    }
    
    setCategories(categoriesArray);
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

  const handleCategoryCarouselSelect = (categoryId, categoryName) => {
    console.log('Category carousel selected:', categoryId, categoryName);
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
  const toggleCollection = (col) => setSelectedCollections(prev => prev.includes(col) ? [] : [col]);
  const clearAllFilters = () => { setSelectedSizes([]); setSelectedColors([]); setSelectedCollections([]); setSelectedCollection(""); };

  // Extract sizes and colors from variants
  const derivedSizes = Array.from(new Set(products.flatMap(p => 
    Array.isArray(p.variants) ? p.variants.map(v => v.size).filter(Boolean) : []
  )));
  const derivedColors = Array.from(new Set(products.flatMap(p => 
    Array.isArray(p.variants) ? p.variants.map(v => v.color).filter(Boolean) : []
  ))).map(c => ({ value: c, label: c }));

  const applyPanel = () => { 
    // Sync single selected collection from panel to main collection filter
    setSelectedCollection(selectedCollections[0] || "");
    setPanelOpen(false); 
    setCurrentPage(1); 
  };

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
        const colors = Array.isArray(p.variants) ? p.variants.map(v => v.color).filter(Boolean) : [];
        return colors.some(c => selectedColors.includes(c));
      });
    }
    if (selectedSizes.length) {
      list = list.filter(p => {
        const sizes = Array.isArray(p.variants) ? p.variants.map(v => v.size).filter(Boolean) : [];
        return sizes.some(s => selectedSizes.includes(s));
      });
    }
    if (selectedCollections.length) {
      list = list.filter(p => {
        return selectedCollections.includes(p.collection);
      });
    }
    return list;
  }, [products, selectedColors, selectedSizes, selectedCollections]);

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
      pt: 0, 
      width: '100%',
      overflow: 'visible'
    }}>
      <PageHeaderWithSettings title="Shop" breadcrumb="Home / Shop" defaultBgImage="/images/new-arrival.jpg" />
      <Container 
        maxWidth="xl"
        sx={{ 
          maxWidth: '100% !important', // Full width for maximum card size
          mx: 'auto',
          px: { xs: 0, sm: 1, md: 1, lg: 1.5, xl: 2 }, // Reduced desktop padding
          py: { xs: 0.5, sm: 2, md: 2, lg: 2, xl: 2 } // Reduced mobile padding
        }}
      >
      

      {/* Category Carousel */}
      <Box sx={{ mb: 1, py: 1, borderTop: '1px solid #f0f0f0',  px: { xs: 1, sm: 2, md: 4 } }}>
        <CategoryCarousel
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryCarouselSelect}
          showViewAll={true}
          maxVisible={6}
          showNavigation={true}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, py: 0.5, borderBottom: '1px solid #f0f0f0', px: { xs: 2, sm: 2, md: 3 } }}>

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
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Collection moved to Filter Mega Panel */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="text"
                onClick={() => setPanelOpen(true)}
                startIcon={<FilterList />}
                sx={{ 
                  minWidth: 'auto',
                  px: 0,
                  color: '#666',
                  textTransform: 'none',
                  '&:hover': {
                    color: '#FFD700',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                Filter
              </Button>
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
                  fontSize: '0.85rem',
                  color: '#666',
                  textTransform: 'none',
                  px: 0,
                  py: 0.5,
                  '&:hover': {
                    color: '#FFD700',
                    backgroundColor: 'transparent',
                  }
                }}
              >
                Clear all 
              </Button>
            </Box>
           
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
            {/* Collection moved to Filter Mega Panel */}
           
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              onClick={() => setPanelOpen(true)}
              startIcon={<FilterList />}
              sx={{ 
                minWidth: 'auto',
                px: 0,
                color: '#666',
                textTransform: 'none',
                '&:hover': {
                  color: '#FFD700',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Filter
            </Button>
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
      </Box>

      <FilterMegaPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sizes={derivedSizes}
        colors={derivedColors}
        collections={["Winter", "Summer", "All Season"]}
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
      {!loading && !isInitialLoad && Array.isArray(filteredProducts) && (
        <Box sx={{ mb: 2,mt:2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', px: { xs: 1, sm: 2, md: 4 } }}>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            {(filteredProducts?.length || 0)} {(filteredProducts?.length || 0) === 1 ? 'product' : 'products'}
          </Typography>
        </Box>
      )}

      {/* Products Grid */}
      <Box sx={{ mb: 4, minHeight: '400px' }}>
        {loading || isInitialLoad ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
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
                md: "repeat(4, 1fr)",
                lg: "repeat(4, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: { xs: 0.1, sm: 0.75, md: 1, lg: 1.5, xl: 1.5 },
              px: { xs: 0, sm: 0.5, md: 1, lg: 1.5, xl: 2 },
              justifyContent: "center",
              minHeight: "400px",
              alignItems: "start",
              maxWidth: { xs: "100%", sm: "100%", md: "1200px", lg: "1400px", xl: "1600px" },
              mx: "auto",
            }}
          >
            {(Array.isArray(filteredProducts) ? filteredProducts : []).slice(0, visibleCount).map((product) => (
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
      {Array.isArray(filteredProducts) && filteredProducts.length > visibleCount && (
                    <Box sx={{ 
          display: "flex",
          justifyContent: "center",
          borderRadius:22,
          mt: { xs: 2, md: 6 },
          px: { xs: 0, sm: 1, md: 0.75, lg: 1, xl: 1.25 }
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
              `View More (${Math.max((filteredProducts?.length || 0) - visibleCount, 0)} left)`
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
