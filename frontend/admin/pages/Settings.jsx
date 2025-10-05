import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Save,
  Settings as SettingsIcon,
  Inventory,
  TrendingUp,
  Security,
  Notifications,
  Palette,
  Add,
  Edit,
  Delete,
  Check,
  Close,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    // Inventory Settings
    low_stock_threshold: 10,
    new_arrivals_days: 7,
    out_of_stock_threshold: 0,
    
    // Product Settings
    max_product_images: 5,
    
    // Notification Settings
    low_stock_notification: true,
    
    // Theme Settings
    default_theme: 'light',
    accent_color: '#FFD700',
    primary_color: '#2C2C2C',
  });

  const [editDialog, setEditDialog] = useState({ open: false, key: '', value: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/settings');
      if (response.success) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiService.post('/admin/settings', settings);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEditDialog = (key, value) => {
    setEditDialog({ open: true, key, value });
  };

  const handleEditSave = () => {
    setSettings(prev => ({
      ...prev,
      [editDialog.key]: editDialog.value
    }));
    setEditDialog({ open: false, key: '', value: '' });
  };

  const settingsCategories = [
    {
      title: 'Inventory Management',
      icon: <Inventory />,
      color: '#4CAF50',
      settings: [
        { key: 'low_stock_threshold', label: 'Low Stock Threshold', type: 'number', description: 'Minimum quantity before marking as low stock' },
        { key: 'new_arrivals_days', label: 'New Arrivals Period (Days)', type: 'number', description: 'Number of days to consider products as new arrivals' },
        { key: 'out_of_stock_threshold', label: 'Out of Stock Threshold', type: 'number', description: 'Quantity below which product is considered out of stock' },
      ]
    },
    {
      title: 'Product Management',
      icon: <TrendingUp />,
      color: '#2196F3',
      settings: [
        { key: 'max_product_images', label: 'Max Product Images', type: 'number', description: 'Maximum number of images allowed per product' },
      ]
    },
    {
      title: 'Notifications',
      icon: <Notifications />,
      color: '#F44336',
      settings: [
        { key: 'low_stock_notification', label: 'Low Stock Notifications', type: 'boolean', description: 'Show notifications when stock is low' },
      ]
    },
    {
      title: 'Theme & Appearance',
      icon: <Palette />,
      color: '#607D8B',
      settings: [
        { key: 'default_theme', label: 'Default Theme', type: 'select', description: 'Default theme for the admin panel', options: ['light', 'dark', 'auto'] },
        { key: 'accent_color', label: 'Accent Color', type: 'color', description: 'Primary accent color for the admin panel' },
        { key: 'primary_color', label: 'Primary Color', type: 'color', description: 'Primary color for the admin panel' },
      ]
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            System Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Configure system-wide settings and thresholds
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#F57F17' },
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Settings Categories */}
      <Grid container spacing={4} justifyContent="center">
        {settingsCategories.map((category, index) => (
          <Grid item xs={12} sm={10} md={5} lg={4} xl={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      backgroundColor: category.color,
                      borderRadius: '50%',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 60,
                      minHeight: 60,
                    }}
                  >
                    {React.cloneElement(category.icon, { 
                      sx: { fontSize: 28, color: 'white' } 
                    })}
                  </Box>
                }
                title={
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {category.title}
                  </Typography>
                }
                sx={{ 
                  pb: 2,
                  '& .MuiCardHeader-content': {
                    minWidth: 0,
                  }
                }}
              />
              <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                <List sx={{ width: '100%' }}>
                  {category.settings.map((setting, settingIndex) => (
                    <React.Fragment key={settingIndex}>
                      <ListItem 
                        sx={{ 
                          px: 0, 
                          py: 2,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 1
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                            {setting.label}
                          </Typography>
                          {setting.type === 'boolean' ? (
                            <Switch
                              checked={settings[setting.key]}
                              onChange={(e) => handleInputChange(setting.key, e.target.checked)}
                              color="primary"
                              size="medium"
                            />
                          ) : setting.type === 'select' ? (
                            <Chip
                              label={settings[setting.key]}
                              onClick={() => handleEditDialog(setting.key, settings[setting.key])}
                              sx={{ 
                                cursor: 'pointer',
                                minWidth: 80,
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'white'
                                }
                              }}
                            />
                          ) : setting.type === 'color' ? (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                backgroundColor: settings[setting.key],
                                borderRadius: 2,
                                border: '3px solid #ddd',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }
                              }}
                              onClick={() => handleEditDialog(setting.key, settings[setting.key])}
                            />
                          ) : (
                            <Chip
                              label={settings[setting.key]}
                              onClick={() => handleEditDialog(setting.key, settings[setting.key])}
                              sx={{ 
                                cursor: 'pointer',
                                minWidth: 60,
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'white'
                                }
                              }}
                            />
                          )}
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1,
                            lineHeight: 1.4,
                            fontSize: '0.875rem'
                          }}
                        >
                          {setting.description}
                        </Typography>
                      </ListItem>
                      {settingIndex < category.settings.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, key: '', value: '' })}>
        <DialogTitle>Edit Setting</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Value"
            fullWidth
            variant="outlined"
            value={editDialog.value}
            onChange={(e) => setEditDialog(prev => ({ ...prev, value: e.target.value }))}
            type={settings[editDialog.key]?.toString().includes('#') ? 'color' : 'text'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, key: '', value: '' })}>
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
