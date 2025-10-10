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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const CategoryManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('category'); // 'category' or 'subcategory'
  const [editingItem, setEditingItem] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    category_id: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/categories');
      console.log('Categories API Response:', response);
      
      // Handle different response structures
      let categoriesData = [];
      if (response.data && response.data.success) {
        categoriesData = response.data.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && response.data.data) {
        categoriesData = response.data.data;
      }
      
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to fetch categories');
      setApiError('Failed to load categories. Please check your connection and try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await apiService.get('/admin/subcategories');
      console.log('Subcategories API Response:', response);
      
      // Handle different response structures
      let subcategoriesData = [];
      if (response.data && response.data.success) {
        subcategoriesData = response.data.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        subcategoriesData = response.data;
      } else if (response.data && response.data.data) {
        subcategoriesData = response.data.data;
      }
      
      setSubcategories(subcategoriesData);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiService.put(`/admin/categories/${editingItem.id}`, categoryForm);
        setSuccess('Category updated successfully');
      } else {
        await apiService.post('/admin/categories', categoryForm);
        setSuccess('Category created successfully');
      }
      
      fetchCategories();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySubmit = async () => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiService.put(`/admin/subcategories/${editingItem.id}`, subcategoryForm);
        setSuccess('Subcategory updated successfully');
      } else {
        await apiService.post('/admin/subcategories', subcategoryForm);
        setSuccess('Subcategory created successfully');
      }
      
      fetchSubcategories();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.delete(`/admin/categories/${id}`);
        setSuccess('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await apiService.delete(`/admin/subcategories/${id}`);
        setSuccess('Subcategory deleted successfully');
        fetchSubcategories();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete subcategory');
      }
    }
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (type === 'category') {
      setCategoryForm(item ? {
        name: item.name,
        description: item.description || '',
        is_active: item.is_active,
        sort_order: item.sort_order || 0,
      } : {
        name: '',
        description: '',
        is_active: true,
        sort_order: 0,
      });
    } else {
      setSubcategoryForm(item ? {
        name: item.name,
        description: item.description || '',
        category_id: item.category_id,
        is_active: item.is_active,
        sort_order: item.sort_order || 0,
      } : {
        name: '',
        description: '',
        category_id: '',
        is_active: true,
        sort_order: 0,
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setDialogType('category');
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getCategorySubcategories = (categoryId) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const renderCategoriesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('category')}
          sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#F57F17' } }}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Subcategories</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories && categories.length > 0 ? (
          categories.map((category) => (
              <React.Fragment key={category.id}>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleCategoryExpansion(category.id)}
                        sx={{ mr: 1 }}
                      >
                        {expandedCategories[category.id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      {category.name}
                  </Box>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.products_count || 0}</TableCell>
                  <TableCell>{category.subcategories_count || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.is_active ? 'Active' : 'Inactive'}
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog('category', category)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCategory(category.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {expandedCategories[category.id] && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Subcategories:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {getCategorySubcategories(category.id).map((sub) => (
                          <Chip
                            key={sub.id}
                            label={sub.name}
                            variant="outlined"
                            size="small"
                            onDelete={() => handleDeleteSubcategory(sub.id)}
                            onClick={() => handleOpenDialog('subcategory', sub)}
                          />
                        ))}
                  <Button
                    size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            setSubcategoryForm(prev => ({ ...prev, category_id: category.id }));
                            handleOpenDialog('subcategory');
                          }}
                        >
                          Add Subcategory
                  </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <EmptyState
                    icon={<Category />}
                    title="No Categories Found"
                    description="No categories have been created yet. Click 'Add Category' to create your first category."
                    size="small"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderSubcategoriesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Subcategories</Typography>
                  <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('subcategory')}
          sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#F57F17' } }}
        >
          Add Subcategory
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcategories && subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
              <TableRow key={subcategory.id}>
                <TableCell>{subcategory.name}</TableCell>
                <TableCell>
                  {categories.find(cat => cat.id === subcategory.category_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>{subcategory.description}</TableCell>
                <TableCell>{subcategory.products_count || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={subcategory.is_active ? 'Active' : 'Inactive'}
                    color={subcategory.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog('subcategory', subcategory)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <EmptyState
                    icon={<Category />}
                    title="No Subcategories Found"
                    description="No subcategories have been created yet. Click 'Add Subcategory' to create your first subcategory."
                    size="small"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (loading && categories.length === 0) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (apiError) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<Category />}
          title="Failed to Load Categories"
          description={apiError}
          actionLabel="Retry"
          onAction={() => {
            setApiError(null);
            setError('');
            fetchCategories();
            fetchSubcategories();
          }}
          variant="error"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#2C2C2C' }}>
        Category Management
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Categories" />
        <Tab label="Subcategories" />
      </Tabs>

      {activeTab === 0 && renderCategoriesTab()}
      {activeTab === 1 && renderSubcategoriesTab()}

      {/* Category/Subcategory Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleCloseDialog();
          }
        }}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit' : 'Add'} {dialogType === 'category' ? 'Category' : 'Subcategory'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'category' ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
                </Grid>
                <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Sort Order"
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={categoryForm.is_active}
                        onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={subcategoryForm.category_id}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category_id: e.target.value })}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subcategory Name"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={subcategoryForm.description}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Sort Order"
                    type="number"
                    value={subcategoryForm.sort_order}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, sort_order: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={subcategoryForm.is_active}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={dialogType === 'category' ? handleCategorySubmit : handleSubcategorySubmit}
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
            sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#F57F17' } }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;
