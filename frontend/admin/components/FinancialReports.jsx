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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  Receipt,
  Assessment,
  Download,
  FilterList,
  Refresh,
  GetApp,
  Visibility,
  Print,
  ExpandMore,
  MonetizationOn,
  CreditCard,
  LocalShipping,
  Inventory,
} from '@mui/icons-material';
import apiService from '../../src/services/api';

const FinancialReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueReport, expenseReport, profitReport, taxReport] = await Promise.all([
        apiService.get(`/admin/reports/revenue?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/expenses?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/profit-loss?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
        apiService.get(`/admin/reports/tax?date_from=${getDateFrom()}&date_to=${getDateTo()}`),
      ]);

      setFinancialData({
        revenue: revenueReport.success ? revenueReport.data : null,
        expenses: expenseReport.success ? expenseReport.data : null,
        profit: profitReport.success ? profitReport.data : null,
        tax: taxReport.success ? taxReport.data : null,
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
    console.log(`Exporting ${type} financial report...`);
  };

  const tabs = [
    { label: 'Revenue Report', value: 0 },
    { label: 'Expense Report', value: 1 },
    { label: 'Profit & Loss', value: 2 },
    { label: 'Tax Report', value: 3 },
  ];

  const renderRevenueReport = () => (
    <Grid container spacing={3}>
      {/* Revenue Overview */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ backgroundColor: '#4CAF50', mr: 2 }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{financialData?.revenue?.total_revenue || 0}
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
                <Receipt />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{financialData?.revenue?.gross_revenue || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gross Revenue
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
                  ₹{financialData?.revenue?.net_revenue || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Net Revenue
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
                  ₹{financialData?.revenue?.average_order_value || 0}
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

      {/* Revenue Breakdown */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Revenue Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Revenue Source</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { source: 'Product Sales', amount: 125000, percentage: 85, growth: '+12%' },
                    { source: 'Shipping Fees', amount: 15000, percentage: 10, growth: '+8%' },
                    { source: 'Service Charges', amount: 7500, percentage: 5, growth: '+15%' },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.source}</TableCell>
                      <TableCell align="right">₹{item.amount.toLocaleString()}</TableCell>
                      <TableCell align="right">{item.percentage}%</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.growth}
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

      {/* Revenue Sources */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Revenue Sources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { source: 'Online Sales', amount: 125000, color: '#4CAF50' },
                { source: 'Retail Sales', amount: 45000, color: '#2196F3' },
                { source: 'Wholesale', amount: 30000, color: '#FF9800' },
                { source: 'Other', amount: 10000, color: '#9C27B0' },
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
                      {item.source}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    ₹{item.amount.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderExpenseReport = () => (
    <Grid container spacing={3}>
      {/* Expense Overview */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Total Expenses
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                ₹{financialData?.expenses?.total_expenses || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                For Selected Period
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Operating Expenses</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ₹{financialData?.expenses?.operating_expenses || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Marketing</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ₹{financialData?.expenses?.marketing || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Administrative</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ₹{financialData?.expenses?.administrative || 0}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Expense Categories */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Expense Categories
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { category: 'Inventory & Supplies', amount: 45000, percentage: 35, trend: '+5%' },
                    { category: 'Marketing & Advertising', amount: 25000, percentage: 20, trend: '+12%' },
                    { category: 'Shipping & Logistics', amount: 20000, percentage: 15, trend: '+8%' },
                    { category: 'Technology & Software', amount: 15000, percentage: 12, trend: '+15%' },
                    { category: 'Administrative', amount: 10000, percentage: 8, trend: '+3%' },
                    { category: 'Other Expenses', amount: 15000, percentage: 10, trend: '+7%' },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">₹{item.amount.toLocaleString()}</TableCell>
                      <TableCell align="right">{item.percentage}%</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.trend}
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

  const renderProfitLoss = () => (
    <Grid container spacing={3}>
      {/* P&L Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Profit & Loss Statement
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, backgroundColor: '#E8F5E8', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                    Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                    ₹{financialData?.profit?.total_revenue || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, backgroundColor: '#FFEBEE', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F44336', mb: 1 }}>
                    Expenses
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#C62828' }}>
                    ₹{financialData?.profit?.total_expenses || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Net Profit
              </Typography>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: financialData?.profit?.net_profit > 0 ? '#4CAF50' : '#F44336' 
              }}>
                ₹{financialData?.profit?.net_profit || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {financialData?.profit?.net_profit > 0 ? 'Profit' : 'Loss'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed P&L */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Detailed Profit & Loss
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>REVENUE</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Product Sales</TableCell>
                    <TableCell align="right">₹{financialData?.profit?.product_sales || 0}</TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Shipping Revenue</TableCell>
                    <TableCell align="right">₹{financialData?.profit?.shipping_revenue || 0}</TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ₹{financialData?.profit?.total_revenue || 0}
                    </TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>EXPENSES</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Cost of Goods Sold</TableCell>
                    <TableCell align="right">₹{financialData?.profit?.cogs || 0}</TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Operating Expenses</TableCell>
                    <TableCell align="right">₹{financialData?.profit?.operating_expenses || 0}</TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Marketing</TableCell>
                    <TableCell align="right">₹{financialData?.profit?.marketing || 0}</TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Expenses</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ₹{financialData?.profit?.total_expenses || 0}
                    </TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>NET PROFIT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ₹{financialData?.profit?.net_profit || 0}
                    </TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTaxReport = () => (
    <Grid container spacing={3}>
      {/* Tax Overview */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Tax Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: '#F8F9FA',
                borderRadius: 1,
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  GST Collected
                </Typography>
                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  ₹{financialData?.tax?.gst_collected || 0}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: '#F8F9FA',
                borderRadius: 1,
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  GST Paid
                </Typography>
                <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                  ₹{financialData?.tax?.gst_paid || 0}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: '#F8F9FA',
                borderRadius: 1,
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Net GST
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: financialData?.tax?.net_gst > 0 ? '#4CAF50' : '#F44336', 
                  fontWeight: 'bold' 
                }}>
                  ₹{financialData?.tax?.net_gst || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tax Details */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Tax Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tax Type</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { type: 'CGST (9%)', rate: '9%', amount: 4500 },
                    { type: 'SGST (9%)', rate: '9%', amount: 4500 },
                    { type: 'IGST (18%)', rate: '18%', amount: 9000 },
                    { type: 'CESS', rate: '1%', amount: 500 },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell align="right">{item.rate}</TableCell>
                      <TableCell align="right">₹{item.amount.toLocaleString()}</TableCell>
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
          Financial Reports
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Comprehensive financial analysis and accounting reports
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
              onClick={fetchFinancialData}
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
              onClick={() => handleExport('financial')}
            >
              Export Financial
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
          {activeTab === 0 && renderRevenueReport()}
          {activeTab === 1 && renderExpenseReport()}
          {activeTab === 2 && renderProfitLoss()}
          {activeTab === 3 && renderTaxReport()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialReports;


