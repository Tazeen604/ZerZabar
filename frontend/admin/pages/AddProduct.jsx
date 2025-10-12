import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Divider,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Switch,
} from '@mui/material';
import {
  Save,
  Cancel,
  CloudUpload,
  Delete,
  Add,
  Remove,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../src/services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [nextProductId, setNextProductId] = useState('');

  const [productForm, setProductForm] = useState({
    product_id: '',
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    collection: '',
    sku: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    sizes: [],
    colors: [],
    weight: '',
    dimensions: '',
    is_active: true,
    is_featured: false,
  });

  const [images, setImages] = useState([]);
  
  // Predefined size and color options
  const sizeOptions = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    bottoms: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
    shoes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    accessories: ['One Size', 'Standard']
  };

  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Khaki', hex: '#F0E68C' },
    { name: 'Maroon', hex: '#800000' }
  ];

  // Function to get appropriate size type based on category
  const getSizeType = () => {
    if (!productForm.category_id) return 'clothing';
    
    const category = categories.find(cat => cat.id === productForm.category_id);
    if (!category) return 'clothing';
    
    const categoryName = category.name.toLowerCase();
    
    if (categoryName.includes('pant') || categoryName.includes('short') || categoryName.includes('jean')) {
      return 'bottoms';
    } else if (categoryName.includes('accessories') || categoryName.includes('belt') || categoryName.includes('wallet') || categoryName.includes('bag')) {
      return 'accessories';
    } else if (categoryName.includes('shoe') || categoryName.includes('footwear')) {
      return 'shoes';
    } else {
      return 'clothing'; // Default for shirts, t-shirts, jackets, etc.
    }
  };

  // Function to handle size selection
  const handleSizeChange = (size, checked) => {
    setProductForm(prev => ({
      ...prev,
      sizes: checked 
        ? [...prev.sizes, size]
        : prev.sizes.filter(s => s !== size)
    }));
  };

  // Function to handle color selection
  const handleColorChange = (colorName, checked) => {
    setProductForm(prev => ({
      ...prev,
      colors: checked 
        ? [...prev.colors, colorName]
        : prev.colors.filter(c => c !== colorName)
    }));
  };

  useEffect(() => {
    fetchCategories();
    fetchNextProductId();
  }, []);

  // Clear sizes when category changes to show appropriate size options
  useEffect(() => {
    if (productForm.category_id) {
      setProductForm(prev => ({
        ...prev,
        sizes: [] // Clear existing sizes when category changes
      }));
    }
  }, [productForm.category_id]);

  useEffect(() => {
    if (productForm.category_id) {
      fetchSubcategories(productForm.category_id);
    } else {
      setSubcategories([]);
      setProductForm(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [productForm.category_id]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/admin/categories', { paginate: 'false' });
      
      // Handle response structure
      const categoriesData = response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories: ' + (err.message || 'Unknown error'));
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await apiService.get(`/admin/subcategories`, { category_id: categoryId });
      
      // Handle response structure - could be response.data or response.data.data
      const subcategoriesData = response.data?.data || response.data || [];
      
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    }
  };

  const fetchNextProductId = async () => {
    try {
      const response = await apiService.get('/admin/products/next-id');
      console.log('Next ID API Response:', response);
      
      // The API returns { success: true, next_id: "zz-prd-0006" }
      const nextId = response.next_id;
      
      if (nextId) {
        setNextProductId(nextId);
        setProductForm(prev => ({ ...prev, product_id: nextId }));
      } else {
        throw new Error('No next_id in response');
      }
    } catch (err) {
      console.error('Error fetching next product ID:', err);
      // Fallback to default if API fails
      const fallbackId = 'zz-prd-0001';
      setNextProductId(fallbackId);
      setProductForm(prev => ({ ...prev, product_id: fallbackId }));
    }
  };

  const handleInputChange = (field, value) => {
    setProductForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // If category is changed, reset subcategory
      if (field === 'category_id') {
        newForm.subcategory_id = '';
      }
      
      return newForm;
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Product ID validation
    if (!productForm.product_id.trim()) {
      errors.product_id = 'Product ID is required';
    } else if (productForm.product_id.length > 50) {
      errors.product_id = 'Product ID cannot exceed 50 characters';
    }

    // Product name validation
    if (!productForm.name.trim()) {
      errors.name = 'Product name is required';
    } else if (productForm.name.length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    } else if (productForm.name.length > 255) {
      errors.name = 'Product name cannot exceed 255 characters';
    }

    // Description validation
    if (!productForm.description.trim()) {
      errors.description = 'Product description is required';
    } else if (productForm.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (productForm.description.length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    }

    // Category validation
    if (!productForm.category_id) {
      errors.category_id = 'Category is required';
    }

    // SKU validation
    if (!productForm.sku.trim()) {
      errors.sku = 'SKU is required';
    } else if (productForm.sku.length > 100) {
      errors.sku = 'SKU cannot exceed 100 characters';
    }

    // Price validation
    if (!productForm.price || productForm.price <= 0) {
      errors.price = 'Valid price is required';
    } else if (parseFloat(productForm.price) > 999999.99) {
      errors.price = 'Price cannot exceed 999,999.99';
    }

    // Sale price validation
    if (productForm.sale_price) {
      if (parseFloat(productForm.sale_price) < 0) {
        errors.sale_price = 'Sale price cannot be negative';
      } else if (parseFloat(productForm.sale_price) >= parseFloat(productForm.price)) {
        errors.sale_price = 'Sale price must be less than regular price';
      } else if (parseFloat(productForm.sale_price) > 999999.99) {
        errors.sale_price = 'Sale price cannot exceed 999,999.99';
      }
    }

    // Stock quantity validation
    if (!productForm.stock_quantity || productForm.stock_quantity < 0) {
      errors.stock_quantity = 'Valid stock quantity is required';
    } else if (parseInt(productForm.stock_quantity) > 999999) {
      errors.stock_quantity = 'Stock quantity cannot exceed 999,999';
    }

    // Weight validation
    if (productForm.weight && parseFloat(productForm.weight) < 0) {
      errors.weight = 'Weight cannot be negative';
    } else if (productForm.weight && parseFloat(productForm.weight) > 9999.99) {
      errors.weight = 'Weight cannot exceed 9999.99';
    }

    // Dimensions validation
    if (productForm.dimensions && productForm.dimensions.length > 100) {
      errors.dimensions = 'Dimensions cannot exceed 100 characters';
    }

    // Image validation
    if (images.length === 0) {
      errors.images = 'At least one product image is required';
    } else if (images.length > 10) {
      errors.images = 'Cannot upload more than 10 images';
    }

    // Check image sizes
    const oversizedImages = images.filter(img => img.file && img.file.size > 500 * 1024);
    if (oversizedImages.length > 0) {
      errors.images = `${oversizedImages.length} image(s) exceed 500KB limit`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validImages = [];
    const errors = [];

    files.forEach(file => {
      // Check file size (500KB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        errors.push(`${file.name} exceeds 500KB limit (${Math.round(file.size / 1024)}KB)`);
      } else {
        validImages.push({
          file,
          preview: URL.createObjectURL(file),
          id: Date.now() + Math.random()
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(''), 5000);
    }

    if (validImages.length > 0) {
      setImages(prev => [...prev, ...validImages]);
      // Clear image validation error if exists
      if (validationErrors.images) {
        setValidationErrors(prev => ({
          ...prev,
          images: ''
        }));
      }
    }
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };


  const handleSubmit = async () => {
    // Clear previous errors
    setError('');
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add product data
      Object.keys(productForm).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formData.append(key, JSON.stringify(productForm[key]));
        } else {
          formData.append(key, productForm[key]);
        }
      });

      // Add images
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image.file);
      });

      await apiService.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Product created successfully');
      setTimeout(() => {
        navigate('/admin/product-management');
      }, 2000);
    } catch (err) {
      console.error('Product creation error:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        setValidationErrors(err.response.data.errors);
        setError('Please fix the validation errors below');
      } else {
        // Handle specific database errors
        const errorMessage = err.message || err.response?.data?.message || 'Failed to create product';
        
        if (errorMessage.includes('Duplicate entry') && errorMessage.includes('slug_unique')) {
          setError('A product with a similar name already exists. Please choose a different product name.');
        } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('sku')) {
          setError('This SKU already exists. Please choose a different SKU.');
        } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('product_id')) {
          setError('This Product ID already exists. Please try again.');
        } else if (errorMessage.includes('Integrity constraint violation')) {
          setError('There was a data conflict. Please check your input and try again.');
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

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C2C2C' }}>
          Add Product
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/product-management')}
            startIcon={<Cancel />}
            sx={{ borderColor: '#ddd', color: '#666' }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#F57F17' } }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Error Bar */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Success Bar */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Product Details */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Product Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product ID"
                    value={productForm.product_id}
                    disabled
                    helperText="Auto-generated product identifier"
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#2C2C2C',
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SKU"
                    placeholder="Enter SKU"
                    value={productForm.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    error={!!validationErrors.sku}
                    helperText={validationErrors.sku}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    placeholder="Enter product name"
                    value={productForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    required
                  />
                </Grid>

                <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!validationErrors.category_id} 
                  variant="standard"
                  sx={{
                    m: 1,
                    minWidth: 200, // wider for full label visibility
                    width: '100%',
                  }}>
                    <InputLabel>Category</InputLabel>

                    <Select
                      value={productForm.category_id}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
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
                </Grid>
          


                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth
                  variant="standard"
                  sx={{
                    m: 1,
                    minWidth: 200, // wider for full label visibility
                    width: '100%',
                  }}>
               
                    <Select
                      value={productForm.subcategory_id}
                      onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                      label="Subcategory (Optional)"
                      disabled={!productForm.category_id}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <span style={{ color: '#999' }}>
                            {!productForm.category_id ? 'Select category first' : 'Select subcategory (optional)'}
                          </span>;
                        }
                        const subcategory = subcategories.find(sub => sub.id === selected);
                        return subcategory ? subcategory.name : '';
                      }}
                    >
                      <MenuItem value="">
                        <em>No subcategory</em>
                      </MenuItem>
                      {subcategories.map((subcategory) => (
                        <MenuItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth
                  variant="standard"
                  sx={{
                    m: 1,
                    minWidth: 200,
                    width: '100%',
                  }}>
                    <InputLabel>Collection (Optional)</InputLabel>
                    <Select
                      value={productForm.collection}
                      onChange={(e) => handleInputChange('collection', e.target.value)}
                      label="Collection (Optional)"
                    >
                      <MenuItem value="">
                        <em>No collection</em>
                      </MenuItem>
                      <MenuItem value="Winter">Winter Collection</MenuItem>
                      <MenuItem value="Summer">Summer Collection</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
 
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Enter product description"
                    multiline
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Inventory and Pricing */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Inventory and Pricing
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Selling Price"
                    placeholder="Enter selling price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    error={!!validationErrors.price}
                    helperText={validationErrors.price}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sale Price"
                    placeholder="Enter sale price (optional)"
                    type="number"
                    value={productForm.sale_price}
                    onChange={(e) => handleInputChange('sale_price', e.target.value)}
                    error={!!validationErrors.sale_price}
                    helperText={validationErrors.sale_price}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    placeholder="Enter product quantity"
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    error={!!validationErrors.stock_quantity}
                    helperText={validationErrors.stock_quantity}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    placeholder="Enter weight"
                    type="number"
                    value={productForm.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Available Sizes
              </Typography>
              
              {productForm.category_id ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                    Select available sizes for this {getSizeType()} product:
                  </Typography>
                  
                  <FormGroup>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {sizeOptions[getSizeType()].map((size) => (
                        <FormControlLabel
                          key={size}
                          control={
                            <Checkbox
                              checked={productForm.sizes.includes(size)}
                              onChange={(e) => handleSizeChange(size, e.target.checked)}
                              sx={{
                                color: '#FFD700',
                                '&.Mui-checked': {
                                  color: '#FFD700',
                                },
                              }}
                            />
                          }
                          label={size}
                          sx={{
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            margin: 0.5,
                            px: 1,
                            backgroundColor: productForm.sizes.includes(size) ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 215, 0, 0.05)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </FormGroup>

                  {productForm.sizes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Selected sizes: {productForm.sizes.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Please select a category first to see available sizes.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Available Colors
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                Select available colors for this product:
              </Typography>
              
              <FormGroup>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {colorOptions.map((color) => (
                    <FormControlLabel
                      key={color.name}
                      control={
                        <Checkbox
                          checked={productForm.colors.includes(color.name)}
                          onChange={(e) => handleColorChange(color.name, e.target.checked)}
                          sx={{
                            color: '#FFD700',
                            '&.Mui-checked': {
                              color: '#FFD700',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: color.hex,
                              borderRadius: '50%',
                              border: '1px solid #ddd',
                            }}
                          />
                          <Typography variant="body2">{color.name}</Typography>
                        </Box>
                      }
                      sx={{
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        margin: 0.5,
                        px: 1,
                        backgroundColor: productForm.colors.includes(color.name) ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.05)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </FormGroup>

              {productForm.colors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected colors: {productForm.colors.join(', ')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Product Images */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Product Images
              </Typography>

              {validationErrors.images && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationErrors.images}
                </Alert>
              )}

              <Box
                sx={{
                  border: '2px dashed #ddd',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#FFD700' },
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <CloudUpload sx={{ fontSize: 48, color: '#ddd', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Drop your images here, or{' '}
                  <span style={{ color: '#FFD700', textDecoration: 'underline' }}>
                    click to browse
                  </span>
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Upload high-quality images (max 500KB each). At least one image is required.
                </Typography>
              </Box>

              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              <Grid container spacing={2}>
                {images.map((image) => (
                  <Grid item xs={6} key={image.id}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={image.preview}
                        alt="Product"
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                        }}
                        size="small"
                        onClick={() => removeImage(image.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Product Status */}
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Product Status
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active Product"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Featured Product"
                />
              </Box>
            </CardContent>
            <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#F57F17' } ,mb:2}}
          >
            Save Product
          </Button>
          </Card>
        </Grid>
      </Grid>

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

export default AddProduct;
