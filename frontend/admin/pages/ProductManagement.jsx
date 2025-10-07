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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Image as ImageIcon,
  Category,
  Inventory,
  AttachMoney,
  Search,
  FilterList,
  CloudUpload,
  Undo,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../src/services/api';
import { getProductImageUrl, getImageUrl } from '../../src/utils/imageUtils';

// Standard size options for ecommerce
const SIZE_OPTIONS = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  bottoms: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
  shoes: ['6', '7', '8', '9', '10', '11', '12', '13'],
  accessories: ['Standard Size', 'One Size', 'Small', 'Medium', 'Large']
};

// Standard color options with hex codes
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Cream', hex: '#F5F5DC' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Khaki', hex: '#F0E68C' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Forest Green', hex: '#228B22' }
];

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    category_id: '',
    subcategory_id: '',
    attributes: {},
    sizes: [],
    colors: [],
    is_active: true,
    is_featured: false,
    images: [],
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [originalProductData, setOriginalProductData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sizeCategory, setSizeCategory] = useState('clothing');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category_id: selectedCategory,
        per_page: rowsPerPage,
        page: page + 1,
      };
      console.log('Fetching products with params:', params);
      const response = await apiService.getAdminProducts(params);
      console.log('Products response:', response);
      const productsData = response.data || [];
      console.log('Products data:', productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Try both paginated and non-paginated endpoints
      const response = await apiService.getAdminCategories({ paginate: false });
      console.log('Categories response:', response);
      
      // Handle different response structures
      let categoriesData = [];
      if (response.data?.data) {
        // Paginated response
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        categoriesData = response.data;
      } else if (response.data?.categories) {
        // Alternative structure
        categoriesData = response.data.categories;
      }
      
      console.log('Categories data:', categoriesData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      if (!categoryId) {
        setSubcategories([]);
        return;
      }
      
      // First check if category exists
      const categoryExists = categories.find(cat => cat.id === categoryId);
      if (!categoryExists) {
        console.warn('Category not found for subcategory fetch:', categoryId);
        setSubcategories([]);
        return;
      }
      
      const response = await apiService.get(`/admin/subcategories?category_id=${categoryId}`);
      console.log('Subcategories response:', response);
      
      // Handle different response structures
      let subcategoriesData = [];
      if (response.data?.data) {
        subcategoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        subcategoriesData = response.data;
      } else if (response.data?.subcategories) {
        subcategoriesData = response.data.subcategories;
      }
      
      console.log('Subcategories data:', subcategoriesData);
      const subcategoriesArray = Array.isArray(subcategoriesData) ? subcategoriesData : [];
      setSubcategories(subcategoriesArray);
      
      // If we have a selected subcategory, check if it belongs to the current category
      if (productForm.subcategory_id && subcategoriesArray.length > 0) {
        const subcategoryExists = subcategoriesArray.find(sub => sub.id === productForm.subcategory_id);
        if (!subcategoryExists) {
          // Clear the subcategory if it doesn't belong to the current category
          setProductForm(prev => ({
            ...prev,
            subcategory_id: ''
          }));
          console.warn('Selected subcategory does not belong to current category, clearing subcategory');
        }
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      sku: '',
      price: '',
      sale_price: '',
      stock_quantity: '',
      category_id: '',
      subcategory_id: '',
      attributes: {},
      sizes: [],
      colors: [],
      is_active: true,
      is_featured: false,
      images: [],
    });
    setSelectedImages([]);
    setSelectedSizes([]); // Reset selected sizes
    setSelectedColors([]); // Reset selected colors
    setSizeCategory('clothing'); // Reset size category
    setFormErrors({});
    setOpenDialog(true);
  };



  const handleEditProduct = (product) => {
    console.log('Editing product:', product);
    console.log('Product category_id:', product.category_id, typeof product.category_id);
    console.log('Product sizes:', product.sizes, typeof product.sizes);
    console.log('Product colors:', product.colors, typeof product.colors);
    console.log('Product images:', product.images, typeof product.images);
    
    setEditingProduct(product);
    setOriginalProductData(product); // Store original data for undo functionality
    
    // Ensure category_id is a number
    const categoryId = product.category_id ? parseInt(product.category_id) : '';
    const subcategoryId = product.subcategory_id ? parseInt(product.subcategory_id) : '';
    
    setProductForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price,
      sale_price: product.sale_price || '',
      stock_quantity: product.stock_quantity,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      attributes: product.attributes || {},
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_active: product.is_active,
      is_featured: product.is_featured,
      images: product.images || [],
    });
    setImagesToDelete([]); // Reset deleted images
    setSelectedImages([]); // Reset new images
    // Ensure sizes and colors are arrays
    const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
    const productColors = Array.isArray(product.colors) ? product.colors : [];
    
    setSelectedSizes(productSizes); // Set selected sizes
    setSelectedColors(productColors); // Set selected colors
    
    // Fetch subcategories for the selected category
    if (categoryId) {
      fetchSubcategories(categoryId);
    }
    
    setOpenDialog(true);
  };

  const handleSaveProduct = async () => {
    // Clear previous errors
    setFormErrors({});
    
    console.log('Form data before validation:', productForm);
    console.log('Selected images:', selectedImages);
    console.log('Editing product:', editingProduct);
    
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed');
      setError('Please fix all validation errors before saving');
      return;
    }
    
    console.log('Form validation passed');
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add product data - convert boolean values properly
      formData.append('name', productForm.name.trim());
      formData.append('description', productForm.description.trim());
      formData.append('sku', productForm.sku.trim());
      formData.append('price', parseFloat(productForm.price));
      // Only append sale_price if it has a value
      if (productForm.sale_price && productForm.sale_price !== '') {
        formData.append('sale_price', parseFloat(productForm.sale_price));
      }
      formData.append('stock_quantity', parseInt(productForm.stock_quantity));
      formData.append('category_id', productForm.category_id);
      if (productForm.subcategory_id) {
        formData.append('subcategory_id', productForm.subcategory_id);
      }
      formData.append('is_active', productForm.is_active ? '1' : '0');
      formData.append('is_featured', productForm.is_featured ? '1' : '0');
      
      // Debug: Log form data
      console.log('=== PRODUCT UPDATE DEBUG ===');
      console.log('Product Form:', productForm);
      console.log('Selected Images:', selectedImages);
      console.log('Images to Delete:', imagesToDelete);
      console.log('Editing Product ID:', editingProduct?.id);
      console.log('Form Data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('=== END DEBUG ===');
      
      // Add attributes as JSON string
      if (productForm.attributes && Object.keys(productForm.attributes).length > 0) {
        formData.append('attributes', JSON.stringify(productForm.attributes));
      }

      // Add sizes as JSON string - ensure it's an array
      const sizesArray = Array.isArray(productForm.sizes) ? productForm.sizes : [];
      if (sizesArray.length > 0) {
        formData.append('sizes', JSON.stringify(sizesArray));
      }

      // Add colors as JSON string - ensure it's an array
      const colorsArray = Array.isArray(productForm.colors) ? productForm.colors : [];
      if (colorsArray.length > 0) {
        formData.append('colors', JSON.stringify(colorsArray));
      }

      // Add images to delete for updates
      if (editingProduct && imagesToDelete.length > 0) {
        formData.append('images_to_delete', JSON.stringify(imagesToDelete));
      }
      
      // Add images - only send new images for updates, all images for new products
      if (editingProduct) {
        // For updates, only send new images if any are selected
        if (selectedImages.length > 0) {
          selectedImages.forEach((image, index) => {
            formData.append('images[]', image);
          });
        }
      } else {
        // For new products, send all selected images
        selectedImages.forEach((image, index) => {
          formData.append('images[]', image);
        });
      }
      
      if (editingProduct) {
        console.log('Updating product with ID:', editingProduct.id);
        console.log('Form data for update:', formData);
        const response = await apiService.updateAdminProduct(editingProduct.id, formData);
        console.log('Update response:', response);
        
        if (response.success) {
          setSuccess('Product updated successfully!');
        } else {
          throw new Error(response.message || 'Failed to update product');
        }
      } else {
        console.log('Creating new product');
        const response = await apiService.createAdminProduct(formData);
        console.log('Create response:', response);
        
        if (response.success) {
          setSuccess('Product created successfully!');
        } else {
          throw new Error(response.message || 'Failed to create product');
        }
      }
      setOpenDialog(false);
      setSelectedImages([]);
      setImagesToDelete([]);
      setFormErrors({});
      // Refresh products list immediately
      await fetchProducts();
    } catch (err) {
      console.error('Product creation error:', err);
      
      // Try to parse error message for validation errors
      let errorMessage = err.message;
      try {
        if (err.message.includes('422')) {
          errorMessage = 'Validation failed. Please check all fields and try again.';
        }
      } catch (parseErr) {
        console.error('Error parsing error message:', parseErr);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteAdminProduct(productId);
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const undoDeleteImage = (imageId) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
    // Restore the image from original product data
    if (originalProductData && originalProductData.images) {
      const originalImage = originalProductData.images.find(img => img.id === imageId);
      if (originalImage) {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, originalImage]
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validations with user-friendly messages
    if (!productForm.name.trim()) {
      errors.name = '📝 Please enter a product name';
    } else if (productForm.name.trim().length < 3) {
      errors.name = '📝 Product name should be at least 3 characters long';
    } else if (productForm.name.trim().length > 100) {
      errors.name = '📝 Product name should not exceed 100 characters';
    }
    
    if (!productForm.description.trim()) {
      errors.description = '📄 Please provide a product description';
    } else if (productForm.description.trim().length < 10) {
      errors.description = '📄 Description should be at least 10 characters to be meaningful';
    } else if (productForm.description.trim().length > 1000) {
      errors.description = '📄 Description should not exceed 1000 characters';
    }
    
    if (!productForm.sku.trim()) {
      errors.sku = '🏷️ Please enter a SKU (Stock Keeping Unit)';
    } else if (productForm.sku.trim().length < 3) {
      errors.sku = '🏷️ SKU should be at least 3 characters long';
    } else if (productForm.sku.trim().length > 50) {
      errors.sku = '🏷️ SKU should not exceed 50 characters';
    }
    
    if (!productForm.price || productForm.price <= 0) {
      errors.price = '💰 Please enter a valid price (must be greater than 0)';
    } else if (isNaN(productForm.price)) {
      errors.price = '💰 Price must be a valid number';
    } else if (productForm.price > 1000000) {
      errors.price = '💰 Price seems too high. Please verify the amount';
    }
    
    if (productForm.sale_price && productForm.sale_price > 0) {
      if (parseFloat(productForm.sale_price) >= parseFloat(productForm.price)) {
        errors.sale_price = '🏷️ Sale price must be less than regular price to offer a discount';
      } else if (parseFloat(productForm.sale_price) <= 0) {
        errors.sale_price = '🏷️ Sale price must be greater than 0';
      }
    }
    
    if (productForm.stock_quantity === '' || productForm.stock_quantity === null || productForm.stock_quantity === undefined) {
      errors.stock_quantity = '📦 Please enter the stock quantity';
    } else if (isNaN(productForm.stock_quantity)) {
      errors.stock_quantity = '📦 Stock quantity must be a valid number';
    } else if (productForm.stock_quantity < 0) {
      errors.stock_quantity = '📦 Stock quantity cannot be negative';
    } else if (productForm.stock_quantity > 100000) {
      errors.stock_quantity = '📦 Stock quantity seems too high. Please verify';
    }
    
    if (!productForm.category_id) {
      errors.category_id = '📂 Please select a category for this product';
    }
    
    // Subcategory validation - only if a subcategory is selected, ensure category is also selected
    if (productForm.subcategory_id && !productForm.category_id) {
      errors.subcategory_id = '📂 Please select a category first before selecting a subcategory';
    }
    
    // Image validation - handle existing images for updates
    const remainingExistingImages = editingProduct ? 
      (productForm.images?.length || 0) : 0;
    const totalImages = remainingExistingImages + selectedImages.length;
    
    if (!editingProduct && selectedImages.length === 0) {
      errors.images = '📸 Please upload at least one product image';
    } else if (editingProduct && totalImages === 0) {
      errors.images = '📸 Product must have at least one image';
    } else if (totalImages > 5) {
      errors.images = '📸 You can have maximum 5 images total. Please remove some images';
    }
    
    // Validate image file types and sizes
    selectedImages.forEach((image, index) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(image.type)) {
        errors[`image_${index}`] = `📸 Image ${index + 1}: Please use JPEG, PNG, or GIF format only`;
      }
      if (image.size > 2 * 1024 * 1024) { // 2MB limit
        errors[`image_${index}`] = `📸 Image ${index + 1}: File size must be less than 2MB for better performance`;
      }
    });
    
    console.log('Validation errors:', errors);
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Real-time validation helper
  const handleFieldChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Handle category change - fetch subcategories and reset subcategory selection
    if (field === 'category_id') {
      fetchSubcategories(value);
      // Reset subcategory when category changes
      setProductForm(prev => ({
        ...prev,
        subcategory_id: ''
      }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Real-time validation for better UX
    if (field === 'name' && value.trim().length > 0 && value.trim().length < 3) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '📝 Product name should be at least 3 characters long'
      }));
    } else if (field === 'description' && value.trim().length > 0 && value.trim().length < 10) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '📄 Description should be at least 10 characters to be meaningful'
      }));
    } else if (field === 'price' && parseFloat(value) > 0 && parseFloat(value) > 1000000) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '💰 Price seems too high. Please verify the amount'
      }));
    } else if (field === 'sale_price' && parseFloat(value) > 0 && productForm.price && parseFloat(value) >= parseFloat(productForm.price)) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '🏷️ Sale price must be less than regular price to offer a discount'
      }));
    }
  };

  // Handle size selection
  const handleSizeChange = (size) => {
    setSelectedSizes(prev => {
      const currentSizes = Array.isArray(prev) ? prev : [];
      const newSizes = currentSizes.includes(size) 
        ? currentSizes.filter(s => s !== size)
        : [...currentSizes, size];
      
      // Update product form
      handleFieldChange('sizes', newSizes);
      return newSizes;
    });
  };

  // Handle color selection
  const handleColorChange = (color) => {
    setSelectedColors(prev => {
      const currentColors = Array.isArray(prev) ? prev : [];
      const newColors = currentColors.includes(color) 
        ? currentColors.filter(c => c !== color)
        : [...currentColors, color];
      
      // Update product form
      handleFieldChange('colors', newColors);
      return newColors;
    });
  };

  // Handle size category change
  const handleSizeCategoryChange = (category) => {
    setSizeCategory(category);
    // Clear selected sizes when category changes
    setSelectedSizes([]);
    handleFieldChange('sizes', []);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchProducts();
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchProducts();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'out_of_stock': return 'error';
      case 'low_stock': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/add-product')}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#F57F17' },
            px: 3,
            py: 1,
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Products" />
          <Tab label="Inventory" />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: '#757575', mr: 1 }} />,
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {(Array.isArray(categories) ? categories : []).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Products Table */}
      {tabValue === 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !products || products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" sx={{ color: '#757575' }}>
                        No products found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(products) ? products : []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={getProductImageUrl(product.images)}
                            sx={{ width: 50, height: 50 }}
                          >
                            <ImageIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#757575' }}>
                              {product.description?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {product.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.category?.name || 'Uncategorized'}
                          size="small"
                          icon={<Category />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            ₨{product.sale_price ? product.sale_price : product.price}
                          </Typography>
                          {product.sale_price && (
                            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#757575' }}>
                              ₨{product.price}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory sx={{ fontSize: 16, color: '#757575' }} />
                          <Typography variant="body2">
                            {product.stock_quantity}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(product.stock_status)}
                          color={getStatusColor(product.stock_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditProduct(product)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteProduct(product.id)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={products?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      )}


      {/* Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setOpenDialog(false);
          }
        }}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.sku}
                onChange={(e) => handleFieldChange('sku', e.target.value)}
                error={!!formErrors.sku}
                helperText={formErrors.sku}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (PKR)"
                type="number"
                value={productForm.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                error={!!formErrors.price}
                helperText={formErrors.price || "Enter price in Pakistani Rupees"}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sale Price (PKR)"
                type="number"
                value={productForm.sale_price}
                onChange={(e) => handleFieldChange('sale_price', e.target.value)}
                error={!!formErrors.sale_price}
                helperText={formErrors.sale_price || "Enter sale price in Pakistani Rupees (optional)"}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) => handleFieldChange('stock_quantity', e.target.value)}
                error={!!formErrors.stock_quantity}
                helperText={formErrors.stock_quantity}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.category_id}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.category_id}
                  label="Category"
                  onChange={(e) => handleFieldChange('category_id', e.target.value)}
                  required
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    {categories.length === 0 ? 'No categories available' : 'Select a category'}
                  </MenuItem>
                  {(Array.isArray(categories) ? categories : []).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.category_id}
                  </Typography>
                )}
                
                {/* Current Category Display */}
                <Box sx={{ mt: 2 }}>
                  {productForm.category_id ? (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: 1,
                      border: '1px solid #4CAF50'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Selected Category:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        {categories.find(c => c.id === productForm.category_id)?.name || 'Unknown Category'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 1,
                      border: '1px dashed #ccc'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {categories.length === 0 
                          ? '📂 No categories available in the system' 
                          : '📂 No category selected for this product'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {categories.length === 0 
                          ? 'Please add categories first in Category Management' 
                          : 'Select a category from the dropdown above'
                        }
                      </Typography>
                    </Box>
                  )}
                </Box>
              </FormControl>
            </Grid>
            
            {/* Subcategory Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.subcategory_id}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={productForm.subcategory_id}
                  label="Subcategory"
                  onChange={(e) => handleFieldChange('subcategory_id', e.target.value)}
                  disabled={!productForm.category_id}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    {!productForm.category_id 
                      ? 'Please select a category first' 
                      : subcategories.length === 0 
                        ? 'No subcategories available for this category' 
                        : 'Select a subcategory (optional)'
                    }
                  </MenuItem>
                  {(Array.isArray(subcategories) ? subcategories : []).map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.subcategory_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.subcategory_id}
                  </Typography>
                )}
                
                {/* Current Subcategory Display */}
                <Box sx={{ mt: 2 }}>
                  {productForm.subcategory_id ? (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: '#e3f2fd', 
                      borderRadius: 1,
                      border: '1px solid #2196F3'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Selected Subcategory:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        {subcategories.find(s => s.id === productForm.subcategory_id)?.name || 'Unknown Subcategory'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 1,
                      border: '1px dashed #ccc'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {!productForm.category_id 
                          ? '📂 Please select a category first' 
                          : subcategories.length === 0 
                            ? '📂 No subcategories available for this category' 
                            : '📂 No subcategory selected for this product'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {!productForm.category_id 
                          ? 'Select a category to see available subcategories' 
                          : subcategories.length === 0 
                            ? 'This category has no subcategories - subcategory is optional' 
                            : 'Select a subcategory from the dropdown above (optional)'
                        }
                      </Typography>
                    </Box>
                  )}
                </Box>
              </FormControl>
            </Grid>
            
            {/* Size Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!formErrors.sizes}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  Product Sizes
                </FormLabel>
                
                {/* Size Category Selection */}
                <FormControl sx={{ mb: 3, minWidth: 200 }}>
                  <InputLabel>Size Category</InputLabel>
                  <Select
                    value={sizeCategory}
                    label="Size Category"
                    onChange={(e) => handleSizeCategoryChange(e.target.value)}
                  >
                    <MenuItem value="clothing">Clothing (XS, S, M, L, XL, XXL, XXXL)</MenuItem>
                    <MenuItem value="bottoms">Bottoms (28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48)</MenuItem>
                    <MenuItem value="shoes">Shoes (6, 7, 8, 9, 10, 11, 12, 13)</MenuItem>
                    <MenuItem value="accessories">Accessories (Standard Size, One Size, Small, Medium, Large)</MenuItem>
                  </Select>
                </FormControl>

                {sizeCategory === 'accessories' && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                    Use "Standard Size" for accessories like belts, wallets, bags, etc. that don't have specific sizing.
                  </Typography>
                )}

                {/* Size Checkboxes */}
                <FormGroup row>
                  {SIZE_OPTIONS[sizeCategory].map((size) => (
                    <FormControlLabel
                      key={size}
                      control={
                        <Checkbox
                          checked={(selectedSizes || []).includes(size)}
                          onChange={() => handleSizeChange(size)}
                          sx={{
                            '&.Mui-checked': {
                              color: '#1976d2',
                            },
                          }}
                        />
                      }
                      label={size}
                      sx={{ minWidth: 80 }}
                    />
                  ))}
                </FormGroup>
                
                {formErrors.sizes && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.sizes}
                  </Typography>
                )}
                
                {/* Selected Sizes Display */}
                <Box sx={{ mt: 2 }}>
                  {(selectedSizes || []).length > 0 ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Selected Sizes:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(selectedSizes || []).map((size) => (
                          <Chip
                            key={size}
                            label={size === 'Standard Size' ? `${size} (for accessories)` : size}
                            onDelete={() => handleSizeChange(size)}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{
                              backgroundColor: size === 'Standard Size' ? 'rgba(255, 215, 0, 0.1)' : undefined,
                              borderColor: size === 'Standard Size' ? '#FFD700' : undefined,
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 1,
                      border: '1px dashed #ccc'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        📏 No sizes selected for this product
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Select sizes from the options above
                      </Typography>
                    </Box>
                  )}
                </Box>
              </FormControl>
            </Grid>
            
            {/* Color Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!formErrors.colors}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  Product Colors
                </FormLabel>
                
                {/* Color Swatches */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  {COLOR_OPTIONS.map((color) => (
                    <Box
                      key={color.name}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 2,
                        border: (selectedColors || []).includes(color.name) ? '2px solid #1976d2' : '2px solid transparent',
                        backgroundColor: (selectedColors || []).includes(color.name) ? 'rgba(25, 118, 211, 0.1)' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 211, 0.05)',
                          transform: 'scale(1.05)',
                        },
                      }}
                      onClick={() => handleColorChange(color.name)}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: color.hex,
                          border: '2px solid #e0e0e0',
                          mb: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
                        {color.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                {formErrors.colors && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.colors}
                  </Typography>
                )}
                
                {/* Selected Colors Display */}
                <Box sx={{ mt: 2 }}>
                  {(selectedColors || []).length > 0 ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Selected Colors:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(selectedColors || []).map((colorName) => {
                          const color = COLOR_OPTIONS.find(c => c.name === colorName);
                          return (
                            <Chip
                              key={colorName}
                              label={colorName}
                              onDelete={() => handleColorChange(colorName)}
                              sx={{
                                backgroundColor: color?.hex || '#e0e0e0',
                                color: color?.hex === '#FFFFFF' || color?.hex === '#F5F5DC' ? '#000' : '#fff',
                                '& .MuiChip-deleteIcon': {
                                  color: color?.hex === '#FFFFFF' || color?.hex === '#F5F5DC' ? '#000' : '#fff',
                                },
                              }}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 1,
                      border: '1px dashed #ccc'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        🎨 No colors selected for this product
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Select colors from the options above
                      </Typography>
                    </Box>
                  )}
                </Box>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {editingProduct ? 
                  'Add more images to existing ones (JPEG, PNG, GIF - Max 2MB each)' : 
                  'Upload product images (JPEG, PNG, GIF - Max 2MB each)'
                }
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                component="label"
                fullWidth
                sx={{ py: 2 }}
                color={formErrors.images ? 'error' : 'primary'}
              >
                {editingProduct ? 'Add More Images (Optional)' : 'Upload Images (Required)'}
                <input 
                  type="file" 
                  hidden 
                  multiple 
                  accept="image/jpeg,image/jpg,image/png,image/gif" 
                  onChange={handleImageUpload}
                />
              </Button>
              {formErrors.images && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {formErrors.images}
                </Typography>
              )}
              
              {/* Display existing images for edit mode */}
              {editingProduct && (
                <Box sx={{ mt: 2 }}>
                  {productForm.images && productForm.images.length > 0 ? (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Current Images ({productForm.images.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {productForm.images.map((image, index) => (
                      <Box key={`existing-${image.id || index}`} sx={{ position: 'relative' }}>
                        <img
                          src={getImageUrl(image.image_path)}
                          alt={image.alt_text || `Existing image ${index + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0',
                            opacity: imagesToDelete.includes(image.id) ? 0.5 : 1,
                          }}
                        />
                        <Chip
                          label="Existing"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => deleteExistingImage(image.id)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            backgroundColor: 'rgba(244, 67, 54, 0.8)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#F44336',
                            },
                            width: '24px',
                            height: '24px',
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        {imagesToDelete.includes(image.id) && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(244, 67, 54, 0.3)',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#F44336',
                                fontWeight: 'bold',
                                backgroundColor: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              DELETED
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => undoDeleteImage(image.id)}
                              sx={{
                                backgroundColor: 'rgba(76, 175, 80, 0.9)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: '#4CAF50',
                                },
                                width: '20px',
                                height: '20px',
                              }}
                            >
                              <Undo fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                  {imagesToDelete.length > 0 && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {imagesToDelete.length} image(s) marked for deletion
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Total images after changes: {productForm.images.length + selectedImages.length} (Max: 5)
                  </Typography>
                    </>
                  ) : (
                    <Box sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 2,
                      border: '2px dashed #ccc'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📷 No images attached to this product
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Upload images using the button above
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Display selected images */}
              {selectedImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    New Images:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedImages.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: formErrors[`image_${index}`] ? '2px solid red' : 'none',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'red',
                            color: 'white',
                            '&:hover': { backgroundColor: 'darkred' },
                          }}
                        >
                          ×
                        </IconButton>
                        {formErrors[`image_${index}`] && (
                          <Typography 
                            variant="caption" 
                            color="error" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: -20, 
                              left: 0, 
                              right: 0, 
                              fontSize: '0.7rem',
                              textAlign: 'center'
                            }}
                          >
                            {formErrors[`image_${index}`]}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              '&:hover': { backgroundColor: '#F57F17' },
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Product'}
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

export default ProductManagement;
