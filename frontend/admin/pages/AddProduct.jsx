import React, { useState, useEffect, useMemo } from 'react';
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
    weight: '',
    dimensions: '',
    is_active: true,
    is_featured: false,
  });

  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState({ product_id: false, name: false });
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
  
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

  // Clear variants when category changes to show appropriate size options
  useEffect(() => {
    if (productForm.category_id) {
      // Clear existing variants when category changes
      setVariants([]);
    }
  }, [productForm.category_id]);

  // Fetch categories and subcategories - only once on mount
  useEffect(() => {
    // Prevent multiple fetches
    if (hasLoadedCategories) {
      return;
    }

    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          apiService.getCategories(),
          apiService.getSubcategories()
        ]);
        
        // Handle different response structures
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
        setHasLoadedCategories(true); // Mark as loaded
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load categories and subcategories');
        setHasLoadedCategories(true); // Mark as loaded even on error to prevent retries
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch next product ID
  useEffect(() => {
    // No longer auto-generating Product ID - admin will enter it manually
    console.log('🔍 Product ID will be entered manually by admin');
  }, []);

  // Check for duplicate product_id or name
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
          product.product_id && product.product_id.toLowerCase() === trimmedValue.toLowerCase()
        );
      } else if (field === 'name') {
        isDuplicate = products.some(product => 
          product.name && product.name.toLowerCase() === trimmedValue.toLowerCase()
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
        // Clear error if not duplicate - remove it completely
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
    []
  );

  const debouncedCheckProductName = useMemo(
    () => debounce((value) => checkDuplicate('name', value), 500),
    []
  );

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field immediately when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field]; // Remove the error completely instead of setting to empty string
        return newErrors;
      });
    }

    // Check for duplicates in real-time for product_id and name
    if (field === 'product_id' && value && value.trim()) {
      debouncedCheckProductId(value);
    } else if (field === 'name' && value && value.trim()) {
      debouncedCheckProductName(value);
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
    console.log('🔍 === VALIDATE FORM DEBUG ===');

    // Validate Product ID
    if (!productForm.product_id.trim()) {
      console.log('❌ Product ID validation failed:', productForm.product_id);
      errors.product_id = 'Product ID is required';
    } else if (productForm.product_id.includes(' ')) {
      console.log('❌ Product ID validation failed - contains spaces:', productForm.product_id);
      errors.product_id = 'Product ID cannot contain spaces';
    } else {
      console.log('✅ Product ID validation passed:', productForm.product_id);
    }

    // SKU validation removed - now handled at variant level

    if (!productForm.name.trim()) {
      console.log('❌ Name validation failed:', productForm.name);
      errors.name = 'Product name is required';
    } else {
      console.log('✅ Name validation passed:', productForm.name);
    }
    
    if (!productForm.category_id) {
      console.log('❌ Category validation failed:', productForm.category_id);
      errors.category_id = 'Category is required';
    } else {
      console.log('✅ Category validation passed:', productForm.category_id);
    }
    
    // Price validation removed - now handled at variant level
    
    if (!productForm.description.trim()) {
      console.log('❌ Description validation failed:', productForm.description);
      errors.description = 'Description is required';
    } else {
      console.log('✅ Description validation passed:', productForm.description);
    }

    // Validate variants
    console.log('🔍 Variants validation - length:', variants.length);
    if (variants.length === 0) {
      console.log('❌ Variants validation failed - no variants');
      errors.variants = 'At least one variant is required';
    } else {
      console.log('✅ Variants validation passed - variants exist');
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
    console.log('🔍 Images validation - length:', images.length);
    if (images.length === 0) {
      console.log('❌ Images validation failed - no images');
      errors.images = 'At least one image is required';
    } else if (images.length > 5) {
      console.log('❌ Images validation failed - too many images:', images.length);
      errors.images = 'Cannot upload more than 5 images';
    } else {
      console.log('✅ Images validation passed - correct number of images');
    }

    // Check image sizes
    const oversizedImages = images.filter(img => img.file && img.file.size > 500 * 1024);
    console.log('🔍 Image size check - oversized images:', oversizedImages.length);
    if (oversizedImages.length > 0) {
      console.log('❌ Images validation failed - oversized images:', oversizedImages.map(img => ({
        name: img.file.name,
        size: img.file.size,
        sizeKB: Math.round(img.file.size / 1024)
      })));
      errors.images = `${oversizedImages.length} image(s) exceed 500KB limit`;
    } else {
      console.log('✅ Images validation passed - all images under size limit');
    }

    console.log('🔍 === FINAL VALIDATION RESULT ===');
    console.log('🔍 Total errors found:', Object.keys(errors).length);
    console.log('🔍 All errors:', errors);
    console.log('🔍 Validation passed:', Object.keys(errors).length === 0);
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔍 DEBUG: Print all form data before validation
    console.log('🔍 === FORM SUBMISSION DEBUG ===');
    console.log('🔍 Product Form:', productForm);
    console.log('🔍 Variants:', variants);
    console.log('🔍 Images:', images);
    console.log('🔍 Validation Errors:', validationErrors);
    
    // 🔍 DEBUG: Check each validation step
    console.log('🔍 === VALIDATION CHECKS ===');
    console.log('🔍 Name check:', productForm.name, 'Valid:', !!productForm.name.trim());
    console.log('🔍 Category check:', productForm.category_id, 'Valid:', !!productForm.category_id);
    // Price check removed - now handled at variant level
    console.log('🔍 Description check:', productForm.description, 'Valid:', !!productForm.description.trim());
    console.log('🔍 Variants length:', variants.length, 'Valid:', variants.length > 0);
    console.log('🔍 Images length:', images.length, 'Valid:', images.length > 0);
    
    if (variants.length > 0) {
      console.log('🔍 Variant details:');
      variants.forEach((variant, index) => {
        console.log(`🔍   Variant ${index}:`, {
          size: variant.size,
          color: variant.color,
          quantity: variant.quantity,
          price: variant.price,
          sizeValid: !!(variant.size && variant.size.trim()),
          colorValid: !!(variant.color && variant.color.trim()),
          quantityValid: variant.quantity >= 0
        });
      });
    }
    
    if (images.length > 0) {
      console.log('🔍 Image details:');
      images.forEach((image, index) => {
        console.log(`🔍   Image ${index}:`, {
          hasFile: !!image.file,
          fileSize: image.file ? image.file.size : 'N/A',
          sizeValid: image.file ? image.file.size <= 500 * 1024 : false
        });
      });
    }
    
    const isValid = validateForm();
    console.log('🔍 Final validation result:', isValid);
    console.log('🔍 Current validation errors:', validationErrors);
    
    if (!isValid) {
      setError('Please fix the validation errors');
      return;
    }

      setLoading(true);
    setError('');
      
    try {
      const formData = new FormData();
      
      // Add product data (including product_id as it's now user-entered)
      console.log('🔍 Product form before FormData:', productForm);
      Object.keys(productForm).forEach(key => {
          console.log(`🔍 Adding to FormData: ${key} = ${productForm[key]} (type: ${typeof productForm[key]})`);
          formData.append(key, productForm[key]);
      });
      
      // Add variants as array (backend expects array, not JSON string)
      variants.forEach((variant, index) => {
        formData.append(`variants[${index}][size]`, variant.size);
        formData.append(`variants[${index}][color]`, variant.color);
        formData.append(`variants[${index}][quantity]`, variant.quantity);
        formData.append(`variants[${index}][price]`, variant.price);
        formData.append(`variants[${index}][sku]`, variant.sku);
        if (variant.sale_price) {
          formData.append(`variants[${index}][sale_price]`, variant.sale_price);
        }
      });

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
      console.error('Error message:', err.message);
      
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

      {/* Validation Errors Summary - Only show actual errors with messages */}
      {Object.entries(validationErrors).some(([_, message]) => message && message.trim()) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {Object.entries(validationErrors)
              .filter(([_, message]) => message && message.trim()) // Only show errors with actual messages
              .map(([field, message]) => (
                <li key={field}>
                  <strong>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {message}
                </li>
              ))}
          </ul>
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
                    onBlur={() => {
                      if (productForm.name && productForm.name.trim()) {
                        checkDuplicate('name', productForm.name);
                      }
                    }}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || (checkingDuplicate.name ? 'Checking...' : '')}
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

                  
                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth error={!!validationErrors.category_id} variant="standard" sx={{ minWidth: 150 }}>
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
                    <FormControl fullWidth variant="standard" sx={{ minWidth: 150 }}>
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
                  <FormControl fullWidth variant="standard" sx={{ minWidth: 150 }}>
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
                  onValidationChange={(errors) => {
                    setValidationErrors(prev => ({
                      ...prev,
                      ...errors
                    }));
                  }}
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

export default AddProduct;