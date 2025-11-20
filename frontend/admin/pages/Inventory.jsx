import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  TablePagination,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Delete,
  Add,
  Warning,
  CheckCircle,
  Cancel,
  Inventory as InventoryIcon,
  TrendingUp,
  TrendingDown,
  Visibility,
  Close,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { useSettings } from '../contexts/SettingsContext';

const Inventory = () => {
  const { getSetting, getStockStatus, refreshSettings, loading: settingsLoading } = useSettings();
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    // Only run once on mount - don't refresh settings if they're already loaded
    // This prevents infinite loops
    if (!hasInitiallyLoaded) {
      // Wait for settings to be loaded before proceeding
      if (settingsLoading) {
        return;
      }

      // Settings are already loaded, just fetch inventory data
      console.log('Settings loaded, current threshold:', getSetting('low_stock_threshold', 10));
      fetchInventoryData();
      fetchCategories();
      setHasInitiallyLoaded(true); // Mark initial load complete
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading, hasInitiallyLoaded]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  // Refetch data when filters change (only after initial load)
  useEffect(() => {
    if (hasInitiallyLoaded) {
      fetchInventoryData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubcategory, selectedColor, selectedSize, filterStatus, searchTerm]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedSubcategory) params.append('subcategory_id', selectedSubcategory);
      if (selectedColor) params.append('color', selectedColor);
      if (selectedSize) params.append('size', selectedSize);
      if (filterStatus !== 'all') params.append('stock_status', filterStatus);
      if (searchTerm && searchTerm.trim()) params.append('search', searchTerm.trim());
      
      const response = await apiService.get(`/admin/inventory?${params.toString()}`);
      
      if (response.success) {
        const data = response.data?.data || response.data || [];
        setInventoryData(data);
        
        // Extract unique colors and sizes from the data
        const colors = new Set();
        const sizes = new Set();
        
        data.forEach(product => {
          if (product.available_colors) {
            product.available_colors.forEach(color => colors.add(color));
          }
          if (product.available_sizes) {
            product.available_sizes.forEach(size => sizes.add(size));
          }
        });
        
        setAvailableColors(Array.from(colors).sort());
        setAvailableSizes(Array.from(sizes).sort());
      } else {
        setError(response.message || 'Failed to fetch inventory data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/admin/categories');
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };


  const getComputedTotal = (product) => {
    // Use the total_quantity calculated by backend (sum of all variant original quantities)
    return typeof product.total_quantity !== 'undefined' ? Number(product.total_quantity) || 0 : 0;
  };

  const getComputedAvailable = (product) => {
    // Use the available_quantity calculated by backend (sum of all variant available stock)
    return typeof product.available_quantity !== 'undefined' ? Number(product.available_quantity) || 0 : 0;
  };

  const filteredData = inventoryData.filter(product => {
    const availableQuantity = getComputedAvailable(product);
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = q === '' ||
                         product.name?.toLowerCase().includes(q) ||
                         product.product_id?.toLowerCase().includes(q);
    
    let matchesFilter = true;
    if (filterStatus === 'low') {
      matchesFilter = getStockStatus(availableQuantity).status === 'low_stock';
    } else if (filterStatus === 'out') {
      matchesFilter = getStockStatus(availableQuantity).status === 'out_of_stock';
    }
    
    return matchesSearch && matchesFilter;
  });


  const getTotalValue = () => {
    return inventoryData.reduce((total, product) => {
      // Calculate value by summing all variants (price * quantity)
      if (product.variants && product.variants.length > 0) {
        const variantsValue = product.variants.reduce((variantTotal, variant) => {
          const variantPrice = variant.sale_price || variant.price || 0;
          const variantQuantity = variant.quantity || 0;
          return variantTotal + (variantPrice * variantQuantity);
        }, 0);
        return total + variantsValue;
      }
      return total;
    }, 0);
  };

  const getTotalItems = () => {
    return inventoryData.reduce((total, product) => {
      return total + getComputedTotal(product);
    }, 0);
  };

  const getTotalAvailableItems = () => {
    return inventoryData.reduce((total, product) => {
      return total + getComputedAvailable(product);
    }, 0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewVariants = (product) => {
    setSelectedProduct(product);
    setVariantsModalOpen(true);
  };

  const handleCloseVariantsModal = () => {
    setVariantsModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            Stock Overview
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Complete inventory management and tracking
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={fetchInventoryData}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#F57F17' },
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {getTotalItems()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#2196F3', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    PKR {getTotalValue().toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#FF9800', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.filter(product => {
                      const availableQuantity = getComputedAvailable(product);
                      return getStockStatus(availableQuantity).status === 'low_stock';
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#F44336', mr: 2 }}>
                  <TrendingDown />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.filter(product => {
                      const availableQuantity = getComputedAvailable(product);
                      return getStockStatus(availableQuantity).status === 'out_of_stock';
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('');
            }}
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
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All Items</MenuItem>
            <MenuItem value="low">Low Stock</MenuItem>
            <MenuItem value="out">Out of Stock</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={fetchInventoryData}
          sx={{ ml: 2 }}
        >
          Apply Filters
        </Button>
      </Box>

      {/* Inventory Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Total Stock</TableCell>
                <TableCell>Available Stock</TableCell>
                <TableCell>Variants</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Status</TableCell>
            
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => {
                  const totalQuantity = getComputedTotal(product);
                  // Calculate total value from all variants
                  const totalValue = product.variants && product.variants.length > 0 
                    ? product.variants.reduce((variantTotal, variant) => {
                        const variantPrice = variant.sale_price || variant.price || 0;
                        const variantQuantity = variant.quantity || 0;
                        return variantTotal + (variantPrice * variantQuantity);
                      }, 0)
                    : product.total_value || 0;
                  const stockStatus = getStockStatus(getComputedAvailable(product));
                  
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={product.images?.[0]?.image_url}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {product.name}
                            </Typography>
                            
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1976d2' }}>
                          {product.product_id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.category?.name}
                        </Typography>
                        {product.subcategory && (
                          <Typography variant="caption" color="text.secondary">
                            {product.subcategory.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {totalQuantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2196F3' }}>
                          {getComputedAvailable(product)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewVariants(product)}
                          sx={{ 
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem'
                          }}
                        >
                          {product.variants_count || 0} variants
                        </Button>
                      </TableCell>
                      <TableCell>
                        {product.variants && product.variants.length > 0 ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              PKR {product.display_sale_price || product.display_price || 0}
                            </Typography>
                            {product.display_sale_price && (
                              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#757575' }}>
                                PKR {product.display_price}
                              </Typography>
                            )}
                            {product.variants.length > 1 && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                ({product.variants.length} variants)
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No variants
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          PKR {totalValue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.status}
                          color={stockStatus.color}
                          size="small"
                        />
                      </TableCell>
                     
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>



      {/* Variants Modal */}
      <Dialog 
        open={variantsModalOpen} 
        onClose={handleCloseVariantsModal} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Product Variants - {selectedProduct?.name}
          </Typography>
          <IconButton onClick={handleCloseVariantsModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              {/* Product Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedProduct.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Stock: {getComputedTotal(selectedProduct)} units
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Stock: {getComputedAvailable(selectedProduct)} units
                </Typography>
              </Box>

              {/* Variants Table */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Size</TableCell>
                        <TableCell>Color</TableCell>
                        <TableCell>Total Stock</TableCell>
                        <TableCell>Available Stock</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Sale Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProduct.variants_with_stock ? 
                        selectedProduct.variants_with_stock.map((variantData, index) => (
                          <TableRow key={variantData.variant.id || index}>
                            <TableCell>
                              <Chip 
                                label={variantData.variant.size || 'N/A'} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: variantData.variant.color?.toLowerCase() || '#ccc',
                                    border: '1px solid #ddd'
                                  }}
                                />
                                <Typography variant="body2">
                                  {variantData.variant.color || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: variantData.total_stock > 0 ? 'success.main' : 'error.main'
                                }}
                              >
                                {variantData.total_stock || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: variantData.available_stock > 0 ? '#2196F3' : 'error.main'
                                }}
                              >
                                {variantData.available_stock || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {variantData.variant.sku || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                PKR {variantData.variant.price || selectedProduct.price || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {variantData.variant.sale_price ? `PKR ${variantData.variant.sale_price}` : 'N/A'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )) :
                        selectedProduct.variants.map((variant, index) => (
                          <TableRow key={variant.id || index}>
                            <TableCell>
                              <Chip 
                                label={variant.size || 'N/A'} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: variant.color?.toLowerCase() || '#ccc',
                                    border: '1px solid #ddd'
                                  }}
                                />
                                <Typography variant="body2">
                                  {variant.color || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: variant.quantity > 0 ? 'success.main' : 'error.main'
                                }}
                              >
                                {variant.quantity || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: '#757575'
                                }}
                              >
                                N/A
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {variant.sku || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                PKR {variant.price || selectedProduct.price || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {variant.sale_price ? `PKR ${variant.sale_price}` : 'N/A'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No variants found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This product doesn't have any variants configured.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariantsModal}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;