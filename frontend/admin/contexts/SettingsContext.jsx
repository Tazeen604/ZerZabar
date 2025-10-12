import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../src/services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/settings');
      if (response.success) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Failed to fetch settings');
      // Set default settings if API fails
      setSettings({
        low_stock_threshold: 10,
        new_arrivals_days: 7,
        out_of_stock_threshold: 0,
        max_product_images: 5,
        auto_approve_products: false,
        require_product_approval: true,
        order_auto_confirm: false,
        order_confirmation_email: true,
        low_stock_notification: true,
        maintenance_mode: false,
        debug_mode: false,
        backup_frequency: 'daily',
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        default_theme: 'light',
        accent_color: '#FFD700',
        primary_color: '#2C2C2C',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await apiService.post('/admin/settings', newSettings);
      if (response.success) {
        // Update local settings immediately
        setSettings(prev => ({ ...prev, ...newSettings }));
        // Refresh settings from server to ensure consistency
        await fetchSettings();
        return true;
      } else {
        setError(response.message || 'Failed to update settings');
        return false;
      }
    } catch (err) {
      setError('Failed to update settings');
      return false;
    }
  };

  const getSetting = (key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const isLowStock = (quantity) => {
    const threshold = getSetting('low_stock_threshold', 10);
    return quantity <= threshold && quantity > 0;
  };

  const isOutOfStock = (quantity) => {
    const threshold = getSetting('out_of_stock_threshold', 0);
    return quantity <= threshold;
  };

  const isNewArrival = (createdAt) => {
    const days = getSetting('new_arrivals_days', 7);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return new Date(createdAt) >= cutoffDate;
  };

  const getStockStatus = (quantity) => {
    if (isOutOfStock(quantity)) {
      return { status: 'out_of_stock', label: 'Out of Stock', color: 'error' };
    } else if (isLowStock(quantity)) {
      return { status: 'low_stock', label: 'Low Stock', color: 'warning' };
    } else {
      return { status: 'in_stock', label: 'In Stock', color: 'success' };
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const value = {
    settings,
    loading,
    error,
    updateSettings,
    getSetting,
    isLowStock,
    isOutOfStock,
    isNewArrival,
    getStockStatus,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;

