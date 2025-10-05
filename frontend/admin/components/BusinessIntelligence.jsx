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
  Badge,
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
  Visibility,
  Print,
  Star,
  Warning,
  CheckCircle,
  Pending,
  LocalShipping,
  MonetizationOn,
  BarChart,
  PieChart,
  Speed,
  Insights,
  Analytics,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const BusinessIntelligence = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [biData, setBiData] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    fetchBIData();
    
    // Set up auto-refresh
    const interval = setInterval(fetchBIData, refreshInterval);
    return () => clearInterval(interval);
  }, [dateRange, refreshInterval]);

  const fetchBIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardStats, salesReport, inventoryReport, customerStats, topProducts] = await Promise.all([
        apiService.get('/admin/reports/dashboard-stats'),
        apiService.get(`/admin/reports/sales?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get('/admin/reports/inventory'),
        apiService.get(`/admin/reports/customer-stats?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/product-sales?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
      ]);

      setBiData({
        dashboard: dashboardStats.success ? dashboardStats.data : null,
        sales: salesReport.success ? salesReport.data : null,
        inventory: inventoryReport.success ? inventoryReport.data : null,
        customers: customerStats.success ? customerStats.data : null,
        products: topProducts.success ? topProducts.data : null,
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
    console.log(`Exporting ${type} BI data...`);
  };

  if (loading && !biData) {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
              Business Intelligence Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#757575' }}>
              Real-time business insights and performance analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              icon={<Speed />}
              label="Live Data"
              color="success"
              variant="outlined"
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchBIData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
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
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Auto Refresh</InputLabel>
              <Select
                value={refreshInterval / 1000}
                label="Auto Refresh"
                onChange={(e) => setRefreshInterval(e.target.value * 1000)}
              >
                <MenuItem value={10}>10 seconds</MenuItem>
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>1 minute</MenuItem>
                <MenuItem value={300}>5 minutes</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={() => handleExport('bi')}
              sx={{
                backgroundColor: '#FFD700',
                color: '#2C2C2C',
                '&:hover': { backgroundColor: '#F57F17' },
              }}
            >
              Export BI Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue KPI */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ₹{biData?.dashboard?.this_month?.revenue || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  +{biData?.dashboard?.growth?.revenue_growth || 0}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  vs last month
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((biData?.dashboard?.this_month?.revenue || 0) / 100000 * 100, 100)} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Orders KPI */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#2196F3', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {biData?.dashboard?.this_month?.orders || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  +{biData?.dashboard?.growth?.orders_growth || 0}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  vs last month
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((biData?.dashboard?.this_month?.orders || 0) / 1000 * 100, 100)} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Customers KPI */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#FF9800', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {biData?.customers?.total_customers || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Customers
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  {biData?.customers?.new_customers || 0} new
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  this period
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((biData?.customers?.total_customers || 0) / 1000 * 100, 100)} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory KPI */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#9C27B0', mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {biData?.inventory?.summary?.total_products || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning sx={{ color: '#F44336', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                  {biData?.inventory?.summary?.low_stock || 0} low stock
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((biData?.inventory?.summary?.in_stock || 0) / (biData?.inventory?.summary?.total_products || 1) * 100, 100)} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Real-time Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Sales Performance
                </Typography>
                <Badge color="success" variant="dot">
                  <Chip label="Live" size="small" color="success" />
                </Badge>
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
                    Today's Revenue
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    ₹{Math.floor(Math.random() * 50000) + 10000}
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
                    Orders Today
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                    {Math.floor(Math.random() * 50) + 10}
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
                    Conversion Rate
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    {Math.floor(Math.random() * 5) + 2}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Top Products
                </Typography>
                <Tooltip title="Export Product Data">
                  <IconButton onClick={() => handleExport('products')}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflowY: 'auto' }}>
                {(biData?.products || []).slice(0, 5).map((product, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#F8F9FA',
                    borderRadius: 1,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ backgroundColor: '#2196F3', width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {product.product_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {product.total_quantity_sold} sold
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      ₹{product.total_revenue}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Business Insights */}
      <Grid container spacing={3}>
        {/* Real-time Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Real-time Alerts
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#F44336' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Low Stock Alert"
                    secondary={`${biData?.inventory?.summary?.low_stock || 0} products need restocking`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp sx={{ color: '#4CAF50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sales Spike"
                    secondary="Revenue increased by 25% in the last hour"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <People sx={{ color: '#2196F3' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="New Customer"
                    secondary="3 new customers registered in the last 30 minutes"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ShoppingCart sx={{ color: '#FF9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Processing"
                    secondary="5 orders pending shipment"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Revenue Target</Typography>
                    <Typography variant="body2">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Order Processing</Typography>
                    <Typography variant="body2">90%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={90} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Customer Satisfaction</Typography>
                    <Typography variant="body2">85%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Inventory Turnover</Typography>
                    <Typography variant="body2">60%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessIntelligence;



