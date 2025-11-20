import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Inventory,
  ShoppingCart,
  Assessment,
  Refresh,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const InventoryDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalVariants: 0,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    products: [],
  });
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/inventory/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setEditQuantity(variant.quantity);
    setEditDialogOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!editingVariant) return;

    try {
      setLoading(true);
      await apiService.put(`/admin/variants/${editingVariant.id}`, {
        quantity: editQuantity,
      });

      setSuccess('Inventory updated successfully');
      setEditDialogOpen(false);
      setEditingVariant(null);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Error updating variant:', err);
      setError('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, threshold = lowStockThreshold) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'error', icon: <TrendingDown /> };
    if (quantity <= threshold) return { status: 'Low Stock', color: 'warning', icon: <Warning /> };
    return { status: 'In Stock', color: 'success', icon: <TrendingUp /> };
  };

  const getTotalSoldQuantity = () => {
    // This would typically come from order data
    return dashboardData.products.reduce((total, product) => {
      return total + (product.total_sold || 0);
    }, 0);
  };

  if (loading && dashboardData.totalProducts === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inventory Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Inventory sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {dashboardData.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Variants
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {dashboardData.totalVariants}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Stock
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {dashboardData.totalStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Low Stock
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {dashboardData.lowStockProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock Alert */}
      {dashboardData.lowStockProducts > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Warning sx={{ mr: 1 }} />
          {dashboardData.lowStockProducts} products have low stock variants. Please review and restock.
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Product Inventory Details
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Variants</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Low Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.products.map((product) => {
                  const lowStockVariants = product.variants?.filter(v => v.quantity <= lowStockThreshold) || [];
                  const outOfStockVariants = product.variants?.filter(v => v.quantity === 0) || [];
                  const totalStock = product.variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {product.product_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {totalStock}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.variants?.length || 0} variants
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {lowStockVariants.map((variant, index) => (
                            <Chip
                              key={index}
                              label={`${variant.size} ${variant.color}: ${variant.quantity}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={outOfStockVariants.length > 0 ? 'Out of Stock' : 
                                 lowStockVariants.length > 0 ? 'Low Stock' : 'In Stock'}
                          color={outOfStockVariants.length > 0 ? 'error' : 
                                 lowStockVariants.length > 0 ? 'warning' : 'success'}
                          icon={outOfStockVariants.length > 0 ? <TrendingDown /> : 
                                lowStockVariants.length > 0 ? <Warning /> : <TrendingUp />}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Inventory">
                          <IconButton
                            onClick={() => handleEditVariant(product.variants?.[0])}
                            color="primary"
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Quantity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Inventory Quantity</DialogTitle>
        <DialogContent>
          {editingVariant && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Variant: {editingVariant.size} - {editingVariant.color}
              </Typography>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                helperText="Enter the new quantity for this variant"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveVariant}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              '&:hover': {
                backgroundColor: '#FFC107',
              }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard;
















