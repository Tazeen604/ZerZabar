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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { useSettings } from '../contexts/SettingsContext';

const Inventory = () => {
  const { getSetting, getStockStatus, refreshSettings } = useSettings();
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editQuantity, setEditQuantity] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    // Refresh settings first to ensure we have latest threshold values
    refreshSettings().then(() => {
      console.log('Settings refreshed, current threshold:', getSetting('low_stock_threshold', 10));
      fetchInventoryData();
      fetchCategories();
    });
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedSubcategory) params.append('subcategory_id', selectedSubcategory);
      if (filterStatus !== 'all') params.append('stock_status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await apiService.get(`/admin/inventory?${params.toString()}`);
      
      if (response.success) {
        const data = response.data?.data || response.data || [];
        setInventoryData(data);
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

  const handleAdjustStock = (product) => {
    setSelectedItem(product);
    setEditQuantity(product.total_quantity || 0);
    setEditDialogOpen(true);
  };

  const handleEditQuantity = (item) => {
    setSelectedItem(item);
    setEditQuantity(item.inventory?.quantity || 0);
    setEditDialogOpen(true);
  };

  const handleSaveQuantity = async () => {
    try {
      console.log('Adjusting stock for product:', selectedItem);
      console.log('Product ID:', selectedItem.id);
      console.log('New quantity:', editQuantity);
      
      const response = await apiService.put(`/admin/inventory/${selectedItem.id}/stock`, {
        quantity: editQuantity,
        notes: 'Manual adjustment'
      });

      console.log('API Response:', response);

      if (response.success) {
        setEditDialogOpen(false);
        setSelectedItem(null);
        setEditQuantity(0);
        // Force refresh with a small delay to ensure backend has processed
        setTimeout(() => {
          fetchInventoryData();
        }, 500);
        console.log('Stock adjustment successful, refreshing data...');
      } else {
        console.error('API Error:', response);
        setError(response.message || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError(err.message || 'Failed to update quantity');
    }
  };

  const filteredData = inventoryData.filter(product => {
    const totalQuantity = product.total_quantity || 0;
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'low') {
      matchesFilter = getStockStatus(totalQuantity).status === 'low_stock';
    } else if (filterStatus === 'out') {
      matchesFilter = getStockStatus(totalQuantity).status === 'out_of_stock';
    }
    
    return matchesSearch && matchesFilter;
  });


  const getTotalValue = () => {
    return inventoryData.reduce((total, product) => {
      const totalQuantity = product.total_quantity || 0;
      return total + (totalQuantity * product.price || 0);
    }, 0);
  };

  const getTotalItems = () => {
    return inventoryData.reduce((total, product) => {
      return total + (product.total_quantity || 0);
    }, 0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
                      const totalQuantity = product.total_quantity || 0;
                      return getStockStatus(totalQuantity).status === 'low_stock';
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
                      const totalQuantity = product.total_quantity || 0;
                      return getStockStatus(totalQuantity).status === 'out_of_stock';
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
                <TableCell>Category</TableCell>
                <TableCell>Total Stock</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => {
                  const totalQuantity = product.total_quantity || 0;
                  const totalValue = product.total_value || 0;
                  const stockStatus = getStockStatus(totalQuantity);
                  
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
                            <Typography variant="body2" color="text.secondary">
                              SKU: {product.sku} • {product.variants_count || 0} variants
                            </Typography>
                          </Box>
                        </Box>
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
                      <TableCell>PKR {product.price || 0}</TableCell>
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
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAdjustStock(product)}
                          sx={{ mr: 1 }}
                        >
                          Adjust Stock
                        </Button>
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


      {/* Edit Quantity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Stock Quantity</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Product: {selectedItem?.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              SKU: {selectedItem?.sku}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Current Stock: {selectedItem?.total_quantity || 0} units
            </Typography>
            <TextField
              label="New Stock Quantity"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
              fullWidth
              sx={{ mt: 2 }}
              helperText="Enter the new total stock quantity for this product"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuantity} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;