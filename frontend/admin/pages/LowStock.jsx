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
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Search,
  Warning,
  CheckCircle,
  Inventory,
  TrendingDown,
  Add,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { useSettings } from '../contexts/SettingsContext';

const LowStock = () => {
  const { getSetting, getStockStatus } = useSettings();
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/inventory/low-stock');
      
      if (response.success) {
        setInventoryData(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch low stock items');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch low stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuantity = (item) => {
    setSelectedItem(item);
    setEditQuantity(item.stock_quantity);
    setEditDialogOpen(true);
  };

  const handleSaveQuantity = async () => {
    try {
      console.log('Adjusting stock for product:', selectedItem.id, 'to quantity:', editQuantity);
      
      const response = await apiService.post(`/admin/inventory/${selectedItem.id}/adjust`, {
        quantity: editQuantity,
        type: 'set',
        notes: 'Manual adjustment'
      });

      console.log('API Response:', response);

      if (response.success) {
        setEditDialogOpen(false);
        setSelectedItem(null);
        setEditQuantity(0);
        // Force refresh with a small delay to ensure backend has processed
        setTimeout(() => {
          fetchLowStockItems();
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

  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    const threshold = item.low_stock_threshold || 10;
    if (filterStatus === 'low') {
      matchesFilter = item.stock_quantity <= threshold && item.stock_quantity > 0;
    } else if (filterStatus === 'out') {
      matchesFilter = item.stock_quantity <= 0;
    }
    
    return matchesSearch && matchesFilter;
  });

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
            Low Stock Items
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Monitor and manage items with low stock levels
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={fetchLowStockItems}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#F57F17' },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ backgroundColor: '#FF9800', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.filter(item => {
                      const threshold = item.low_stock_threshold || 10;
                      return item.stock_quantity <= threshold && item.stock_quantity > 0;
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
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.filter(item => item.stock_quantity <= 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
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
                <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.filter(item => {
                      const threshold = item.low_stock_threshold || 10;
                      return item.stock_quantity > threshold;
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Well Stocked
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
                  <TrendingDown />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
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
      </Box>

      {/* Inventory Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Low Stock Threshold</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => {
                  const stockStatus = getStockStatus(item.stock_quantity);
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={item.images?.[0]?.image_url}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.category?.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.stock_quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{threshold}</TableCell>
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
                          variant="outlined"
                          onClick={() => handleEditQuantity(item)}
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
            <Typography variant="body1" sx={{ mb: 2 }}>
              Product: {selectedItem?.name}
            </Typography>
            <TextField
              label="New Quantity"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
              fullWidth
              sx={{ mt: 2 }}
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

export default LowStock;
