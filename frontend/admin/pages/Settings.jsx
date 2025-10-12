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
  Refresh,
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
        // Refresh settings from server to ensure consistency
        await fetchSettings();
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSettings}
            disabled={loading}
            sx={{
              borderColor: '#FFD700',
              color: '#FFD700',
              '&:hover': { 
                borderColor: '#F57F17',
                backgroundColor: '#FFF8E1'
              },
            }}
          >
            Refresh
          </Button>
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
      </Box>

      {/* Settings Categories */}
      <Grid container spacing={3}>
        {settingsCategories.map((category, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%'  }}>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      backgroundColor: category.color,
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {category.icon}
                  </Box>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {category.title}
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent>
                <List dense>
                  {category.settings.map((setting, settingIndex) => (
                    <React.Fragment key={settingIndex}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={setting.label}
                          secondary={setting.description}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                          secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        />
                        <ListItemSecondaryAction>
                          {setting.type === 'boolean' ? (
                            <Switch
                              checked={settings[setting.key]}
                              onChange={(e) => handleInputChange(setting.key, e.target.checked)}
                              color="primary"
                            />
                          ) : setting.type === 'select' ? (
                            <Chip
                              label={settings[setting.key]}
                              onClick={() => handleEditDialog(setting.key, settings[setting.key])}
                              sx={{ cursor: 'pointer' }}
                            />
                          ) : setting.type === 'color' ? (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: settings[setting.key],
                                borderRadius: 1,
                                border: '2px solid #ddd',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleEditDialog(setting.key, settings[setting.key])}
                            />
                          ) : (
                            <Chip
                              label={settings[setting.key]}
                              onClick={() => handleEditDialog(setting.key, settings[setting.key])}
                              sx={{ cursor: 'pointer' }}
                            />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {settingIndex < category.settings.length - 1 && <Divider />}
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
