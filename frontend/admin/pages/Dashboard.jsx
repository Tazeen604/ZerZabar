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
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Use the new dashboard API endpoint
      const response = await apiService.getDashboard();
      
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const statsData = [
    {
      title: 'Total Products',
      value: dashboardData?.stats?.total_products || 0,
      change: `${dashboardData?.stats?.active_products || 0} active`,
      changeType: 'positive',
      icon: <Assessment />,
      color: '#4CAF50',
      bgColor: '#E8F5E8',
    },
    {
      title: 'Total Revenue',
      value: `₨${dashboardData?.stats?.total_revenue || 0}`,
      change: `Avg: ₨${dashboardData?.stats?.average_price || 0}`,
      changeType: 'positive',
      icon: <AttachMoney />,
      color: '#2196F3',
      bgColor: '#E3F2FD',
    },
    {
      title: 'Low Stock Products',
      value: dashboardData?.stats?.low_stock_products || 0,
      change: `${dashboardData?.stats?.out_of_stock_products || 0} out of stock`,
      changeType: 'negative',
      icon: <Inventory />,
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
    {
      title: 'Featured Products',
      value: dashboardData?.stats?.featured_products || 0,
      change: `${dashboardData?.categories?.total_categories || 0} categories`,
      changeType: 'positive',
      icon: <TrendingUp />,
      color: '#9C27B0',
      bgColor: '#F3E5F5',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #RB5625 received',
      time: '2 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'inventory',
      message: 'Low stock alert for Product A',
      time: '15 minutes ago',
      status: 'warning',
    },
    {
      id: 3,
      type: 'customer',
      message: 'New customer registered',
      time: '1 hour ago',
      status: 'info',
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment received for order #RB9652',
      time: '2 hours ago',
      status: 'success',
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
          Welcome to Zer Zabar Admin
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Here's what's happening with your store today.
        </Typography>
      </Box>

      {/* Alert Banner */}
      <Box
        sx={{
          backgroundColor: '#FFF3E0',
          border: '1px solid #FFB74D',
          borderRadius: '8px',
          p: 2,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar sx={{ backgroundColor: '#FF9800' }}>
          <Assessment />
        </Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#E65100' }}>
            System Notice
          </Typography>
          <Typography variant="body2" sx={{ color: '#BF360C' }}>
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
                    <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>
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
                    <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: '#F44336', fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: stat.changeType === 'positive' ? '#4CAF50' : '#F44336',
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
                    color: '#757575',
                    textTransform: 'none',
                    '&:hover': {
                      color: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
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

      {/* Recent Orders Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
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
              + Create Order
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Email ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Phone No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Payment Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dashboardData?.recent_orders || []).map((order) => (
                  <TableRow
                    key={order.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#F8F9FA',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                      #{order.order_number}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
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
                        {order.user?.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        {order.user?.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        {order.billing_address?.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        {order.billing_address?.address || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.payment_method || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: '#E3F2FD',
                          color: '#2196F3',
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
                          backgroundColor: order.status === 'delivered' ? '#E8F5E8' : '#FFF3E0',
                          color: order.status === 'delivered' ? '#4CAF50' : '#FF9800',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#212121' }}>
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
                      backgroundColor: '#F8F9FA',
                      '&:hover': {
                        backgroundColor: '#E3F2FD',
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
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#212121' }}>
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        {activity.time}
                      </Typography>
                    </Box>
                    <Chip
                      label={activity.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          activity.status === 'success' ? '#E8F5E8' :
                          activity.status === 'warning' ? '#FFF3E0' :
                          activity.status === 'info' ? '#E3F2FD' : '#F5F5F5',
                        color: 
                          activity.status === 'success' ? '#4CAF50' :
                          activity.status === 'warning' ? '#FF9800' :
                          activity.status === 'info' ? '#2196F3' : '#757575',
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#212121' }}>
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
                      backgroundColor: '#F8F9FA',
                      '&:hover': {
                        backgroundColor: '#E3F2FD',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#212121' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        {product.category?.name || 'No Category'} • Stock: {product.stock_quantity || 0}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#212121' }}>
                Inventory Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Quantity</Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.total_quantity || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Available</Typography>
                  <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.available_quantity || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Reserved</Typography>
                  <Typography variant="body2" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.reserved_quantity || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Products with Variants</Typography>
                  <Typography variant="body2" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>
                    {dashboardData?.products?.products_with_variants || 0}
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
