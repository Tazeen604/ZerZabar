import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Inventory,
  Warning,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const ProductVariantManager = ({ productId, onVariantsChange }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    color: '',
    size: '',
    sku: '',
    price: '',
    sale_price: '',
    quantity: 0,
    cost_price: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/admin/products/${productId}/variants`);
      if (response.success) {
        setVariants(response.data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      showSnackbar('Failed to fetch variants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariant = () => {
    setEditingVariant(null);
    setFormData({
      color: '',
      size: '',
      sku: '',
      price: '',
      sale_price: '',
      quantity: 0,
      cost_price: '',
    });
    setOpenDialog(true);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setFormData({
      color: variant.color || '',
      size: variant.size || '',
      sku: variant.sku || '',
      price: variant.price || '',
      sale_price: variant.sale_price || '',
      quantity: variant.quantity || 0,
      cost_price: variant.cost_price || '',
    });
    setOpenDialog(true);
  };

  const handleSaveVariant = async () => {
    try {
      setLoading(true);
      
      if (editingVariant) {
        // Update existing variant
        await apiService.put(`/admin/variants/${editingVariant.id}`, {
          color: formData.color,
          size: formData.size,
          sku: formData.sku,
          price: formData.price,
          sale_price: formData.sale_price,
        });
        showSnackbar('Variant updated successfully', 'success');
      } else {
        // Create new variant
        await apiService.post(`/admin/products/${productId}/variants`, formData);
        showSnackbar('Variant created successfully', 'success');
      }
      
      setOpenDialog(false);
      fetchVariants();
      onVariantsChange && onVariantsChange();
    } catch (error) {
      console.error('Error saving variant:', error);
      showSnackbar('Failed to save variant', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variant) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      try {
        setLoading(true);
        await apiService.delete(`/admin/variants/${variant.id}`);
        showSnackbar('Variant deleted successfully', 'success');
        fetchVariants();
        onVariantsChange && onVariantsChange();
      } catch (error) {
        console.error('Error deleting variant:', error);
        showSnackbar('Failed to delete variant', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdjustInventory = async (variant, adjustment) => {
    try {
      setLoading(true);
      await apiService.post(`/admin/variants/${variant.id}/adjust-inventory`, adjustment);
      showSnackbar('Inventory adjusted successfully', 'success');
      fetchVariants();
      onVariantsChange && onVariantsChange();
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      showSnackbar('Failed to adjust inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStockStatus = (variant) => {
    if (variant.quantity <= 0) return { status: 'out_of_stock', color: 'error', icon: <Cancel /> };
    if (variant.quantity <= 10) return { status: 'low_stock', color: 'warning', icon: <Warning /> };
    return { status: 'in_stock', color: 'success', icon: <CheckCircle /> };
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out_of_stock': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      case 'in_stock': return 'In Stock';
      default: return 'Unknown';
    }
  };

  if (loading && variants.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Product Variants</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateVariant}
          sx={{ backgroundColor: '#1976d2' }}
        >
          Add Variant
        </Button>
      </Box>

      {variants.length === 0 ? (
        <Alert severity="info">
          No variants found. Create variants to manage different sizes, colors, and inventory levels.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant) => {
                const stockStatus = getStockStatus(variant);
                return (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.sku}</TableCell>
                    <TableCell>
                      {variant.color && (
                        <Chip
                          label={variant.color}
                          size="small"
                          sx={{ backgroundColor: variant.color.toLowerCase(), color: 'white' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{variant.size}</TableCell>
                    <TableCell>₨{variant.price}</TableCell>
                    <TableCell>{variant.sale_price ? `₨${variant.sale_price}` : '-'}</TableCell>
                    <TableCell>{variant.quantity}</TableCell>
                    <TableCell>
                      <Chip
                        icon={stockStatus.icon}
                        label={getStockStatusText(stockStatus.status)}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Variant">
                        <IconButton
                          size="small"
                          onClick={() => handleEditVariant(variant)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Variant">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteVariant(variant)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Variant Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVariant ? 'Edit Variant' : 'Create New Variant'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              fullWidth
            />
            <TextField
              label="Size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              fullWidth
            />
            <TextField
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              fullWidth
            />
            <TextField
              label="Sale Price"
              type="number"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              fullWidth
            />
            {!editingVariant && (
              <TextField
                label="Initial Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                fullWidth
                required
              />
            )}
            {!editingVariant && (
              <TextField
                label="Cost Price"
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveVariant}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductVariantManager;

