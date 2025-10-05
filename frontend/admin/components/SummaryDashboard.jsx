import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  People,
  Assessment,
  Download,
  Refresh,
  GetApp,
  Inventory,
  Receipt,
  Star,
  Warning,
  CheckCircle,
  Pending,
  LocalShipping,
  MonetizationOn,
  BarChart,
  PieChart,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const SummaryDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardStats, salesReport, inventoryReport, customerStats] = await Promise.all([
        apiService.get('/admin/reports/dashboard-stats'),
        apiService.get(`/admin/reports/sales?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get('/admin/reports/inventory'),
        apiService.get(`/admin/reports/customer-stats?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
      ]);

      setDashboardData({
        dashboard: dashboardStats.success ? dashboardStats.data : null,
        sales: salesReport.success ? salesReport.data : null,
        inventory: inventoryReport.success ? inventoryReport.data : null,
        customers: customerStats.success ? customerStats.data : null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateFrom = () => {
    const days = parseInt(dateRange);
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const getDateTo = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleExport = (type) => {
    console.log(`Exporting ${type} summary...`);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
          Business Summary Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Complete overview of your ecommerce business performance
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="365">Last year</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              label="From Date"
              type="date"
              value={getDateFrom()}
              sx={{ width: 150 }}
            />
            
            <TextField
              size="small"
              label="To Date"
              type="date"
              value={getDateTo()}
              sx={{ width: 150 }}
            />
            
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchDashboardData}
              sx={{
                backgroundColor: '#FFD700',
                color: '#2C2C2C',
                '&:hover': { backgroundColor: '#F57F17' },
              }}
            >
              Refresh
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleExport('summary')}
            >
              Export Summary
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ₹{dashboardData?.dashboard?.this_month?.revenue || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  +{dashboardData?.dashboard?.growth?.revenue_growth || 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#2196F3', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {dashboardData?.dashboard?.this_month?.orders || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  +{dashboardData?.dashboard?.growth?.orders_growth || 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customers */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#FF9800', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {dashboardData?.customers?.total_customers || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Customers
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  {dashboardData?.customers?.new_customers || 0} new
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#9C27B0', mr: 2 }}>
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {dashboardData?.inventory?.summary?.total_products || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning sx={{ color: '#F44336', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                  {dashboardData?.inventory?.summary?.low_stock || 0} low stock
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Sales Performance
                </Typography>
                <Tooltip title="Export Sales Data">
                  <IconButton onClick={() => handleExport('sales')}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#E8F5E8',
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    ₹{dashboardData?.sales?.totals?.total_revenue || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#E3F2FD',
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Total Orders
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                    {dashboardData?.sales?.totals?.total_orders || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#FFF3E0',
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Average Order Value
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    ₹{dashboardData?.sales?.totals?.average_order_value || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Status */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Inventory Status
                </Typography>
                <Tooltip title="Export Inventory Data">
                  <IconButton onClick={() => handleExport('inventory')}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#E8F5E8',
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    In Stock
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {dashboardData?.inventory?.summary?.in_stock || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#FFF3E0',
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Low Stock
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    {dashboardData?.inventory?.summary?.low_stock || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#FFEBEE',
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Out of Stock
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                    {dashboardData?.inventory?.summary?.out_of_stock || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Recent Orders
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
                {(dashboardData?.dashboard?.recent_orders || []).slice(0, 10).map((order, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#F8F9FA',
                    borderRadius: 1,
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        #{order.order_number}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.user?.name || 'Customer'} • {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ₹{order.total_amount}
                      </Typography>
                      <Chip
                        label={order.status}
                        size="small"
                        color={order.status === 'delivered' ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Insights */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Business Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4CAF50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Revenue Growth"
                    secondary={`+${dashboardData?.dashboard?.growth?.revenue_growth || 0}% this month`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp sx={{ color: '#2196F3' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Growth"
                    secondary={`+${dashboardData?.dashboard?.growth?.orders_growth || 0}% this month`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <People sx={{ color: '#FF9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="New Customers"
                    secondary={`${dashboardData?.customers?.new_customers || 0} new customers this period`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#F44336' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Inventory Alert"
                    secondary={`${dashboardData?.inventory?.summary?.low_stock || 0} products need restocking`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummaryDashboard;



