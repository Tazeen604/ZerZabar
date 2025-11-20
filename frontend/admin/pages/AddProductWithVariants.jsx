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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save,
  Cancel,
  CloudUpload,
  Delete,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../src/services/api';
import ProductVariantManager from '../components/ProductVariantManager';

const AddProductWithVariants = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [productForm, setProductForm] = useState({
    product_id: '',
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    collection: '',
    price: '',
    sale_price: '',
    weight: '',
    dimensions: '',
    is_active: true,
    is_featured: false,
  });

  const [variants, setVariants] = useState([]);
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
    if (categoryName.includes('pant') || categoryName.includes('jean') || categoryName.includes('short')) {
      return 'bottoms';
    } else if (categoryName.includes('shoe') || categoryName.includes('sneaker')) {
      return 'shoes';
    } else if (categoryName.includes('accessory') || categoryName.includes('bag') || categoryName.includes('hat')) {
      return 'accessories';
    }
    return 'clothing';
  };

  const getAvailableSizes = () => {
    return sizeOptions[getSizeType()] || sizeOptions.clothing;
  };

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          apiService.getCategories(),
          apiService.getSubcategories()
        ]);
        
        setCategories(categoriesRes.data || []);
        setSubcategories(subcategoriesRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load categories and subcategories');
      }
    };

    fetchData();
  }, []);

  // No longer auto-generating Product ID - admin will enter it manually
  useEffect(() => {
    console.log('🔍 Product ID will be entered manually by admin');
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

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newImages;
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!productForm.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!productForm.category_id) {
      errors.category_id = 'Category is required';
    }
    if (!productForm.price || productForm.price <= 0) {
      errors.price = 'Valid price is required';
    }
    if (productForm.sale_price && productForm.sale_price >= productForm.price) {
      errors.sale_price = 'Sale price must be less than regular price';
    }
    if (!productForm.description.trim()) {
      errors.description = 'Description is required';
    }

    // Validate variants
    if (variants.length === 0) {
      errors.variants = 'At least one variant is required';
    } else {
      const duplicatePairs = new Set();
      const seenPairs = new Set();
      
      variants.forEach((variant, index) => {
        if (!variant.size.trim()) {
          errors[`variant_${index}_size`] = 'Size is required';
        }
        if (!variant.color.trim()) {
          errors[`variant_${index}_color`] = 'Color is required';
        }
        if (variant.quantity < 0) {
          errors[`variant_${index}_quantity`] = 'Quantity must be 0 or greater';
        }
        
        const pair = `${variant.size}-${variant.color}`;
        if (variant.size && variant.color) {
          if (seenPairs.has(pair)) {
            duplicatePairs.add(pair);
          } else {
            seenPairs.add(pair);
          }
        }
      });
      
      if (duplicatePairs.size > 0) {
        errors.variants = `Duplicate size-color combinations: ${Array.from(duplicatePairs).join(', ')}`;
      }
    }

    // Validate images
    if (images.length === 0) {
      errors.images = 'At least one image is required';
    } else if (images.length > 5) {
      errors.images = 'Cannot upload more than 5 images';
    }

    // Check image sizes
    const oversizedImages = images.filter(img => img.file && img.file.size > 500 * 1024);
    if (oversizedImages.length > 0) {
      errors.images = `${oversizedImages.length} image(s) exceed 500KB limit`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add product data
      Object.keys(productForm).forEach(key => {
        formData.append(key, productForm[key]);
      });
      
      // Add variants as JSON string
      formData.append('variants', JSON.stringify(variants));
      
      // Add images
      images.forEach((imageObj, index) => {
        if (imageObj.file) {
          formData.append(`images[${index}]`, imageObj.file);
        }
      });

      console.log('🔍 Frontend - FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value, '(type:', typeof value, ')');
      }

      await apiService.post('/admin/products/with-variants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Product created successfully');
      setTimeout(() => {
        navigate('/admin/product-management');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating product:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = '';
      const errorData = err.response?.data;
      const fieldErrors = {};
      
      // Handle validation errors from backend (Laravel format)
      if (errorData?.errors) {
        const validationErrors = errorData.errors;
        
        // Map backend validation errors to form fields
        Object.keys(validationErrors).forEach(field => {
          const fieldMessages = validationErrors[field];
          if (Array.isArray(fieldMessages) && fieldMessages.length > 0) {
            const errorMsg = fieldMessages[0];
            
            // Check for duplicate product ID
            if (field === 'product_id' || field === 'id') {
              if (errorMsg.toLowerCase().includes('already exists') || 
                  errorMsg.toLowerCase().includes('unique') ||
                  errorMsg.toLowerCase().includes('duplicate')) {
                fieldErrors.product_id = 'This Product ID already exists';
              } else {
                fieldErrors.product_id = errorMsg;
              }
            }
            // Check for duplicate product name
            else if (field === 'name') {
              if (errorMsg.toLowerCase().includes('already exists') || 
                  errorMsg.toLowerCase().includes('unique') ||
                  errorMsg.toLowerCase().includes('duplicate')) {
                fieldErrors.name = 'This product name already exists';
              } else {
                fieldErrors.name = errorMsg;
              }
            }
            // Other fields
            else {
              fieldErrors[field] = errorMsg;
            }
          }
        });
        
        // Update validation errors state for inline display
        setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        
        // Create user-friendly summary message
        const errorMessages = [];
        if (fieldErrors.product_id) {
          errorMessages.push(`Product ID: ${fieldErrors.product_id}`);
        }
        if (fieldErrors.name) {
          errorMessages.push(`Product Name: ${fieldErrors.name}`);
        }
        if (fieldErrors.category_id) {
          errorMessages.push(`Category: ${fieldErrors.category_id}`);
        }
        if (fieldErrors.description) {
          errorMessages.push(`Description: ${fieldErrors.description}`);
        }
        if (fieldErrors.variants) {
          errorMessages.push(`Variants: ${fieldErrors.variants}`);
        }
        if (fieldErrors.images) {
          errorMessages.push(`Images: ${fieldErrors.images}`);
        }
        
        errorMessage = errorMessages.length > 0 
          ? `Please fix the following errors:\n${errorMessages.join('\n')}`
          : 'Please fix the validation errors below.';
      } 
      // Handle error message string (fallback)
      else if (errorData?.message) {
        const message = errorData.message.toLowerCase();
        
        // Check for duplicate product ID
        if (message.includes('product_id') || message.includes('product id') || 
            (message.includes('duplicate') && (message.includes('product_id') || message.includes('product id'))) ||
            message.includes('this product id already exists')) {
          fieldErrors.product_id = 'This Product ID already exists';
          errorMessage = `Product ID "${productForm.product_id}" already exists. Please use a different Product ID.`;
        }
        // Check for duplicate product name
        else if ((message.includes('name') && (message.includes('duplicate') || message.includes('already exists') || message.includes('unique'))) ||
                 message.includes('a product with this name already exists')) {
          fieldErrors.name = 'This product name already exists';
          errorMessage = `Product name "${productForm.name}" already exists. Please use a different product name.`;
        }
        // Check for duplicate SKU
        else if (message.includes('sku') && (message.includes('duplicate') || message.includes('already exists'))) {
          fieldErrors.variants = 'Duplicate SKU found. Please use unique SKUs for each variant.';
          errorMessage = 'One or more variant SKUs already exist. Please use different SKUs.';
        }
        // Generic error message
        else {
          errorMessage = errorData.message;
        }
        
        // Update validation errors state for inline display
        if (Object.keys(fieldErrors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        }
      }
      
      // If no specific error message, use generic one
      if (!errorMessage) {
        errorMessage = 'Failed to create product. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/product-management');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Add New Product
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

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={productForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={!!validationErrors.name}
                      helperText={validationErrors.name}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product ID"
                      value={productForm.product_id}
                      disabled
                      helperText="Auto-generated"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth error={!!validationErrors.category_id}>
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
                    </FormControl>
                    {validationErrors.category_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {validationErrors.category_id}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth>
                      <InputLabel>Subcategory</InputLabel>
                      <Select
                        value={productForm.subcategory_id}
                        onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                        label="Subcategory"
                      >
                        {subcategories
                          .filter(sub => sub.category_id === productForm.category_id)
                          .map((subcategory) => (
                            <MenuItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth>
                      <InputLabel>Collection</InputLabel>
                      <Select
                        value={productForm.collection}
                        onChange={(e) => handleInputChange('collection', e.target.value)}
                        label="Collection"
                      >
                        <MenuItem value="Winter">Winter</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                        <MenuItem value="All Season">All Season</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
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
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Pricing
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Regular Price"
                      value={productForm.price}
                      onChange={(e) => handleInputChange('price', Math.round(parseFloat(e.target.value)) || '')}
                      error={!!validationErrors.price}
                      helperText={validationErrors.price}
                      inputProps={{ min: 0, step: 0.01 }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Sale Price"
                      value={productForm.sale_price}
                      onChange={(e) => handleInputChange('sale_price', Math.round(parseFloat(e.target.value)) || '')}
                      error={!!validationErrors.sale_price}
                      helperText={validationErrors.sale_price}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Variants */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <ProductVariantManager
                  variants={variants}
                  onVariantsChange={setVariants}
                  availableSizes={getAvailableSizes()}
                  availableColors={colorOptions}
                  validationErrors={validationErrors}
                />
                {validationErrors.variants && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validationErrors.variants}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Product Images
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    multiple
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        }
                      }}
                    >
                      Upload Images
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Maximum 5 images, 500KB each
                  </Typography>
                </Box>

                {images.length > 0 && (
                  <Grid container spacing={2}>
                    {images.map((imageObj, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Paper sx={{ p: 1, position: 'relative' }}>
                          <img
                            src={imageObj.preview}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                            {imageObj.name}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {validationErrors.images && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validationErrors.images}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Additional Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      value={productForm.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Dimensions (L x W x H)"
                      value={productForm.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      placeholder="e.g., 10 x 5 x 2"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_featured}
                          onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                        />
                      }
                      label="Featured"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#FFC107',
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </Box>
  );
};

export default AddProductWithVariants;
