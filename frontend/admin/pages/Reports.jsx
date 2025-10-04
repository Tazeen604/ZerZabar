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
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import SalesAnalytics from '../components/SalesAnalytics';
import FinancialReports from '../components/FinancialReports';
import CustomerAnalytics from '../components/CustomerAnalytics';
import SummaryDashboard from '../components/SummaryDashboard';
import BusinessIntelligence from '../components/BusinessIntelligence';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState({
    sales: null,
    orders: null,
    products: null,
    inventory: null,
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salesResponse, ordersResponse, productsResponse, inventoryResponse] = await Promise.all([
        apiService.get(`/admin/reports/sales?period=monthly&date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/orders?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/product-sales?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get('/admin/reports/inventory'),
      ]);

      setReportData({
        sales: salesResponse.success ? salesResponse.data : null,
        orders: ordersResponse.success ? ordersResponse.data : null,
        products: productsResponse.success ? productsResponse.data : null,
        inventory: inventoryResponse.success ? inventoryResponse.data : null,
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
    // Export functionality would be implemented here
    console.log(`Exporting ${type} report...`);
  };

  const tabs = [
    { label: 'Summary Dashboard', value: 0 },
    { label: 'Business Intelligence', value: 1 },
    { label: 'Sales Analytics', value: 2 },
    { label: 'Financial Reports', value: 3 },
    { label: 'Customer Analytics', value: 4 },
    { label: 'Orders Report', value: 5 },
    { label: 'Products Report', value: 6 },
    { label: 'Inventory Report', value: 7 },
  ];

  const renderSalesReport = () => (
    <Grid container spacing={3}>
      {/* Sales Overview Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{reportData.sales?.totals?.total_revenue || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Revenue
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#2196F3', mr: 2 }}>
                <ShoppingCart />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {reportData.sales?.totals?.total_orders || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Orders
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#FF9800', mr: 2 }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{reportData.sales?.totals?.average_order_value || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Order Value
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#9C27B0', mr: 2 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{reportData.sales?.totals?.total_tax || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Tax
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Sales Trend Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Sales Trend
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
                    <TableCell align="right">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reportData.sales?.report_data || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.period}</TableCell>
                      <TableCell align="right">{item.orders_count}</TableCell>
                      <TableCell align="right">₹{item.total_revenue}</TableCell>
                      <TableCell align="right">₹{item.average_order_value}</TableCell>
                      <TableCell align="right">
                        <Chip
                          icon={index > 0 ? <TrendingUp /> : <TrendingFlat />}
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

  const renderOrdersReport = () => (
    <Grid container spacing={3}>
      {/* Orders Overview */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Orders Overview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { status: 'Pending', count: 15, color: '#FF9800' },
                { status: 'Processing', count: 8, color: '#2196F3' },
                { status: 'Shipped', count: 12, color: '#9C27B0' },
                { status: 'Delivered', count: 45, color: '#4CAF50' },
                { status: 'Cancelled', count: 3, color: '#F44336' },
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: '50%' }} />
                    <Typography variant="body2">{item.status}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.count}
                  </Typography>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflowY: 'auto' }}>
              {(reportData.orders?.data || []).slice(0, 10).map((order, index) => (
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
                      {order.customer_name}
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

  const renderProductsReport = () => (
    <Grid container spacing={3}>
      {/* Top Products Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Top Selling Products
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reportData.products || []).map((product, index) => (
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

  const renderInventoryReport = () => (
    <Grid container spacing={3}>
      {/* Inventory Overview */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Inventory Overview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {reportData.inventory?.total_products || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Products
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                  {reportData.inventory?.in_stock || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  In Stock
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {reportData.inventory?.low_stock || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Low Stock
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                  {reportData.inventory?.out_of_stock || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Out of Stock
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Low Stock Items */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Low Stock Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reportData.inventory?.products || []).filter(p => p.is_low_stock).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {product.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{product.stock_quantity}</TableCell>
                      <TableCell align="right">{product.low_stock_threshold}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.stock_quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                          color={product.stock_quantity <= 0 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">₹{product.inventory_value}</TableCell>
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
          Reports & Analytics
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Comprehensive business insights and performance metrics
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
              onClick={fetchReportData}
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
              onClick={() => handleExport('all')}
            >
              Export All
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
          {activeTab === 0 && <SummaryDashboard />}
          {activeTab === 1 && <BusinessIntelligence />}
          {activeTab === 2 && <SalesAnalytics />}
          {activeTab === 3 && <FinancialReports />}
          {activeTab === 4 && <CustomerAnalytics />}
          {activeTab === 5 && renderOrdersReport()}
          {activeTab === 6 && renderProductsReport()}
          {activeTab === 7 && renderInventoryReport()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
