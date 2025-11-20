import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Inventory,
  AttachMoney,
  People,
  Assessment,
  LocalShipping,
  Add,
  CheckCircle,
  Pending,
  Warning,
  TrendingFlat,
  Error,
  Refresh,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { useApi } from '../hooks/useApi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const { getSetting, getStockStatus, refreshSettings } = useSettings();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Refresh settings first to ensure we have latest threshold values
      await refreshSettings();
      await fetchDashboardData();
      const activities = await fetchRecentActivities();
      setRecentActivities(activities);
    };
    loadDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats from the new API endpoint
      const response = await apiService.get('/admin/reports/dashboard-stats');
      
      if (response.success) {
        let dashboardData = response.data;
        
        // Fetch ALL inventory data (same as inventory page) to get accurate counts
        try {
          const inventoryResponse = await apiService.get('/admin/inventory');
          if (inventoryResponse.success) {
            const allProducts = inventoryResponse.data?.data || inventoryResponse.data || [];
            
            // Calculate accurate low stock and out of stock counts from ALL products
            const lowStockProducts = allProducts.filter(product => {
              // Check if ANY variant has low stock (not the total sum)
              const hasLowStockVariant = product.variants && product.variants.some(variant => {
                const variantQuantity = Number(variant.quantity) || 0;
                const stockStatus = getStockStatus(variantQuantity);
                return stockStatus.status === 'low_stock';
              });
              return hasLowStockVariant;
            });
            
            const outOfStockProducts = allProducts.filter(product => {
              // Check if ANY variant is out of stock (not the total sum)
              const hasOutOfStockVariant = product.variants && product.variants.some(variant => {
                const variantQuantity = Number(variant.quantity) || 0;
                const stockStatus = getStockStatus(variantQuantity);
                return stockStatus.status === 'out_of_stock';
              });
              return hasOutOfStockVariant;
            });
            
            // Update dashboard data with accurate counts
            dashboardData.inventory = {
              ...dashboardData.inventory,
              low_stock_products: lowStockProducts.length,
              out_of_stock_products: outOfStockProducts.length,
              total_products: allProducts.length
            };
            
            // Store all products for accurate calculations
            dashboardData.all_products = allProducts;
          }
        } catch (inventoryErr) {
          console.error('Failed to fetch inventory data for accurate counts:', inventoryErr);
        }
        
        setDashboardData(dashboardData);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activities (real data)
  const fetchRecentActivities = async () => {
    try {
      const [ordersResponse, paymentsResponse] = await Promise.all([
        apiService.get('/admin/orders?limit=5'),
        apiService.get('/admin/payments?limit=5')
      ]);
      
      const activities = [];
      
      // Add recent orders
      if (ordersResponse.success && ordersResponse.data?.data) {
        ordersResponse.data.data.forEach(order => {
          activities.push({
            id: `order-${order.id}`,
            type: 'order',
            message: `New order #${order.order_number} received`,
            time: new Date(order.created_at).toLocaleString(),
            status: 'success',
            orderId: order.id
          });
        });
      }
      
      // Add recent payments
      if (paymentsResponse.success && paymentsResponse.data?.data) {
        paymentsResponse.data.data.forEach(payment => {
          activities.push({
            id: `payment-${payment.id}`,
            type: 'payment',
            message: `Payment received for order #${payment.order_number}`,
            time: new Date(payment.created_at).toLocaleString(),
            status: 'success',
            amount: payment.amount
          });
        });
      }
      
      // Sort by time and take latest 10
      return activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      return [];
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSettings();
      await fetchDashboardData();
      const activities = await fetchRecentActivities();
      setRecentActivities(activities);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };


  // Default values for when data is null/undefined
  const getDefaultData = () => ({
    this_month: {
      revenue: 0,
      orders: 0,
      customers: 0,
    },
    last_month: {
      revenue: 0,
      orders: 0,
    },
    growth: {
      revenue_growth: 0,
      orders_growth: 0,
    },
    inventory: {
      total_products: 0,
      low_stock: 0,
      out_of_stock: 0,
    },
    recent_orders: [],
    top_products: [],
  });

  const data = dashboardData || getDefaultData();
  
  // Get computed total quantity for a product (same logic as inventory page)
  const getComputedTotal = (product) => {
    const invQty = product.inventory && typeof product.inventory.quantity !== 'undefined'
      ? Number(product.inventory.quantity) || 0
      : null;
    const variantsQty = Array.isArray(product.variants)
      ? product.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0)
      : null;
    const totalQtyField = typeof product.total_quantity !== 'undefined' ? Number(product.total_quantity) || 0 : 0;
    return invQty !== null ? invQty : (variantsQty !== null ? variantsQty : totalQtyField);
  };
  

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<Error />}
          title="Failed to Load Dashboard"
          description={error?.toString() || 'An error occurred while loading the dashboard'}
          actionLabel="Retry"
          onAction={fetchDashboardData}
          variant="error"
        />
      </Box>
    );
  }

  const statsData = [];


  // Top products are now fetched from the API via data.top_products

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}>
            Welcome to Zer Zabar Admin
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Here's what's happening with your store today.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh sx={{ 
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }} />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '20',
              borderColor: theme.palette.primary.main,
            },
            '&:disabled': {
              borderColor: theme.palette.action.disabled,
              color: theme.palette.action.disabled,
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards removed per requirements */}

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4,    display: 'flex', flexWrap: 'nowrap',   }} >
        {/* Monthly Revenue Stats */}
        <Grid item xs={12} md={6} lg={6} sm={6}   >
          <Card>
            <CardContent sx={{ p: 3  }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Monthly Revenue Overview
              </Typography>
              <Grid container spacing={2} sx={{p:0}}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                 p:2,
                    backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.primary.main}40`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                     flexWrap: 'nowrap',
                  }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        PKR {(data.this_month?.revenue || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        This Month Revenue
                      </Typography>
                    </Box>
                   
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
               p:2,
                    backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.success.main}40`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                        {data.this_month?.orders || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        This Month Orders
                      </Typography>
                    </Box>
                  
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
               p:2,
                    backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.warning.main}40`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                        {data.today?.orders || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Today's Orders
                      </Typography>
                    </Box>
                  
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Top 5 Products by Quantity (Last 7 Days)
              </Typography>
              {data.top_products_by_quantity && data.top_products_by_quantity.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F1F3F5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Sold</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Variants</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data.top_products_by_quantity || []).slice(0, 5).map((product, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {product.product_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={`${product.total_sold}`} color="success" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={`${product.variant_count}`} color="primary" size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {product.product_sku}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <EmptyState
                  icon={<Assessment />}
                  title="No Products Yet"
                  description="No product sales data available for the last 7 days."
                  size="small"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              Recent Orders
            </Typography>
           
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Email ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Phone No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Payment Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const all = Array.isArray(data.recent_orders) ? data.recent_orders : [];
                  const now = new Date();
                  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

                  const isToday = (d) => {
                    const dt = new Date(d);
                    return dt >= startOfToday && dt <= endOfToday;
                  };
                  const isInLast7Days = (d) => {
                    const dt = new Date(d);
                    return dt >= sevenDaysAgo && dt <= endOfToday;
                  };

                  const todays = all.filter(o => isToday(o.created_at));
                  const toShow = todays.length > 0 ? todays : all.filter(o => isInLast7Days(o.created_at));

                  return toShow && toShow.length > 0 ? (
                    toShow.map((order) => (
                  <TableRow
                    key={order.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      #{order.order_number}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {order.items && order.items.length > 0 ? (
                          order.items.slice(0, 2).map((item, index) => (
                            <Typography key={index} variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                              {item.product_name || item.product?.name || 'Unknown Product'}
                              {item.quantity > 1 && ` (x${item.quantity})`}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            No items
                          </Typography>
                        )}
                        {order.items && order.items.length > 2 && (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            +{order.items.length - 2} more items
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {order.customer_name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {order.customer_email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {order.customer_phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {typeof order.shipping_address === 'string' ? order.shipping_address.substring(0, 30) + '...' : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.payment_method || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: `${theme.palette.primary.main}20`,
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={order.status === 'delivered' ? <CheckCircle /> : <Pending />}
                        label={order.status}
                        size="small"
                        sx={{
                          backgroundColor: order.status === 'delivered' ? `${theme.palette.success.main}20` : `${theme.palette.warning.main}20`,
                          color: order.status === 'delivered' ? theme.palette.success.main : theme.palette.warning.main,
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                    ))
                  ) : (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <EmptyState
                        icon={<ShoppingCart />}
                        title="No Orders Yet"
                        description="No orders have been placed yet. Orders will appear here once customers start shopping."
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  )
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

    </Box>
  );
};

export default Dashboard;
