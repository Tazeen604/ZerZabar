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
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import { useApi } from '../hooks/useApi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [salesSummary, setSalesSummary] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      await fetchDashboardData();
      const activities = await fetchRecentActivities();
      const sales = await fetchSalesSummary();
      setRecentActivities(activities);
      setSalesSummary(sales);
    };
    loadDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats from the new API endpoint
      const response = await apiService.get('/admin/reports/dashboard-stats');
      
      if (response.success) {
        setDashboardData(response.data);
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

  // Fetch sales summary data
  const fetchSalesSummary = async () => {
    try {
      const response = await apiService.get('/admin/reports/sales?period=daily&days=7');
      if (response.success && response.data?.report_data) {
        return response.data.report_data.map(item => ({
          day: new Date(item.period).toLocaleDateString('en-US', { weekday: 'long' }),
          date: new Date(item.period).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          revenue: item.total_revenue || 0,
          orders: item.orders_count || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching sales summary:', err);
    }
    return [];
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

  const statsData = [
    {
      title: 'Today\'s Orders',
      value: data.today?.orders || 0,
      change: `Revenue: PKR ${(data.today?.revenue || 0).toLocaleString()}`,
      changeType: 'positive',
      icon: <ShoppingCart />,
      color: '#4CAF50',
      bgColor: '#E8F5E8',
    },
    {
      title: 'This Month Revenue',
      value: `PKR ${(data.this_month?.revenue || 0).toLocaleString()}`,
      change: `${data.this_month?.orders || 0} orders`,
      changeType: 'positive',
      icon: <AttachMoney />,
      color: '#2196F3',
      bgColor: '#E3F2FD',
    },
    {
      title: 'Low Stock Items',
      value: data.inventory?.low_stock || 0,
      change: `${data.inventory?.out_of_stock || 0} out of stock`,
      changeType: data.inventory?.low_stock > 0 ? 'negative' : 'positive',
      icon: <Warning />,
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
    {
      title: 'Growth Rate',
      value: `${data.growth?.revenue_growth || 0}%`,
      change: `Orders: ${data.growth?.orders_growth || 0}%`,
      changeType: data.growth?.revenue_growth >= 0 ? 'positive' : 'negative',
      icon: data.growth?.revenue_growth >= 0 ? <TrendingUp /> : <TrendingDown />,
      color: data.growth?.revenue_growth >= 0 ? '#4CAF50' : '#F44336',
      bgColor: data.growth?.revenue_growth >= 0 ? '#E8F5E8' : '#FFEBEE',
    },
  ];


  const topProducts = [
    { name: 'Premium T-Shirt', sales: 245, revenue: '$2,450' },
    { name: 'Designer Jeans', sales: 189, revenue: '$3,780' },
    { name: 'Sports Shoes', sales: 156, revenue: '$2,340' },
    { name: 'Winter Jacket', sales: 134, revenue: '$4,020' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}>
          Welcome to Zer Zabar Admin
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Here's what's happening with your store today.
        </Typography>
      </Box>

      {/* Alert Banner */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#FFF3E0',
          border: `1px solid ${theme.palette.warning.main}`,
          borderRadius: '8px',
          p: 2,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar sx={{ backgroundColor: theme.palette.warning.main }}>
          <Assessment />
        </Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            System Notice
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            We regret to inform you that our server is currently experiencing technical difficulties.
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                border: '1px solid #E0E0E0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: stat.bgColor,
                      color: stat.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: stat.changeType === 'positive' ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 'bold',
                    }}
                  >
                    {stat.change} Last Week
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: `${theme.palette.primary.main}20`,
                    },
                  }}
                >
                  View More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Summary */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Sales Summary (Last 7 Days)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px', overflowY: 'auto' }}>
                {salesSummary && salesSummary.length > 0 ? (
                  salesSummary.map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? '#3C3C3C' : '#E3F2FD' }
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{item.day}</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{item.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                          PKR {item.revenue.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                          {item.orders} orders
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EmptyState
                      icon={<Assessment />}
                      title="No Sales Data"
                      description="No sales data available for the last 7 days."
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Top Selling Products
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px', overflowY: 'auto' }}>
                {data.top_products && data.top_products.length > 0 ? (
                  data.top_products.map((product, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? '#3C3C3C' : '#E3F2FD' }
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{product.product_name}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {product.total_sold} sold
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                      PKR {product.total_revenue?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  ))
                ) : (
                  <EmptyState
                    icon={<Assessment />}
                    title="No Products Yet"
                    description="No product sales data available. Start adding products to see analytics."
                    size="small"
                  />
                )}
              </Box>
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
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                backgroundColor: '#FFD700',
                color: '#2C2C2C',
                '&:hover': {
                  backgroundColor: '#F57F17',
                },
                px: 3,
                py: 1,
              }}
            >
              Create Order
            </Button>
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
                {data.recent_orders && data.recent_orders.length > 0 ? (
                  data.recent_orders.map((order) => (
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>🛍️</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {order.items?.length || 0} items
                        </Typography>
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
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Recent Activities
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivities.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#3C3C3C' : '#E3F2FD',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Avatar
                      sx={{
                        backgroundColor: 
                          activity.status === 'success' ? '#4CAF50' :
                          activity.status === 'warning' ? '#FF9800' :
                          activity.status === 'info' ? '#2196F3' : '#757575',
                        width: 32,
                        height: 32,
                      }}
                    >
                      {activity.type === 'order' && <ShoppingCart />}
                      {activity.type === 'inventory' && <Inventory />}
                      {activity.type === 'customer' && <People />}
                      {activity.type === 'payment' && <AttachMoney />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {activity.time}
                      </Typography>
                    </Box>
                    <Chip
                      label={activity.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          activity.status === 'success' ? `${theme.palette.success.main}20` :
                          activity.status === 'warning' ? `${theme.palette.warning.main}20` :
                          activity.status === 'info' ? `${theme.palette.primary.main}20` : `${theme.palette.text.secondary}20`,
                        color: 
                          activity.status === 'success' ? theme.palette.success.main :
                          activity.status === 'warning' ? theme.palette.warning.main :
                          activity.status === 'info' ? theme.palette.primary.main : theme.palette.text.secondary,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Recent Products
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(dashboardData?.products?.recent_products || []).map((product, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#3C3C3C' : '#E3F2FD',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {product.category?.name || 'No Category'} • Stock: {product.stock_quantity || 0}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      ₨{product.sale_price || product.price}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Inventory Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Total Quantity</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.total_quantity || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Available</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.available_quantity || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Reserved</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.reserved_quantity || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Low Stock Items</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.low_stock || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Out of Stock</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.out_of_stock || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Total Products</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>
                    {dashboardData?.products?.total_products || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Size & Color Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#212121' }}>
                Size & Color Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Top Sizes</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(dashboardData?.variants?.size_distribution || {}).slice(0, 5).map(([size, count]) => (
                      <Chip key={size} label={`${size}: ${count}`} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Top Colors</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(dashboardData?.variants?.color_distribution || {}).slice(0, 5).map(([color, count]) => (
                      <Chip key={color} label={`${color}: ${count}`} size="small" color="secondary" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
