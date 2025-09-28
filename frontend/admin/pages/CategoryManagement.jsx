import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category,
  Save,
  Cancel,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminCategories();
      setCategories(response.data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      is_active: true,
    });
    setOpenDialog(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    });
    setOpenDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, categoryForm);
        setSuccess('Category updated successfully!');
      } else {
        await apiService.createCategory(categoryForm);
        setSuccess('Category created successfully!');
      }
      setOpenDialog(false);
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory(categoryId);
        setSuccess('Category deleted successfully!');
        await fetchCategories();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCategory}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#F57F17' },
            px: 3,
            py: 1,
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : categories.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: '#757575' }}>
                  No categories found
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                  Create your first category to get started
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: '#FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Category sx={{ color: '#2C2C2C' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
                      {category.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                    {category.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={category.is_active ? 'Active' : 'Inactive'}
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`${category.products_count || 0} products`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditCategory(category)}
                    sx={{ color: '#FFD700' }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteCategory(category.id)}
                    sx={{ color: '#F44336' }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Category Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={categoryForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Status:</Typography>
              <Chip
                label={categoryForm.is_active ? 'Active' : 'Inactive'}
                color={categoryForm.is_active ? 'success' : 'default'}
                onClick={() => handleFormChange('is_active', !categoryForm.is_active)}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
            sx={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              '&:hover': { backgroundColor: '#F57F17' },
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;

