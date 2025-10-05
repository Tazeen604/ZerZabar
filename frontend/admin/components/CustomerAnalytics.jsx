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
  AvatarGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  ShoppingCart,
  Assessment,
  Download,
  FilterList,
  Refresh,
  GetApp,
  Visibility,
  Print,
  Star,
  StarBorder,
  LocationOn,
  Email,
  Phone,
  PersonAdd,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const CustomerAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchCustomerData();
  }, [dateRange]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersResponse, customerStats, customerSegments, topCustomers] = await Promise.all([
        apiService.get(`/admin/customers?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/customer-stats?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/customer-segments?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/top-customers?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
      ]);

      setCustomerData({
        customers: customersResponse.success ? customersResponse.data : null,
        stats: customerStats.success ? customerStats.data : null,
        segments: customerSegments.success ? customerSegments.data : null,
        topCustomers: topCustomers.success ? topCustomers.data : null,
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
    console.log(`Exporting ${type} customer analytics...`);
  };

  const tabs = [
    { label: 'Overview', value: 0 },
    { label: 'Customer Segments', value: 1 },
    { label: 'Top Customers', value: 2 },
    { label: 'Customer Behavior', value: 3 },
  ];

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Customer Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {customerData?.stats?.total_customers || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Customers
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
                <PersonAdd />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {customerData?.stats?.new_customers || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  New Customers
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
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{customerData?.stats?.average_order_value || 0}
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
                <ShoppingCart />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {customerData?.stats?.repeat_customers || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Repeat Customers
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

      {/* Customer Growth Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Customer Growth Trend
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1 }}>
                  {customerData?.stats?.total_customers || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Active Customers
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      {customerData?.stats?.new_customers || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      New This Month
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {customerData?.stats?.repeat_customers || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Repeat Customers
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Demographics */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Customer Demographics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { segment: 'VIP Customers', count: 25, color: '#4CAF50' },
                { segment: 'Regular Customers', count: 150, color: '#2196F3' },
                { segment: 'New Customers', count: 75, color: '#FF9800' },
                { segment: 'Inactive Customers', count: 50, color: '#9C27B0' },
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
                    <Box sx={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.segment}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCustomerSegments = () => (
    <Grid container spacing={3}>
      {/* Customer Segments */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Customer Segmentation Analysis
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  segment: 'VIP Customers',
                  count: 25,
                  revenue: 125000,
                  color: '#4CAF50',
                  description: 'High-value customers with multiple purchases',
                  criteria: 'Orders > 5, Revenue > ₹10,000'
                },
                {
                  segment: 'Regular Customers',
                  count: 150,
                  revenue: 450000,
                  color: '#2196F3',
                  description: 'Frequent customers with consistent purchases',
                  criteria: 'Orders 2-5, Revenue ₹2,000-₹10,000'
                },
                {
                  segment: 'New Customers',
                  count: 75,
                  revenue: 75000,
                  color: '#FF9800',
                  description: 'Recently acquired customers',
                  criteria: 'First-time buyers in last 30 days'
                },
                {
                  segment: 'At-Risk Customers',
                  count: 30,
                  revenue: 15000,
                  color: '#F44336',
                  description: 'Customers who haven\'t purchased recently',
                  criteria: 'No orders in last 60 days'
                },
              ].map((segment, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ backgroundColor: segment.color, mr: 2 }}>
                          <People />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {segment.segment}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {segment.count} customers
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {segment.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Revenue: ₹{segment.revenue.toLocaleString()}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(segment.revenue / 500000) * 100} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Criteria: {segment.criteria}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTopCustomers = () => (
    <Grid container spacing={3}>
      {/* Top Customers Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Top Customers by Revenue
              </Typography>
              <Box>
                <Tooltip title="Export">
                  <IconButton onClick={() => handleExport('top-customers')}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Total Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell align="right">Avg Order Value</TableCell>
                    <TableCell align="right">Last Order</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(customerData?.topCustomers || []).map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ backgroundColor: '#2196F3' }}>
                            {customer.name?.charAt(0) || 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {customer.name || 'Customer'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {customer.email || 'customer@example.com'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{customer.total_orders || 0}</TableCell>
                      <TableCell align="right">₹{customer.total_spent || 0}</TableCell>
                      <TableCell align="right">₹{customer.average_order_value || 0}</TableCell>
                      <TableCell align="right">
                        {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={customer.status || 'Active'}
                          color={customer.status === 'VIP' ? 'success' : 'default'}
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

  const renderCustomerBehavior = () => (
    <Grid container spacing={3}>
      {/* Customer Behavior Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Customer Behavior Metrics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#E8F5E8', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {customerData?.stats?.customer_retention_rate || 0}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Customer Retention Rate
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#E3F2FD', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                  {customerData?.stats?.average_purchase_frequency || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Purchase Frequency
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#FFF3E0', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {customerData?.stats?.customer_lifetime_value || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Customer Lifetime Value
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Activity */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Customer Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { activity: 'Active Customers', count: 200, color: '#4CAF50' },
                { activity: 'New Registrations', count: 25, color: '#2196F3' },
                { activity: 'Repeat Purchases', count: 150, color: '#FF9800' },
                { activity: 'Cart Abandonments', count: 45, color: '#F44336' },
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
                    <Box sx={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.activity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
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
          Customer Analytics
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Comprehensive customer insights and behavior analysis
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
              onClick={fetchCustomerData}
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
              onClick={() => handleExport('customers')}
            >
              Export Customer Data
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
          {activeTab === 1 && renderCustomerSegments()}
          {activeTab === 2 && renderTopCustomers()}
          {activeTab === 3 && renderCustomerBehavior()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerAnalytics;



