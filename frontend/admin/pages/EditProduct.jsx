import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Save,
  Cancel,
  Add,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../src/services/api';
import ProductVariantManager from '../components/ProductVariantManager';
import { getImageUrl } from '../../src/utils/imageUtils';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  // Re-enable frontend validation
  const DISABLE_EDIT_VALIDATION = false;

  const [productForm, setProductForm] = useState({
    product_id: '',
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    collection: '',
    weight: '',
    dimensions: '',
    is_active: true,
    is_featured: false,
  });

  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [checkingDuplicate, setCheckingDuplicate] = useState({ product_id: false, name: false });

  // Predefined size and color options
  const sizeOptions = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    shirts: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    tshirts: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    pants: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
    jeans: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
    shorts: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
    coats: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    jackets: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    blazers: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    shoes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    sneakers: ['6', '7', '8', '9', '10', '11', '12', '13'],
    boots: ['6', '7', '8', '9', '10', '11', '12', '13'],
    accessories: ['One Size', 'Standard'],
    bags: ['Small', 'Medium', 'Large', 'Extra Large'],
    watches: ['Small', 'Medium', 'Large'],
    jewelry: ['Small', 'Medium', 'Large', 'One Size']
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
    
    // Check for specific category matches
    if (categoryName.includes('shirt') || categoryName.includes('tshirt') || categoryName.includes('t-shirt')) {
      return 'shirts';
    } else if (categoryName.includes('pant') || categoryName.includes('trouser')) {
      return 'pants';
    } else if (categoryName.includes('jean')) {
      return 'jeans';
    } else if (categoryName.includes('short')) {
      return 'shorts';
    } else if (categoryName.includes('coat')) {
      return 'coats';
    } else if (categoryName.includes('jacket')) {
      return 'jackets';
    } else if (categoryName.includes('blazer')) {
      return 'blazers';
    } else if (categoryName.includes('shoe') || categoryName.includes('footwear')) {
      return 'shoes';
    } else if (categoryName.includes('sneaker')) {
      return 'sneakers';
    } else if (categoryName.includes('boot')) {
      return 'boots';
    } else if (categoryName.includes('bag') || categoryName.includes('handbag') || categoryName.includes('backpack')) {
      return 'bags';
    } else if (categoryName.includes('watch')) {
      return 'watches';
    } else if (categoryName.includes('jewelry') || categoryName.includes('jewellery') || categoryName.includes('necklace') || categoryName.includes('ring') || categoryName.includes('bracelet')) {
      return 'jewelry';
    } else if (categoryName.includes('accessory') || categoryName.includes('hat') || categoryName.includes('cap') || categoryName.includes('belt') || categoryName.includes('wallet')) {
      return 'accessories';
    }
    
    // Default fallback
    return 'clothing';
  };

  const getAvailableSizes = () => {
    return sizeOptions[getSizeType()] || sizeOptions.clothing;
  };

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setFetching(true);
        const [productRes, categoriesRes, subcategoriesRes] = await Promise.all([
          apiService.get(`/admin/products/${id}`),
          apiService.getCategories(),
          apiService.getSubcategories()
        ]);
        
        const product = productRes.data;
        
        console.log('===== DATA LOADING DEBUG =====');
        console.log('Product data received:', product);
        console.log('Product name:', product.name);
        console.log('Product description:', product.description);
        console.log('Product variants:', product.variants);
        
        // Handle different response structures for categories
        let categoriesData = [];
        if (categoriesRes.data && categoriesRes.data.success) {
          categoriesData = categoriesRes.data.data || [];
        } else if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data;
        } else if (categoriesRes.data && categoriesRes.data.data) {
          categoriesData = categoriesRes.data.data;
        }
        
        let subcategoriesData = [];
        if (subcategoriesRes.data && subcategoriesRes.data.success) {
          subcategoriesData = subcategoriesRes.data.data || [];
        } else if (subcategoriesRes.data && Array.isArray(subcategoriesRes.data)) {
          subcategoriesData = subcategoriesRes.data;
        } else if (subcategoriesRes.data && subcategoriesRes.data.data) {
          subcategoriesData = subcategoriesRes.data.data;
        }
        
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
        
        // Populate form with product data
        const formData = {
          product_id: product.product_id || '',
          name: product.name || '',
          description: product.description || '',
          category_id: product.category_id || '',
          subcategory_id: product.subcategory_id || '',
          collection: product.collection || '',
          // Price fields removed - now handled at variant level
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
        };
        
        console.log('Setting productForm with data:', formData);
        setProductForm(formData);
        
        // Populate variants
        if (product.variants && Array.isArray(product.variants)) {
          const variantsData = product.variants.map(variant => {
            // Get original_quantity from inventory.total_stock if available, otherwise use quantity
            const originalQuantity = variant.inventory?.total_stock ?? variant.inventory?.quantity ?? variant.quantity;
            return {
              id: variant.id,
              size: variant.size,
              color: variant.color,
              quantity: variant.quantity, // Available stock
              original_quantity: originalQuantity, // Total stock (original quantity)
              price: variant.price,
              sale_price: variant.sale_price,
              sku: variant.sku,
            };
          });
          console.log('Setting variants with data:', variantsData);
          console.log('Variant inventory data:', product.variants.map(v => ({ id: v.id, inventory: v.inventory })));
          setVariants(variantsData);
        } else {
          console.log('No variants found in product data');
        }
        
        // Populate images
        if (product.images && Array.isArray(product.images)) {
          setImages(product.images.map(image => ({
            id: image.id,
            url: image.image_path,
            isExisting: true
          })));
        }
        
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data');
      } finally {
        setFetching(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Check for duplicate product_id or name (excluding current product)
  const checkDuplicate = async (field, value) => {
    if (!value || !value.trim()) {
      return;
    }

    try {
      setCheckingDuplicate(prev => ({ ...prev, [field]: true }));
      
      // Fetch all products to check for duplicates
      const response = await apiService.get('/admin/products');
      const products = response.data?.data || response.data || [];
      
      const trimmedValue = value.trim();
      let isDuplicate = false;
      
      if (field === 'product_id') {
        isDuplicate = products.some(product => 
          product.id !== parseInt(id) && // Exclude current product
          product.product_id && 
          product.product_id.toLowerCase() === trimmedValue.toLowerCase()
        );
      } else if (field === 'name') {
        isDuplicate = products.some(product => 
          product.id !== parseInt(id) && // Exclude current product
          product.name && 
          product.name.toLowerCase() === trimmedValue.toLowerCase()
        );
      }
      
      if (isDuplicate) {
        const errorMessage = field === 'product_id' 
          ? 'This Product ID already exists'
          : 'This product name already exists';
        
        setValidationErrors(prev => ({
          ...prev,
          [field]: errorMessage
        }));
      } else {
        // Remove error if not duplicate (delete the key instead of setting to undefined)
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (err) {
      console.error(`Error checking duplicate ${field}:`, err);
      // Don't show error on check failure, let backend validation handle it
    } finally {
      setCheckingDuplicate(prev => ({ ...prev, [field]: false }));
    }
  };

  // Debounce function for duplicate checking
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Create debounced check functions
  const debouncedCheckProductId = useMemo(
    () => debounce((value) => checkDuplicate('product_id', value), 500),
    [id]
  );

  const debouncedCheckProductName = useMemo(
    () => debounce((value) => checkDuplicate('name', value), 500),
    [id]
  );

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Remove error for this field when user types (delete the key instead of setting to undefined)
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Check for duplicates in real-time for product_id and name
    if (field === 'product_id' && value && value.trim()) {
      debouncedCheckProductId(value);
    } else if (field === 'name' && value && value.trim()) {
      debouncedCheckProductName(value);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      }));
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    
    // If it's an existing image, add to deleted list
    if (imageToRemove.isExisting && imageToRemove.id) {
      setDeletedImageIds(prev => [...prev, imageToRemove.id]);
    }
    
    // Remove from images array
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (!imageToRemove.isExisting && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return newImages;
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate Product ID
    if (!productForm.product_id.trim()) {
      errors.product_id = 'Product ID is required';
    } else if (productForm.product_id.includes(' ')) {
      errors.product_id = 'Product ID cannot contain spaces';
    }

    // SKU validation removed - now handled at variant level
    
    if (!productForm.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!productForm.category_id) {
      errors.category_id = 'Category is required';
    }
    
    // Price validation removed - now handled at variant level
    
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
        if (!variant.size || !variant.size.trim()) {
          errors[`variant_${index}_size`] = 'Size is required';
        }
        if (!variant.color || !variant.color.trim()) {
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

    // Check image sizes for new uploads
    const newImages = images.filter(img => !img.isExisting);
    const oversizedImages = newImages.filter(img => img.file && img.file.size > 500 * 1024);
    if (oversizedImages.length > 0) {
      errors.images = `${oversizedImages.length} image(s) exceed 500KB limit`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('===== FORM SUBMISSION DEBUG =====');
    console.log('productForm:', productForm);
    console.log('variants:', variants);
    console.log('images:', images);
    console.log('deletedImageIds:', deletedImageIds);
    
    // Check if form data is empty
    if (!productForm.name || !productForm.description) {
      console.error('❌ Form data is empty!');
      setError('Form data is empty. Please refresh the page and try again.');
      setSnackbarMessage('Form data is empty. Please refresh the page and try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!DISABLE_EDIT_VALIDATION) {
      if (!validateForm()) {
        setError('Please fix the validation errors');
        setSnackbarMessage('Please fix the validation errors');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');
      
    try {
      const formData = new FormData();
      
      // Add product data
      Object.keys(productForm).forEach(key => {
        formData.append(key, productForm[key]);
      });
      
      // Add variants as JSON string (critical fix for FormData parsing)
      // Include original_quantity for existing variants to preserve total_stock
      const variantsToSend = variants.map(variant => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity, // Available stock
        original_quantity: variant.original_quantity ?? variant.quantity, // Total stock (preserve if exists, otherwise use quantity)
        price: variant.price,
        sale_price: variant.sale_price,
        sku: variant.sku,
      }));
      formData.append('variants', JSON.stringify(variantsToSend));

      // Add deleted image IDs
      deletedImageIds.forEach((imageId, index) => {
        formData.append(`deleted_image_ids[${index}]`, imageId);
      });

      // Add new images
      images.forEach((imageObj, index) => {
        if (!imageObj.isExisting && imageObj.file) {
          formData.append(`images[${index}]`, imageObj.file);
        }
      });

      console.log('Submitting product update:', {
        productId: id,
        productForm: productForm,
        variants: variants,
        images: images.length,
        deletedImageIds: deletedImageIds
      });
      
      // Debug FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Check if FormData is empty
      const formDataEntries = Array.from(formData.entries());
      console.log('FormData entries count:', formDataEntries.length);
      console.log('FormData entries:', formDataEntries);
      
      if (formDataEntries.length === 0) {
        console.error('❌ FormData is completely empty!');
        setError('FormData is empty. Please check form data.');
        setSnackbarMessage('FormData is empty. Please check form data.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      
      // Check if variants JSON is properly formatted
      const variantsEntry = formDataEntries.find(([key]) => key === 'variants');
      if (variantsEntry) {
        console.log('Variants JSON string:', variantsEntry[1]);
        try {
          const parsedVariants = JSON.parse(variantsEntry[1]);
          console.log('Parsed variants:', parsedVariants);
        } catch (e) {
          console.error('❌ Failed to parse variants JSON:', e);
        }
      } else {
        console.error('❌ No variants found in FormData!');
      }

      console.log('API Service token:', localStorage.getItem('admin_token'));
      console.log('API Service base URL:', apiService.baseURL);

      const response = await apiService.put(`/admin/products/${id}`, formData);
      
      console.log('Product update response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      if (response.success) {
        console.log('✅ Product update successful!');
        
        // Update local state with the response data
        if (response.data) {
          const updatedProduct = response.data;
          
          // Update product form with fresh data
          setProductForm({
            name: updatedProduct.name || '',
            description: updatedProduct.description || '',
            category_id: updatedProduct.category_id || '',
            subcategory_id: updatedProduct.subcategory_id || '',
            collection: updatedProduct.collection || '',
            // Price fields removed - now handled at variant level
            weight: updatedProduct.weight || '',
            dimensions: updatedProduct.dimensions || '',
            is_active: updatedProduct.is_active ?? true,
            is_featured: updatedProduct.is_featured ?? false,
          });
          
          // Update variants with fresh data
          if (updatedProduct.variants && Array.isArray(updatedProduct.variants)) {
            setVariants(updatedProduct.variants.map(variant => {
              // Get original_quantity from inventory.total_stock if available, otherwise use quantity
              const originalQuantity = variant.inventory?.total_stock ?? variant.inventory?.quantity ?? variant.quantity;
              return {
                id: variant.id,
                size: variant.size,
                color: variant.color,
                quantity: variant.quantity, // Available stock
                original_quantity: originalQuantity, // Total stock (original quantity)
                price: variant.price,
                sale_price: variant.sale_price,
                sku: variant.sku,
              };
            }));
          }
          
          // Update images with fresh data
          if (updatedProduct.images && Array.isArray(updatedProduct.images)) {
            setImages(updatedProduct.images.map(image => ({
              id: image.id,
              url: image.image_path,
              isExisting: true
            })));
          }
          
          console.log('🔄 Form state updated with fresh data from server');
        }
        setSnackbarMessage('Product updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        setTimeout(() => {

          navigate('/admin/product-management');
        }, 2000);
      } else {
        console.log('❌ Product update failed:', response.message);
        throw new Error(response.message || 'Failed to update product');
      }
      
    } catch (err) {
      console.error('❌ Error updating product:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
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
            // Handle description errors
            else if (field === 'description') {
              fieldErrors.description = errorMsg;
            }
            // Handle category errors
            else if (field === 'category_id') {
              fieldErrors.category_id = errorMsg;
            }
            // Handle variant errors
            else if (field.startsWith('variants')) {
              fieldErrors.variants = errorMsg;
            }
            // Handle image errors
            else if (field.startsWith('images') || field === 'images') {
              fieldErrors.images = errorMsg;
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
      // Handle error message string from API service (when error is thrown as Error object)
      else if (err.message) {
        const message = err.message;
        const lowerMessage = message.toLowerCase();
        
        // Parse validation error messages like "Validation failed: Product description must be at least 10 characters long"
        if (message.includes('Validation failed:')) {
          const validationPart = message.replace('Validation failed:', '').trim();
          
          // Try to extract field name and error message
          if (lowerMessage.includes('description')) {
            fieldErrors.description = validationPart;
          } else if (lowerMessage.includes('product_id') || lowerMessage.includes('product id')) {
            if (lowerMessage.includes('already exists') || lowerMessage.includes('unique') || lowerMessage.includes('duplicate')) {
              fieldErrors.product_id = 'This Product ID already exists';
            } else {
              fieldErrors.product_id = validationPart;
            }
          } else if (lowerMessage.includes('name') && (lowerMessage.includes('already exists') || lowerMessage.includes('unique') || lowerMessage.includes('duplicate'))) {
            fieldErrors.name = 'This product name already exists';
          } else if (lowerMessage.includes('category')) {
            fieldErrors.category_id = validationPart;
          } else if (lowerMessage.includes('variant')) {
            fieldErrors.variants = validationPart;
          } else if (lowerMessage.includes('image')) {
            fieldErrors.images = validationPart;
          } else {
            // Generic validation error - try to extract field name
            const fieldMatch = validationPart.match(/(\w+)\s+(must|is|has|should)/i);
            if (fieldMatch) {
              const fieldName = fieldMatch[1].toLowerCase();
              if (fieldName === 'description') {
                fieldErrors.description = validationPart;
              } else if (fieldName === 'name') {
                fieldErrors.name = validationPart;
              } else if (fieldName === 'category') {
                fieldErrors.category_id = validationPart;
              } else {
                fieldErrors[fieldName] = validationPart;
              }
            } else {
              // If we can't parse, show the full message
              errorMessage = message;
            }
          }
          
          // Update validation errors state for inline display
          if (Object.keys(fieldErrors).length > 0) {
            setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
            
            // Create summary message
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
              : message;
          } else {
            errorMessage = message;
          }
        }
        // Check for duplicate product ID
        else if (lowerMessage.includes('product_id') || lowerMessage.includes('product id') || 
            (lowerMessage.includes('duplicate') && (lowerMessage.includes('product_id') || lowerMessage.includes('product id'))) ||
            lowerMessage.includes('this product id already exists')) {
          fieldErrors.product_id = 'This Product ID already exists';
          errorMessage = `Product ID "${productForm.product_id}" already exists. Please use a different Product ID.`;
          setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        }
        // Check for duplicate product name
        else if ((lowerMessage.includes('name') && (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists') || lowerMessage.includes('unique'))) ||
                 lowerMessage.includes('a product with this name already exists')) {
          fieldErrors.name = 'This product name already exists';
          errorMessage = `Product name "${productForm.name}" already exists. Please use a different product name.`;
          setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        }
        // Check for duplicate SKU
        else if (lowerMessage.includes('sku') && (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists'))) {
          fieldErrors.variants = 'Duplicate SKU found. Please use unique SKUs for each variant.';
          errorMessage = 'One or more variant SKUs already exist. Please use different SKUs.';
          setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        }
        // Generic error message
        else {
          errorMessage = message;
        }
      }
      // Handle errorData.message (fallback)
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
        errorMessage = 'Failed to update product. Please try again.';
      }
      
      console.log('Setting error message:', errorMessage);
      console.log('Setting field errors:', fieldErrors);
      
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/product-management');
  };

  // Calculate total stock
  const totalStock = variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading product data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Edit Product
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

      {/* Validation Errors Summary - Only show if there are actual error messages */}
      {(() => {
        // Filter out undefined, null, or empty string values
        const actualErrors = Object.entries(validationErrors).filter(([field, message]) => 
          message && typeof message === 'string' && message.trim().length > 0
        );
        return actualErrors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {!DISABLE_EDIT_VALIDATION && (
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Please fix the following errors:
              </Typography>
            )}
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {actualErrors.map(([field, message]) => (
                <li key={field}>
                  <strong>{field}:</strong> {message}
                </li>
              ))}
            </ul>
          </Alert>
        );
      })()}

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
                      onBlur={() => {
                        if (productForm.name && productForm.name.trim()) {
                          checkDuplicate('name', productForm.name);
                        }
                      }}
                      error={!DISABLE_EDIT_VALIDATION && !!validationErrors.name}
                      helperText={!DISABLE_EDIT_VALIDATION ? (validationErrors.name || (checkingDuplicate.name ? 'Checking...' : '')) : ''}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product ID"
                      value={productForm.product_id}
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trim();
                        handleInputChange('product_id', trimmedValue);
                      }}
                      onBlur={() => {
                        if (productForm.product_id && productForm.product_id.trim()) {
                          checkDuplicate('product_id', productForm.product_id);
                        }
                      }}
                      error={!!validationErrors.product_id}
                      helperText={validationErrors.product_id || (checkingDuplicate.product_id ? 'Checking...' : "Enter a unique Product ID (no spaces allowed)")}
                      placeholder="e.g., PRD-001, JACKET-001, etc."
                      sx={{
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                        },
                      }}
                    />
                  </Grid>

                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ minWidth: 150 }}error={!DISABLE_EDIT_VALIDATION && !!validationErrors.category_id} required variant="standard">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={productForm.category_id}
                        label="Category"
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select Category</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!DISABLE_EDIT_VALIDATION && validationErrors.category_id && (
                        <FormHelperText>{validationErrors.category_id}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!DISABLE_EDIT_VALIDATION && !!validationErrors.subcategory_id} variant="standard" sx={{ minWidth: 150 }}>
                      <InputLabel>Subcategory</InputLabel>
                      <Select
                        value={productForm.subcategory_id}
                        label="Subcategory"
                        onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                        disabled={!productForm.category_id || subcategories.filter(sub => sub.category_id === productForm.category_id).length === 0}
                      >
                        <MenuItem value="">
                          <em>Select Subcategory</em>
                        </MenuItem>
                        {subcategories
                          .filter(sub => sub.category_id === productForm.category_id)
                          .map((subcategory) => (
                            <MenuItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </MenuItem>
                          ))}
                      </Select>
                      {!DISABLE_EDIT_VALIDATION && validationErrors.subcategory_id && (
                        <FormHelperText>{validationErrors.subcategory_id}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="standard" sx={{ minWidth: 150 }}>
                      <InputLabel>Collection</InputLabel>
                      <Select
                        value={productForm.collection}
                        onChange={(e) => handleInputChange('collection', e.target.value)}
                        label="Collection"
                      >
                        <MenuItem value="">
                          <em>Select Collection</em>
                        </MenuItem>
                        <MenuItem value="Winter">Winter</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                        <MenuItem value="All Season">All Season</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Price fields removed - now handled at variant level */}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={productForm.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      error={!DISABLE_EDIT_VALIDATION && !!validationErrors.description}
                      helperText={!DISABLE_EDIT_VALIDATION ? validationErrors.description : ''}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Weight (kg, Optional)"
                      type="number"
                      value={productForm.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || '')}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Dimensions (e.g., 10x15x5 cm, Optional)"
                      value={productForm.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Is Active"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_featured}
                          onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Is Featured"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Variants */}
          <Grid item xs={12}>
            <ProductVariantManager
              variants={variants}
              onVariantsChange={setVariants}
              availableSizes={getAvailableSizes()}
              availableColors={colorOptions}
              validationErrors={DISABLE_EDIT_VALIDATION ? {} : validationErrors}
              onValidationChange={(errors) => {
                setValidationErrors(prev => ({
                  ...prev,
                  ...errors
                }));
              }}
            />
            {!DISABLE_EDIT_VALIDATION && validationErrors.variants && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationErrors.variants}
              </Alert>
            )}
          </Grid>

          {/* Inventory Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Inventory Summary
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`Total Stock: ${totalStock}`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Calculated from variant quantities
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Images */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Product Images
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload-button"
                  multiple
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload-button">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Upload New Images (Max 5, 500KB each)
                  </Button>
                </label>
                {!DISABLE_EDIT_VALIDATION && validationErrors.images && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {validationErrors.images}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item key={index}>
                      <Box sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1 }}>
                        <img
                          src={image.isExisting ? getImageUrl(image.url) : image.preview}
                          alt={`Product Preview ${index}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': { backgroundColor: 'white' },
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                        {image.isExisting && (
                          <Chip 
                            label="Existing" 
                            size="small" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 4, 
                              left: 4,
                              fontSize: '0.7rem',
                              height: 20
                            }} 
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  color: '#FFD700',
                  borderColor: '#FFD700',
                  '&:hover': {
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#333',
                  '&:hover': {
                    backgroundColor: '#e6c200',
                  },
                }}
              >
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          console.log('Snackbar closed');
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => {
            console.log('Alert closed');
            setSnackbarOpen(false);
          }} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
    </Box>
  );
};

export default EditProduct;
