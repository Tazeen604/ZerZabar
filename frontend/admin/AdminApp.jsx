import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './contexts/ErrorContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import LowStock from './pages/LowStock';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import AddProduct from './pages/AddProduct';
import AddCategory from './pages/AddCategory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const AdminAppContent = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          Loading...
        </Box>
      </MuiThemeProvider>
    );
  }

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </MuiThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ErrorProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: `calc(100% - ${sidebarOpen ? 280 : 60}px)`,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Top Bar */}
          <TopBar sidebarOpen={sidebarOpen} />
          
          {/* Page Content */}
          <Box
            sx={{
              flexGrow: 1,
              mt: 8, // Account for fixed top bar
              backgroundColor: theme.palette.background.default,
              minHeight: 'calc(100vh - 64px)',
              overflow: 'auto',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/add-category" element={<AddCategory />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product-management" element={<ProductManagement />} />
              <Route path="/category-management" element={<CategoryManagement />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/low-stock" element={<LowStock />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Box>
        </Box>
      </Box>
        </MuiThemeProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
};

const AdminApp = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AdminAppContent />
        </NotificationProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default AdminApp;
