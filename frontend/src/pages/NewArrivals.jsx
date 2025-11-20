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
import { Search, FilterList, ShoppingCart, Visibility, NewReleases } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartReservationContext";
import apiService from "../services/api";
import Footer from "../components/Footer";
import { getProductImageUrl } from "../utils/imageUtils";
import FilterMegaPanel from "../components/FilterMegaPanel";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import CategoryCarousel from "../components/CategoryCarousel";

const NewArrivals = () => {
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
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [newArrivalsDays, setNewArrivalsDays] = useState(7); // Default value
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filter states
  const [selectedCollection, setSelectedCollection] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // Handle URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const collectionFromUrl = searchParams.get('collection');
    console.log('URL category parameter:', categoryFromUrl);
    console.log('URL collection parameter:', collectionFromUrl);
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    if (collectionFromUrl) {
      setSelectedCollection(collectionFromUrl);
      setSelectedCollections([collectionFromUrl]);
    } else {
      setSelectedCollections([]);
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
        per_page: 1000, // Load all products at once
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
      
      // The backend returns { success: true, data: [...], message: "..." }
      const categoriesData = categoriesResponse.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

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

  const handleCategoryCarouselSelect = (categoryId, categoryName) => {
    console.log('Category carousel selected:', categoryId, categoryName);
    setSelectedCategory(categoryId);
    setCurrentPage(1);
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

  // Filter handler functions
  const handleCollectionChange = (event) => {
    setSelectedCollection(event.target.value);
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleCollection = (collection) => {
    setSelectedCollections(prev => 
      prev.includes(collection) 
        ? prev.filter(c => c !== collection)
        : [...prev, collection]
    );
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCollections([]);
    setSelectedCollection("");
  };

  const applyPanel = () => {
    // Sync single selected collection from panel to main collection filter
    setSelectedCollection(selectedCollections[0] || "");
    setPanelOpen(false);
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

  // Derive filter options from products
  const derivedSizes = Array.from(new Set(products.flatMap(p => 
    Array.isArray(p.variants) ? p.variants.map(v => v.size).filter(Boolean) : []
  )));

  const derivedColors = Array.from(new Set(products.flatMap(p => 
    Array.isArray(p.variants) ? p.variants.map(v => v.color).filter(Boolean) : []
  ))).map(c => ({ value: c, label: c }));

  // Client-side filtering for sizes, colors, and collections
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

  if (loading && isInitialLoad) {
    return (
      <Box sx={{ pt: { xs: 10, md: 16 }, minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#FFD700' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      pt: 0, 
      minHeight: 'calc(100vh - 120px)',
      backgroundColor: '#fff'
    }}>
      <PageHeaderWithSettings title="New Arrivals" breadcrumb="Home / New Arrivals" defaultBgImage="/images/new-arrival.jpg" />
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
      <Box sx={{ mb: 1, py: 1,   px: { xs: 1, sm: 2, md: 4 } }}>
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
      <Box sx={{ 
        mb: 3, 
        py: { xs: 1, md: 1 }, 
        borderBottom: '1px solid #f0f0f0',
        px: { xs: 0.5, sm: 1, md: 0.75, lg: 1, xl: 1.25 }
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
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            {/* Collection moved to Filter Mega Panel */}

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
                setSelectedCollections([]);
                setSortBy("created_at");
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
                  backgroundColor: 'transparent'
                }
              }}
            >
              Clear all 
            </Button>
          </Box>
          
        </Box>

        {/* Desktop Layout */}
          <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
            gap: 2, 
          alignItems: 'center', 
          justifyContent: 'space-between' ,
          mt:0,
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

            {/* Collection moved to Filter Mega Panel */}

           
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                setSelectedCollections([]);
                setSortBy("created_at");
                setCurrentPage(1);
              }}
              sx={{
                fontSize: '0.9rem',
                color: '#666',
                textTransform: 'none',
                px: 0,
                py: 1,
                borderRadius: 0,
                '&:hover': {
                  color: '#FFD700',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Clear all
            </Button>
          </Box>
        </Box>
      </Box>
{/* Product Count */}
{!loading && !isInitialLoad && Array.isArray(filteredProducts) && (
        <Box sx={{ mb: 2, mt:2,display: 'flex', justifyContent: 'flex-start', alignItems: 'center', px: { xs: 1, sm: 2, md: 4 } }}>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            {(filteredProducts?.length || 0)} {(filteredProducts?.length || 0) === 1 ? 'product' : 'products'}
          </Typography>
        </Box>
      )}
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
        ) : filteredProducts.length === 0 ? (
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
                maxWidth: { xs: "100%", sm: "100%", md: "1200px", lg: "1400px", xl: "1600px" },
                mx: "auto",
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

            {/* See More Button */}
            {filteredProducts.length > visibleCount && (
              <Box sx={{
                display: "flex",
                justifyContent: "center",
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
                    `View More (${filteredProducts.length - visibleCount} left)`
                  )}
                </Button>
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

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={handleCartDrawerClose}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Filter Mega Panel */}
      <FilterMegaPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sizes={derivedSizes}
        colors={derivedColors}
        collections={["Winter", "Summer", "All Season"]}
        sortValue={getSortDisplayValue()}
        onSortChange={(v) => { handleSortChange({ target: { value: v } }); }}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedCollections={selectedCollections}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onToggleCollection={toggleCollection}
        onClearAll={clearAllFilters}
        onApply={applyPanel}
      />

      <Footer />
    </Box>
  );
};

export default NewArrivals;
