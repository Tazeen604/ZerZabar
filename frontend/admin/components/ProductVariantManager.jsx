import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import { Add, Delete, Warning } from '@mui/icons-material';

const ProductVariantManager = ({
  variants,
  onVariantsChange,
  availableSizes = [],
  availableColors = [],
}) => {
  const [currentVariant, setCurrentVariant] = useState({
    size: '',
    color: '',
    quantity: '',
    price: '',
    sale_price: '',
    sku: '',
  });
  const [errors, setErrors] = useState({});

  const generateSKU = (size, color) => {
    if (size && color) {
      return `${size.toUpperCase()}-${color.toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    return '';
  };

  const validateVariant = () => {
    const newErrors = {};
    
    if (!currentVariant.size) {
      newErrors.size = 'Size is required';
    }
    if (!currentVariant.color) {
      newErrors.color = 'Color is required';
    }
    const quantityNum = parseInt(currentVariant.quantity, 10);
    if (!quantityNum || quantityNum <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    const priceNum = parseFloat(currentVariant.price);
    if (!priceNum || priceNum <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    const saleNum = currentVariant.sale_price !== '' && currentVariant.sale_price !== null
      ? parseFloat(currentVariant.sale_price)
      : NaN;
    if (!isNaN(saleNum)) {
      if (saleNum <= 0) {
        newErrors.sale_price = 'Selling price must be greater than 0';
      } else if (!isNaN(priceNum) && saleNum >= priceNum) {
        newErrors.sale_price = 'Selling price must be less than regular price';
      }
    }

    // Check for duplicate size-color combination
    const duplicate = variants.find(
      v => v.size === currentVariant.size && v.color === currentVariant.color
    );
    if (duplicate) {
      newErrors.duplicate = `Variant with ${currentVariant.size} - ${currentVariant.color} already exists`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddVariant = () => {
    if (!validateVariant()) {
      return;
    }

    const sku = generateSKU(currentVariant.size, currentVariant.color);
    const newVariant = {
      ...currentVariant,
      quantity: parseInt(currentVariant.quantity) || 0,
      price: Number.isFinite(parseFloat(currentVariant.price)) ? Math.round(parseFloat(currentVariant.price)) : 0,
      sale_price: currentVariant.sale_price !== '' && currentVariant.sale_price !== null
        ? Math.round(parseFloat(currentVariant.sale_price))
        : null,
      sku,
    };

    onVariantsChange([...variants, newVariant]);

    // Reset form
    setCurrentVariant({
      size: '',
      color: '',
      quantity: '',
      price: '',
      sale_price: '',
      sku: '',
    });
    setErrors({});
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
  };

  const handleFieldChange = (field, value) => {
    setCurrentVariant(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-generate SKU when size or color changes
      if (field === 'size' || field === 'color') {
        const newSize = field === 'size' ? value : prev.size;
        const newColor = field === 'color' ? value : prev.color;
        updated.sku = generateSKU(newSize, newColor);
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Product Variants
      </Typography>

      {/* Add Variant Form */}
      <Card sx={{ mb: 3, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Add New Variant
          </Typography>

          {errors.duplicate && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.duplicate}
        </Alert>
          )}

          <Grid container spacing={3}>
            {/* Size Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.size}>
                <InputLabel>Size *</InputLabel>
                <Select
                  value={currentVariant.size}
                  onChange={(e) => handleFieldChange('size', e.target.value)}
                  label="Size *"
                >
                  <MenuItem value="">
                    <em>Select a size</em>
                  </MenuItem>
                  {availableSizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
                {errors.size && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.size}
                  </Typography>
                )}
              </FormControl>
              {availableSizes.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Available sizes: {availableSizes.join(', ')}
                </Typography>
              )}
            </Grid>

            {/* Color Radio Buttons */}
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.color} fullWidth>
                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Color *
                </FormLabel>
                <RadioGroup
                  value={currentVariant.color}
                  onChange={(e) => handleFieldChange('color', e.target.value)}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  {availableColors.map((color) => (
                    <FormControlLabel
                      key={color.name}
                      value={color.name}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: color.hex || '#ccc',
                              borderRadius: '50%',
                              mr: 1,
                              border: '2px solid #ddd'
                            }}
                          />
                          {color.name}
                        </Box>
                      }
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        px: 2,
                        py: 0.5,
                        mr: 0,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
                {errors.color && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.color}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity *"
                type="number"
                value={currentVariant.quantity}
                onChange={(e) => handleFieldChange('quantity', e.target.value)}
                error={!!errors.quantity}
                helperText={errors.quantity}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price *"
                type="number"
                value={currentVariant.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>

            {/* Selling Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Selling Price (Optional)"
                type="number"
                value={currentVariant.sale_price}
                onChange={(e) => handleFieldChange('sale_price', e.target.value)}
                error={!!errors.sale_price}
                helperText={errors.sale_price || "Leave empty to use regular price"}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>

            {/* SKU */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={currentVariant.sku}
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim();
                  handleFieldChange('sku', trimmedValue);
                }}
                error={!!errors.sku}
                helperText={errors.sku || "Auto-generated based on size and color, but editable"}
                placeholder="Auto-generated SKU"
                sx={{
                  '& .MuiInputBase-input': {
                    textTransform: 'uppercase',
                  },
                }}
              />
            </Grid>

            {/* Add Variant Button */}
            <Grid item xs={12}>
          <Button
            variant="contained"
                startIcon={<Add />}
                onClick={handleAddVariant}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#FFC700',
                  }
                }}
              >
                Add Variant
          </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Added Variants List */}
      {variants.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Added Variants ({variants.length})
          </Typography>

          <Grid container spacing={2}>
            {variants.map((variant, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ position: 'relative' }}>
                  <CardContent>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveVariant(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#f44336'
                      }}
                    >
                      <Delete />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: availableColors.find(c => c.name === variant.color)?.hex || '#ccc',
                          borderRadius: '50%',
                          mr: 1,
                          border: '2px solid #ddd'
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {variant.size}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Color: {variant.color}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Quantity: {variant.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Price: Rs{variant.price}
                    </Typography>
                    {variant.sale_price && (
                      <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                        Sale Price: Rs{variant.sale_price}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      SKU: {variant.sku}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {variants.length === 0 && (
        <Alert severity="info">
          No variants added yet. Please add at least one variant.
        </Alert>
      )}
    </Box>
  );
};

export default ProductVariantManager;
