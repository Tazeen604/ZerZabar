import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  CloudUpload,
  Save,
  Refresh,
  Info,
  Image as ImageIcon,
  Delete,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../src/services/api';
import { getHomepageImageUrl } from '../../src/utils/homepageImageUtils';

const HomepageSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // State for homepage settings
  const [categoryCards, setCategoryCards] = useState([]);
  const [twoCards, setTwoCards] = useState([]);
  const [pageHeader, setPageHeader] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [originalCategoryCards, setOriginalCategoryCards] = useState([]);
  const [originalTwoCards, setOriginalTwoCards] = useState([]);
  const [originalPageHeader, setOriginalPageHeader] = useState(null);

  // Initialize default settings if none exist
  const initializeDefaults = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/admin/homepage-settings/initialize');
      if (response.success) {
        setSnackbarMessage('Default homepage settings initialized successfully');
        setSnackbarOpen(true);
        fetchSettings();
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      setError('Failed to initialize default settings');
    } finally {
      setLoading(false);
    }
  };

  // Initialize page header settings specifically
  const initializePageHeader = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/admin/homepage-settings/initialize');
      if (response.success) {
        setSnackbarMessage('Page header settings initialized successfully');
        setSnackbarOpen(true);
        fetchSettings();
      }
    } catch (error) {
      console.error('Error initializing page header:', error);
      setError('Failed to initialize page header settings');
    } finally {
      setLoading(false);
    }
  };

  // Restore to original hardcoded settings
  const restoreDefaults = async () => {
    if (!window.confirm('Are you sure you want to restore all homepage settings to their original hardcoded values? This will overwrite all current settings.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post('/admin/homepage-settings/restore');
      
      if (response.success) {
        setSnackbarMessage('Homepage settings restored to original values successfully');
        setSnackbarOpen(true);
        fetchSettings();
      }
    } catch (error) {
      console.error('Error restoring defaults:', error);
      setError('Failed to restore original settings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/admin/categories');
      if (response.success) {
        setAvailableCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch homepage settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/homepage-settings');
      
      if (response.success) {
        const settings = response.data;
        const categoryCardsData = settings.filter(s => s.section === 'category_cards');
        const twoCardsData = settings.filter(s => s.section === 'two_cards');
        const pageHeaderData = settings.find(s => s.section === 'page_header');
        
        setCategoryCards(categoryCardsData);
        setTwoCards(twoCardsData);
        setPageHeader(pageHeaderData || null);
        
        // Store original values for comparison
        setOriginalCategoryCards(JSON.parse(JSON.stringify(categoryCardsData)));
        setOriginalTwoCards(JSON.parse(JSON.stringify(twoCardsData)));
        setOriginalPageHeader(pageHeaderData ? JSON.parse(JSON.stringify(pageHeaderData)) : null);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load homepage settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  // Handle image upload
  const handleImageUpload = (section, index, file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, JPEG, PNG)');
      return;
    }

    // Validate file size
    const maxSize = section === 'category_cards' ? 1024 * 1024 : 
                   section === 'page_header' ? 2 * 1024 * 1024 : 
                   1.5 * 1024 * 1024; // 1MB, 2MB, or 1.5MB
    if (file.size > maxSize) {
      const sizeLimit = section === 'category_cards' ? '1MB' : 
                       section === 'page_header' ? '2MB' : '1.5MB';
      setError(`File size must be less than ${sizeLimit}`);
      return;
    }

    // Validate dimensions (mandatory)
    const img = new Image();
    img.onload = () => {
      const requiredDimensions = section === 'category_cards' 
        ? { width: 800, height: 600 }
        : section === 'page_header'
        ? { width: 1920, height: 1080 }
        : { width: 1920, height: 1080 };
      
      if (img.width !== requiredDimensions.width || img.height !== requiredDimensions.height) {
        setError(`Image dimensions must be ${requiredDimensions.width}x${requiredDimensions.height} pixels for ${section} section`);
        return;
      }

      // Update the setting with new image
      if (section === 'category_cards') {
        const updatedCards = [...categoryCards];
        updatedCards[index] = { ...updatedCards[index], imageFile: file };
        setCategoryCards(updatedCards);
      } else if (section === 'two_cards') {
        const updatedCards = [...twoCards];
        updatedCards[index] = { ...updatedCards[index], imageFile: file };
        setTwoCards(updatedCards);
      } else if (section === 'page_header') {
        // Update page header with new image
        const updatedHeader = { ...pageHeader, imageFile: file };
        setPageHeader(updatedHeader);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  // Handle input changes
  const handleInputChange = (section, index, field, value) => {
    if (section === 'category_cards') {
      const updatedCards = [...categoryCards];
      updatedCards[index] = { ...updatedCards[index], [field]: value };
      setCategoryCards(updatedCards);
    } else {
      const updatedCards = [...twoCards];
      updatedCards[index] = { ...updatedCards[index], [field]: value };
      setTwoCards(updatedCards);
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Validate each card independently - only validate cards that have actual user changes
      const allSettings = [...categoryCards, ...twoCards, ...(pageHeader ? [pageHeader] : [])];
      const allOriginalSettings = [...originalCategoryCards, ...originalTwoCards, ...(originalPageHeader ? [originalPageHeader] : [])];
      
      for (let i = 0; i < allSettings.length; i++) {
        const setting = allSettings[i];
        const originalSetting = allOriginalSettings[i];
        
        // Check if this card has been modified by the user
        const hasBeenModified = 
          setting.title !== originalSetting?.title ||
          setting.description !== originalSetting?.description ||
          setting.imageFile !== undefined ||
          setting.image !== originalSetting?.image;
        
        if (hasBeenModified) {
          const hasContent = !!(setting.title || setting.description);
          const hasImage = !!setting.imageFile;
          const hasExistingImage = !!setting.image;
          
          // For category cards, title comes from selected category, so check differently
          const isCategoryCard = i < categoryCards.length;
          const isPageHeader = i >= categoryCards.length + twoCards.length;
          
          // Page header only needs image, no content validation
          if (isPageHeader) {
            // Page header validation: if uploading image, that's all that's needed
            // No content validation required for page header
          } else {
            const hasValidContent = isCategoryCard ? 
              (setting.metadata?.key || setting.title) : // Category cards need either selected category or title
              (setting.title || setting.description); // Two cards need title or description
            
            // If admin is updating content, image is required
            if (hasValidContent && !hasImage && !hasExistingImage) {
              const cardName = isCategoryCard ? 
                (setting.title || `Category Card ${i + 1}`) : 
                (setting.title || `Card ${i + 1}`);
              setError(`Image is required when updating card content for ${cardName}`);
              setSaving(false);
              return;
            }
            
            // If admin is uploading image, content is required
            if (hasImage && !hasValidContent) {
              const cardName = isCategoryCard ? 
                (setting.title || `Category Card ${i + 1}`) : 
                (setting.title || `Card ${i + 1}`);
              setError(`Card title/description is required when uploading image for ${cardName}`);
              setSaving(false);
              return;
            }
          }
        }
      }

      const formData = new FormData();
      
      // Prepare category cards data
      categoryCards.forEach((card, index) => {
        console.log(`Category Card ${index}:`, card);
        formData.append(`settings[${index}][id]`, card.id);
        formData.append(`settings[${index}][title]`, card.title || '');
        formData.append(`settings[${index}][description]`, card.description || '');
        formData.append(`settings[${index}][order_no]`, card.order_no);
        formData.append(`settings[${index}][is_active]`, card.is_active ? '1' : '0');
        if (card.metadata?.key) {
          formData.append(`settings[${index}][metadata]`, JSON.stringify(card.metadata));
        }
        if (card.imageFile) {
          formData.append(`settings[${index}][image]`, card.imageFile);
        }
        if (card.image === null && card.imageFile === null && (!card.title && !card.description)) {
          formData.append(`settings[${index}][delete_image]`, '1');
        }
      });

      // Prepare two cards data
      const twoCardsStartIndex = categoryCards.length;
      twoCards.forEach((card, index) => {
        const formIndex = twoCardsStartIndex + index;
        formData.append(`settings[${formIndex}][id]`, card.id);
        formData.append(`settings[${formIndex}][title]`, card.title || '');
        formData.append(`settings[${formIndex}][description]`, card.description || '');
        formData.append(`settings[${formIndex}][order_no]`, card.order_no);
        formData.append(`settings[${formIndex}][is_active]`, card.is_active ? '1' : '0');
        if (card.imageFile) {
          formData.append(`settings[${formIndex}][image]`, card.imageFile);
        }
        if (card.image === null && card.imageFile === null && (!card.title && !card.description)) {
          formData.append(`settings[${formIndex}][delete_image]`, '1');
        }
      });

      // Prepare page header data
      console.log('Page Header state:', pageHeader);
      if (pageHeader) {
        console.log('Page Header data being sent:', pageHeader);
        const pageHeaderIndex = categoryCards.length + twoCards.length;
        console.log('Page Header index:', pageHeaderIndex);
        formData.append(`settings[${pageHeaderIndex}][id]`, pageHeader.id);
        formData.append(`settings[${pageHeaderIndex}][title]`, pageHeader.title || '');
        formData.append(`settings[${pageHeaderIndex}][description]`, pageHeader.description || '');
        formData.append(`settings[${pageHeaderIndex}][order_no]`, pageHeader.order_no);
        formData.append(`settings[${pageHeaderIndex}][is_active]`, pageHeader.is_active ? '1' : '0');
        if (pageHeader.imageFile) {
          console.log('Page Header imageFile found:', pageHeader.imageFile);
          formData.append(`settings[${pageHeaderIndex}][image]`, pageHeader.imageFile);
        } else {
          console.log('No pageHeader.imageFile found');
        }
        if (pageHeader.image === null && pageHeader.imageFile === null && (!pageHeader.title && !pageHeader.description)) {
          formData.append(`settings[${pageHeaderIndex}][delete_image]`, '1');
        }
      } else {
        console.log('No pageHeader found - pageHeader is null');
      }

      // Debug: Log all form data being sent
      console.log('All form data being sent:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await apiService.post('/admin/homepage-settings/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        console.log('Homepage settings update response:', response);
        setSuccess('Homepage settings updated successfully');
        setSnackbarMessage('Homepage settings updated successfully');
        setSnackbarOpen(true);
        fetchSettings(); // Refresh data
        
        // Trigger homepage refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('homepageSettingsUpdated'));
      } else {
        setError(response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save homepage settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle image deletion
  const handleImageDelete = async (section, index) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this image? This will permanently remove the image file and clear all associated data (title, description, etc.).')) {
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      // Get the current card data
      let card;
      if (section === 'category_cards') {
        card = categoryCards[index];
      } else if (section === 'two_cards') {
        card = twoCards[index];
      } else if (section === 'page_header') {
        card = pageHeader;
      }
      
      if (!card || !card.id) {
        setError('Card not found');
        return;
      }
      
      // Prepare data for backend deletion
      const deleteData = {
        id: card.id,
        delete_image: true,
        title: null,
        description: null,
        metadata: null
      };
      
      // Call backend to delete image and clear data
      const response = await apiService.post('/admin/homepage-settings/update', {
        settings: [deleteData]
      });
      
      if (response.success) {
        // Update frontend state
        if (section === 'category_cards') {
          const updatedCards = [...categoryCards];
          updatedCards[index] = { 
            ...updatedCards[index], 
            image: null, 
            imageFile: null,
            title: null,
            description: null,
            metadata: null
          };
          setCategoryCards(updatedCards);
        } else if (section === 'two_cards') {
          const updatedCards = [...twoCards];
          updatedCards[index] = { 
            ...updatedCards[index], 
            image: null, 
            imageFile: null,
            title: null,
            description: null,
            metadata: null
          };
          setTwoCards(updatedCards);
        } else if (section === 'page_header') {
          // Update page header state
          const updatedHeader = { 
            ...pageHeader, 
            image: null, 
            imageFile: null,
            title: null,
            description: null,
            metadata: null
          };
          setPageHeader(updatedHeader);
        }
        
        setSnackbarMessage('Image deleted successfully');
        setSnackbarOpen(true);
      } else {
        setError(response.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    } finally {
      setSaving(false);
    }
  };

  // Image preview component
  const ImagePreview = ({ setting, section, index }) => {
    // Show uploaded file preview if available, otherwise show existing image
    const imageUrl = setting.imageFile 
      ? URL.createObjectURL(setting.imageFile)
      : setting.image 
        ? getHomepageImageUrl(setting.image)
        : null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {imageUrl && (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={imageUrl}
              alt={setting.title}
              sx={{
                width: section === 'category_cards' ? 100 : 200,
                height: section === 'category_cards' ? 75 : 112,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleImageDelete(section, index)}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
                width: 24,
                height: 24,
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box>
          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id={`image-upload-${section}-${index}`}
            type="file"
            onChange={(e) => handleImageUpload(section, index, e.target.files[0])}
          />
          <label htmlFor={`image-upload-${section}-${index}`}>
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              size="small"
            >
              {imageUrl ? 'Change Image' : 'Upload Image'}
            </Button>
          </label>
          {imageUrl && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              size="small"
              onClick={() => handleImageDelete(section, index)}
              sx={{ ml: 1 }}
            >
              Delete
            </Button>
          )}
          <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {section === 'category_cards' 
              ? 'Recommended: 800×600px, Max: 1MB'
              : 'Recommended: 1920×1080px, Max: 1.5MB'
            }
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Homepage Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSettings}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<ImageIcon />}
            onClick={() => setShowImageGallery(!showImageGallery)}
            disabled={loading}
          >
            {showImageGallery ? 'Hide Images' : 'View All Images'}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Delete />}
            onClick={restoreDefaults}
            disabled={loading || saving}
          >
            Restore Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            All Uploaded Images
          </Typography>
          
          {/* Category Cards Images */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Category Cards Images
            </Typography>
            <Grid container spacing={2}>
              {categoryCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {card.title || `Category Card ${index + 1}`}
                      </Typography>
                      {card.imageFile ? (
                        <Box
                          component="img"
                          src={URL.createObjectURL(card.imageFile)}
                          alt={card.title}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                      ) : card.image ? (
                        <Box>
                          {console.log(`Category Cards Gallery - Card ${index}:`, card)}
                          {console.log(`Category Cards Gallery - Image path: ${card.image}`)}
                          {console.log(`Category Cards Gallery - Image path: ${card.image}`)}
                          {console.log(`Category Cards Gallery - Full URL: ${getHomepageImageUrl(card.image)}`)}
                          <Box
                            component="img"
                            src={getHomepageImageUrl(card.image)}
                            alt={card.title}
                            sx={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                            }}
                            onError={(e) => {
                              console.log('Category Cards Gallery - Image failed to load:', e.target.src);
                            }}
                            onLoad={() => {
                              console.log('Category Cards Gallery - Image loaded successfully');
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 150,
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleImageDelete('category_cards', index)}
                          disabled={saving}
                        >
                          {saving ? 'Deleting...' : 'Delete Image'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Two Cards Images */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Two Cards Images
            </Typography>
            <Grid container spacing={2}>
              {twoCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {card.title || `Two Card ${index + 1}`}
                      </Typography>
                      {card.imageFile ? (
                        <Box
                          component="img"
                          src={URL.createObjectURL(card.imageFile)}
                          alt={card.title}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                      ) : card.image ? (
                        <Box>
                          {console.log(`Two Cards Gallery - Card ${index}:`, card)}
                          {console.log(`Two Cards Gallery - Image path: ${card.image}`)}
                          {console.log(`Two Cards Gallery - Image path: ${card.image}`)}
                          {console.log(`Two Cards Gallery - Full URL: ${getHomepageImageUrl(card.image)}`)}
                          <Box
                            component="img"
                            src={getHomepageImageUrl(card.image)}
                            alt={card.title}
                            sx={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                            }}
                            onError={(e) => {
                              console.log('Two Cards Gallery - Image failed to load:', e.target.src);
                            }}
                            onLoad={() => {
                              console.log('Two Cards Gallery - Image loaded successfully');
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 150,
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleImageDelete('two_cards', index)}
                          disabled={saving}
                        >
                          {saving ? 'Deleting...' : 'Delete Image'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* Category Cards Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Category Cards</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#000', color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info />
              <Typography variant="subtitle2">Category Card Upload Guidelines:</Typography>
            </Box>
            <Typography variant="body2">
              • Recommended Dimensions: 800 × 600 px (4:3 ratio)<br/>
              • Max File Size: 1 MB<br/>
              • Formats: JPG, JPEG, PNG<br/>
              • Use clean, high-quality images for best appearance on homepage
            </Typography>
          </Paper>

          {/* Uploaded Images Gallery */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Uploaded Category Card Images
            </Typography>
            <Grid container spacing={2}>
              {categoryCards.map((card, index) => (
                <Grid item xs={12} sm={6} key={card.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {card.title || `Category Card ${index + 1}`}
                      </Typography>
                      
                      <ImagePreview 
                        setting={card} 
                        section="category_cards" 
                        index={index} 
                      />

                      <FormControl fullWidth margin="normal">
                        <InputLabel>Select Category </InputLabel>
                        <Select
                          value={card.metadata?.key || ''}
                          color={card.metadata?.key ? 'primary' : 'default'}
                          onChange={(e) => {
                            const selectedSlug = e.target.value;
                            const selectedCategory = availableCategories.find(cat => cat.slug === selectedSlug);

                            // Update local state instantly
                            if (selectedCategory) {
                              const updatedCards = [...categoryCards];
                              updatedCards[index] = {
                                ...updatedCards[index],
                                title: selectedCategory.name,        // instantly update title
                                metadata: { key: selectedCategory.slug, categoryId: selectedCategory.id },
                              };
                              setCategoryCards(updatedCards);       // <-- instantly reflect in UI

                              setSnackbarMessage(`Category "${selectedCategory.name}" selected for Card ${index + 1}`);
                              setSnackbarOpen(true);
                            } else {
                              const updatedCards = [...categoryCards];
                              updatedCards[index] = {
                                ...updatedCards[index],
                                title: '',
                                metadata: { key: '' },
                              };
                              setCategoryCards(updatedCards);
                            }
                          }}
                          label="Select Category (Optional)"
                        >
                          <MenuItem value="">
                            <em>No Category Selected</em>
                          </MenuItem>
                          {availableCategories.map((category) => (
                            <MenuItem key={category.id} value={category.slug}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={card.is_active}
                            onChange={(e) => handleInputChange('category_cards', index, 'is_active', e.target.checked)}
                          />
                        }
                        label="Active"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Two Cards Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Two Cards Section (ModernHeroBanner)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#000', color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info />
              <Typography variant="subtitle2">TwoCardsSection Guidelines:</Typography>
            </Box>
            <Typography variant="body2">
              • Recommended Dimensions: 1920 × 1080 px (16:9 ratio)<br/>
              • Max File Size: 1.5 MB<br/>
              • Formats: JPG, JPEG, PNG<br/>
              • Add short, engaging descriptions (2–3 lines)
            </Typography>
          </Paper>

          {/* Uploaded Images Gallery */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Uploaded Two Cards Images
            </Typography>
            <Grid container spacing={2}>
              {twoCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={6} key={card.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {card.title || `Card ${index + 1}`}
                      </Typography>
                      
                      <ImagePreview 
                        setting={card} 
                        section="two_cards" 
                        index={index} 
                      />

                      <TextField
                        fullWidth
                        label="Description"
                        value={card.description || ''}
                        onChange={(e) => handleInputChange('two_cards', index, 'description', e.target.value)}
                        margin="normal"
                        multiline
                        rows={3}
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={card.is_active}
                            onChange={(e) => handleInputChange('two_cards', index, 'is_active', e.target.checked)}
                          />
                        }
                        label="Active"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Page Header Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Page Header</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#000', color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info />
              <Typography variant="subtitle2">Page Header Guidelines:</Typography>
            </Box>
            <Typography variant="body2">
              • Recommended Dimensions: 1920 × 1080 px (16:9 ratio)<br/>
              • Max File Size: 2 MB<br/>
              • Formats: JPG, JPEG, PNG<br/>
              • Used as background for page headers across the site
            </Typography>
          </Paper>

          {pageHeader && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current Page Header
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Page Header Image
                  </Typography>
                  
                  <ImagePreview 
                    setting={pageHeader} 
                    section="page_header" 
                    index={0} 
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={pageHeader.is_active}
                        onChange={(e) => {
                          const updatedHeader = { ...pageHeader, is_active: e.target.checked };
                          setPageHeader(updatedHeader);
                        }}
                      />
                    }
                    label="Active"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Box>
          )}

          {!pageHeader && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No page header settings found. Initialize defaults to create page header settings.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={initializePageHeader}
                size="large"
              >
                Initialize Page Header Settings
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Initialize Defaults Button */}
      {(categoryCards.length === 0 && twoCards.length === 0 && !pageHeader) && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={initializeDefaults}
            size="large"
          >
            Initialize Default Homepage Settings
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default HomepageSettings;
