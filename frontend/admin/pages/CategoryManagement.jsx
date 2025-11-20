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
  CloudUpload,
  Image,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { validateImageFile, formatFileSize, getCategoryImageUrl } from '../../src/utils/categoryUtils';

const CategoryManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('category'); // 'category' or 'subcategory'
  const [editingItem, setEditingItem] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: null,
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

  const validateCategoryForm = () => {
    const errors = {};

    // Category name validation
    if (!categoryForm.name.trim()) {
      errors.name = 'Category name is required';
    } else if (categoryForm.name.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (categoryForm.name.length > 255) {
      errors.name = 'Category name cannot exceed 255 characters';
    }

    // Image validation
    if (!editingItem && !categoryForm.image) {
      errors.image = 'Category image is required';
    } else if (categoryForm.image) {
      const validation = validateImageFile(categoryForm.image);
      if (!validation.isValid) {
        errors.image = validation.error;
      }
    }

    // Description validation
    if (categoryForm.description && categoryForm.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    // Sort order validation
    if (categoryForm.sort_order && (categoryForm.sort_order < 0 || categoryForm.sort_order > 9999)) {
      errors.sort_order = 'Sort order must be between 0 and 9999';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSubcategoryForm = () => {
    const errors = {};

    // Subcategory name validation
    if (!subcategoryForm.name.trim()) {
      errors.name = 'Subcategory name is required';
    } else if (subcategoryForm.name.length < 2) {
      errors.name = 'Subcategory name must be at least 2 characters';
    } else if (subcategoryForm.name.length > 255) {
      errors.name = 'Subcategory name cannot exceed 255 characters';
    }

    // Category validation
    if (!subcategoryForm.category_id) {
      errors.category_id = 'Category is required';
    }

    // Description validation
    if (subcategoryForm.description && subcategoryForm.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCategorySubmit = async () => {
    // Clear previous errors
    setError('');
    setValidationErrors({});

    // Validate form
    if (!validateCategoryForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description || '');
      formData.append('is_active', categoryForm.is_active);
      console.log('🔍 Frontend - is_active value:', categoryForm.is_active, 'type:', typeof categoryForm.is_active);
      formData.append('sort_order', categoryForm.sort_order);
      
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
        console.log('🔍 Frontend - Image file being sent:', {
          name: categoryForm.image.name,
          size: categoryForm.image.size,
          type: categoryForm.image.type
        });
      } else {
        console.log('🔍 Frontend - No image file in form data');
      }

      console.log('🔍 Frontend - FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value, '(type:', typeof value, ')');
      }

      if (editingItem) {
        console.log('🔍 Frontend - Updating category:', editingItem.id);
        await apiService.post(`/admin/categories/${editingItem.id}/update`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Category updated successfully');
      } else {
        console.log('🔍 Frontend - Creating new category');
        await apiService.post('/admin/categories', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Category created successfully');
      }
      
      fetchCategories();
      handleCloseDialog();
    } catch (err) {
      console.error('Category save error:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        setValidationErrors(err.response.data.errors);
        setError('Please fix the validation errors below');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to save category';
        
        if (errorMessage.includes('Duplicate entry') && errorMessage.includes('name')) {
          setError('A category with this name already exists. Please choose a different category name.');
        } else if (errorMessage.includes('SQLSTATE')) {
          setError('Database error occurred. Please contact support if this continues.');
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySubmit = async () => {
    // Clear previous errors
    setError('');
    setValidationErrors({});

    // Validate form
    if (!validateSubcategoryForm()) {
      setError('Please fix the validation errors below');
      return;
    }

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
      console.error('Subcategory save error:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        setValidationErrors(err.response.data.errors);
        setError('Please fix the validation errors below');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to save subcategory';
        
        if (errorMessage.includes('Duplicate entry') && errorMessage.includes('name')) {
          setError('A subcategory with this name already exists. Please choose a different subcategory name.');
        } else if (errorMessage.includes('SQLSTATE')) {
          setError('Database error occurred. Please contact support if this continues.');
        } else {
          setError(errorMessage);
        }
      }
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
        image: null, // Reset image for editing
        is_active: item.is_active,
        sort_order: item.sort_order || 0,
      } : {
        name: '',
        description: '',
        image: null,
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
              error={!!validationErrors.name}
              helperText={validationErrors.name}
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
              error={!!validationErrors.description}
              helperText={validationErrors.description}
            />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Category Image {!editingItem && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="category-image-upload"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const validation = validateImageFile(file);
                          if (!validation.isValid) {
                            setValidationErrors(prev => ({
                              ...prev,
                              image: validation.error
                            }));
                            return;
                          }
                          setCategoryForm({ ...categoryForm, image: file });
                          setValidationErrors(prev => ({
                            ...prev,
                            image: ''
                          }));
                        }
                      }}
                    />
                    <label htmlFor="category-image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                        sx={{
                          border: '2px dashed #ccc',
                          borderRadius: 2,
                          p: 2,
                          width: '100%',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#FFD700',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                          }
                        }}
                      >
                        {categoryForm.image ? 'Change Image' : 'Upload Category Image'}
                      </Button>
                    </label>
                    {/* Show existing image preview when editing */}
                    {editingItem && editingItem.image && !categoryForm.image && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Current Image:
                        </Typography>
                        <Box
                          component="img"
                          src={getCategoryImageUrl(editingItem.image)}
                          alt={editingItem.name}
                          sx={{
                            width: '100%',
                            maxWidth: 300,
                            maxHeight: 200,
                            objectFit: 'contain',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#f5f5f5',
                            p: 1
                          }}
                          onError={(e) => {
                            console.error('Failed to load category image:', editingItem.image);
                            e.target.style.display = 'none';
                          }}
                        />
                      </Box>
                    )}
                    {/* Show new file preview when a new file is selected */}
                    {categoryForm.image && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Image sx={{ color: '#4CAF50' }} />
                        <Typography variant="body2" color="success.main">
                          {categoryForm.image.name} ({formatFileSize(categoryForm.image.size)})
                        </Typography>
                        {categoryForm.image instanceof File && (
                          <Box
                            component="img"
                            src={URL.createObjectURL(categoryForm.image)}
                            alt="Preview"
                            sx={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        )}
                      </Box>
                    )}
                    {editingItem && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Leave empty to keep current image
                      </Typography>
                    )}
                    {validationErrors.image && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {validationErrors.image}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Sort Order"
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) })}
                    error={!!validationErrors.sort_order}
                    helperText={validationErrors.sort_order}
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
                  <FormControl fullWidth required
                    variant="standard"
                    error={!!validationErrors.category_id}
                    sx={{
                      m: 1,
                      minWidth: 200, // wider for full label visibility
                      width: '100%',
                      gap:2
                    }}>
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
                    {validationErrors.category_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {validationErrors.category_id}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subcategory Name"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    cols={6}
                    value={subcategoryForm.description}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
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
