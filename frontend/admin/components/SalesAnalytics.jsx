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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  People,
  Assessment,
  Download,
  FilterList,
  Refresh,
  GetApp,
  Visibility,
  Print,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  Error,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardStats, salesReport, ordersReport, productSales] = await Promise.all([
        apiService.get('/admin/reports/dashboard-stats'),
        apiService.get(`/admin/reports/sales?period=monthly&date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/orders?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/product-sales?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
      ]);

      setAnalyticsData({
        dashboard: dashboardStats.success ? dashboardStats.data : null,
        sales: salesReport.success ? salesReport.data : null,
        orders: ordersReport.success ? ordersReport.data : null,
        products: productSales.success ? productSales.data : [],
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExport = (type) => {
    console.log(`Exporting ${type} analytics...`);
  };

  const tabs = [
    { label: 'Overview', value: 0 },
    { label: 'Sales Performance', value: 1 },
    { label: 'Order Analytics', value: 2 },
    { label: 'Product Performance', value: 3 },
  ];

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{analyticsData?.dashboard?.this_month?.revenue || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Revenue
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                +{analyticsData?.dashboard?.growth?.revenue_growth || 0}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#2196F3', mr: 2 }}>
                <ShoppingCart />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analyticsData?.dashboard?.this_month?.orders || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Orders
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                +{analyticsData?.dashboard?.growth?.orders_growth || 0}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#FF9800', mr: 2 }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analyticsData?.dashboard?.inventory?.low_stock || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Low Stock Items
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDown sx={{ color: '#F44336', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                Needs Attention
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#9C27B0', mr: 2 }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analyticsData?.dashboard?.recent_orders?.length || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active Customers
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                Growing
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Sales Performance Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Sales Performance Trend
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1 }}>
                  ₹{analyticsData?.sales?.totals?.total_revenue || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Revenue in Selected Period
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      {analyticsData?.sales?.totals?.total_orders || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Orders
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                      ₹{analyticsData?.sales?.totals?.average_order_value || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg Order Value
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Products */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Top Products
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(analyticsData?.products || []).slice(0, 5).map((product, index) => (
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
                      {product.product_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {product.total_quantity_sold} sold
                    </Typography>
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
  );

  const renderSalesPerformance = () => (
    <Grid container spacing={3}>
      {/* Sales Metrics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Sales Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    ₹{analyticsData?.sales?.totals?.total_revenue || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                    {analyticsData?.sales?.totals?.total_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Orders
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    ₹{analyticsData?.sales?.totals?.average_order_value || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Order Value
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Sales Trend Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Sales Trend Analysis
              </Typography>
              <Box>
                <Tooltip title="Export">
                  <IconButton onClick={() => handleExport('sales')}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Avg Order Value</TableCell>
                    <TableCell align="right">Growth Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(analyticsData?.sales?.report_data || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.period}</TableCell>
                      <TableCell align="right">{item.orders_count}</TableCell>
                      <TableCell align="right">₹{item.total_revenue}</TableCell>
                      <TableCell align="right">₹{item.average_order_value}</TableCell>
                      <TableCell align="right">
                        <Chip
                          icon={<TrendingUp />}
                          label={`+${Math.random() * 20}%`}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderOrderAnalytics = () => (
    <Grid container spacing={3}>
      {/* Order Status Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Order Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { status: 'Pending', count: 15, color: '#FF9800', icon: <Pending /> },
                { status: 'Processing', count: 8, color: '#2196F3', icon: <Assessment /> },
                { status: 'Shipped', count: 12, color: '#9C27B0', icon: <LocalShipping /> },
                { status: 'Delivered', count: 45, color: '#4CAF50', icon: <CheckCircle /> },
                { status: 'Cancelled', count: 3, color: '#F44336', icon: <Cancel /> },
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#F8F9FA',
                  borderRadius: 1,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ backgroundColor: item.color, width: 32, height: 32 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.status}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {item.count}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {Math.round((item.count / 83) * 100)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Orders */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Recent Orders
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
              {(analyticsData?.orders?.data || []).slice(0, 10).map((order, index) => (
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
                      {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
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
    </Grid>
  );

  const renderProductPerformance = () => (
    <Grid container spacing={3}>
      {/* Top Products Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Product Performance Analysis
              </Typography>
              <Box>
                <Tooltip title="Export">
                  <IconButton onClick={() => handleExport('products')}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Avg Price</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData?.products && analyticsData.products.length > 0 ? (
                    analyticsData.products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {product.product_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            SKU: {product.product_sku || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{product.total_quantity_sold}</TableCell>
                      <TableCell align="right">₹{product.total_revenue}</TableCell>
                      <TableCell align="right">₹{product.average_price}</TableCell>
                      <TableCell align="right">{product.orders_count}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={index < 3 ? 'Top Performer' : 'Good'}
                          color={index < 3 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <EmptyState
                          icon={<Assessment />}
                          title="No Product Data"
                          description="No product sales data available for the selected period."
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
      </Grid>
    </Grid>
  );

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<Error />}
          title="Failed to Load Analytics"
          description={error}
          actionLabel="Retry"
          onAction={fetchAnalyticsData}
          variant="error"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
          Sales Analytics
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Advanced sales performance insights and business intelligence
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
              onClick={fetchAnalyticsData}
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
              onClick={() => handleExport('analytics')}
            >
              Export Analytics
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && renderSalesPerformance()}
          {activeTab === 2 && renderOrderAnalytics()}
          {activeTab === 3 && renderProductPerformance()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalesAnalytics;
