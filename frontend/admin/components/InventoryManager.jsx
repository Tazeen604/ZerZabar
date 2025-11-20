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
  IconButton,
  Button,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Warning,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingVariant, setEditingVariant] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editQuantity, setEditQuantity] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
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

      // Update local state
      setProducts(prev => prev.map(product => ({
        ...product,
        variants: product.variants.map(variant => 
          variant.id === editingVariant.id 
            ? { ...variant, quantity: editQuantity }
            : variant
        )
      })));

      setSuccess('Inventory updated successfully');
      setEditDialogOpen(false);
      setEditingVariant(null);
    } catch (err) {
      console.error('Error updating variant:', err);
      setError('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const getTotalStock = (variants) => {
    return variants.reduce((total, variant) => total + (variant.quantity || 0), 0);
  };

  const getLowStockVariants = (variants) => {
    return variants.filter(variant => (variant.quantity || 0) <= lowStockThreshold);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'error' };
    if (quantity <= lowStockThreshold) return { status: 'Low Stock', color: 'warning' };
    return { status: 'In Stock', color: 'success' };
  };

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Inventory Management
      </Typography>

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

      {/* Low Stock Alert */}
      {products.some(product => getLowStockVariants(product.variants || []).length > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Warning sx={{ mr: 1 }} />
          Some products have low stock variants. Please review and restock.
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => {
          const totalStock = getTotalStock(product.variants || []);
          const lowStockVariants = getLowStockVariants(product.variants || []);
          
          return (
            <Grid item xs={12} key={product.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={`Total Stock: ${totalStock}`}
                        color={totalStock === 0 ? 'error' : totalStock <= lowStockThreshold ? 'warning' : 'success'}
                        variant="outlined"
                      />
                      {lowStockVariants.length > 0 && (
                        <Chip
                          label={`${lowStockVariants.length} Low Stock`}
                          color="warning"
                          icon={<Warning />}
                        />
                      )}
                    </Box>
                  </Box>

                  {product.variants && product.variants.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {product.variants.map((variant) => {
                            const stockStatus = getStockStatus(variant.quantity);
                            return (
                              <TableRow key={variant.id}>
                                <TableCell>{variant.size || '-'}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: variant.color_hex || '#ccc',
                                        borderRadius: '50%',
                                        mr: 1,
                                        border: '1px solid #ddd'
                                      }}
                                    />
                                    {variant.color || '-'}
                                  </Box>
                                </TableCell>
                                <TableCell>{variant.sku || '-'}</TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: stockStatus.color === 'error' ? 'error.main' : 
                                             stockStatus.color === 'warning' ? 'warning.main' : 
                                             'success.main'
                                    }}
                                  >
                                    {variant.quantity || 0}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={stockStatus.status}
                                    color={stockStatus.color}
                                    size="small"
                                    icon={stockStatus.color === 'error' ? <TrendingDown /> : 
                                          stockStatus.color === 'warning' ? <Warning /> : 
                                          <TrendingUp />}
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    onClick={() => handleEditVariant(variant)}
                                    color="primary"
                                    size="small"
                                  >
                                    <Edit />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No variants found for this product.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Quantity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Inventory Quantity</DialogTitle>
        <DialogContent>
          {editingVariant && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Product: {products.find(p => p.variants?.some(v => v.id === editingVariant.id))?.name}
              </Typography>
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

export default InventoryManager;
















