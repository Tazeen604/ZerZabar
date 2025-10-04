import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import {
  Save,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../src/services/api';

const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  const handleInputChange = (field, value) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      await apiService.post('/admin/categories', categoryForm);

      setSuccess('Category created successfully');
      setTimeout(() => {
        navigate('/admin/category-management');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C2C2C' }}>
          Add Category
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/category-management')}
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
            Add Category
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Category Details */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Category Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    placeholder="Enter category name"
                    value={categoryForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Enter category description"
                    multiline
                    rows={4}
                    value={categoryForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sort Order"
                    placeholder="Enter sort order"
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>

          {/* Category Status */}
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Category Status
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={categoryForm.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active Category"
              />
            </CardContent>
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

export default AddCategory;
