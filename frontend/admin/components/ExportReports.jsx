import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  Description,
  GetApp,
  CheckCircle,
  Error,
} from '@mui/icons-material';

const ExportReports = ({ open, onClose, reportType, data }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const exportFormats = [
    {
      value: 'pdf',
      label: 'PDF Report',
      icon: <PictureAsPdf />,
      description: 'Professional PDF document with charts and tables',
      color: '#F44336'
    },
    {
      value: 'excel',
      label: 'Excel Spreadsheet',
      icon: <TableChart />,
      description: 'Excel file with data tables and calculations',
      color: '#4CAF50'
    },
    {
      value: 'csv',
      label: 'CSV File',
      icon: <Description />,
      description: 'Comma-separated values for data analysis',
      color: '#2196F3'
    }
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportStatus(null);

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock export success
      setExportStatus({
        type: 'success',
        message: `${reportType} report exported successfully as ${exportFormat.toUpperCase()}`
      });

      // In a real implementation, you would:
      // 1. Call the backend API to generate the report
      // 2. Download the file
      // 3. Handle errors appropriately

    } catch (error) {
      setExportStatus({
        type: 'error',
        message: 'Failed to export report. Please try again.'
      });
    } finally {
      setExporting(false);
    }
  };

  const getReportTitle = () => {
    const titles = {
      'sales': 'Sales Report',
      'financial': 'Financial Report',
      'customers': 'Customer Analytics',
      'inventory': 'Inventory Report',
      'orders': 'Orders Report',
      'products': 'Products Report',
      'summary': 'Business Summary'
    };
    return titles[reportType] || 'Report';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Download sx={{ color: '#2196F3' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Export {getReportTitle()}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Export Format Selection */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Choose Export Format
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {exportFormats.map((format) => (
              <Grid item xs={12} md={4} key={format.value}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: exportFormat === format.value ? `2px solid ${format.color}` : '1px solid #E0E0E0',
                    '&:hover': { backgroundColor: '#F5F5F5' }
                  }}
                  onClick={() => setExportFormat(format.value)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ color: format.color, mb: 1 }}>
                      {format.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {format.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {format.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Date Range Selection */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Select Date Range
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Report Contents */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Report Contents
          </Typography>
          
          <List>
            {getReportContents(reportType).map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>

          {/* Export Status */}
          {exportStatus && (
            <Alert 
              severity={exportStatus.type} 
              sx={{ mt: 2 }}
              icon={exportStatus.type === 'success' ? <CheckCircle /> : <Error />}
            >
              {exportStatus.message}
            </Alert>
          )}

          {/* Export Progress */}
          {exporting && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Generating report...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={exporting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={handleExport}
          disabled={exporting}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': { backgroundColor: '#F57F17' },
          }}
        >
          {exporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to get report contents based on type
const getReportContents = (reportType) => {
  const contents = {
    'sales': [
      'Sales performance metrics',
      'Revenue trends and analysis',
      'Top performing products',
      'Sales by category',
      'Growth rate calculations'
    ],
    'financial': [
      'Revenue breakdown',
      'Expense analysis',
      'Profit & Loss statement',
      'Tax calculations',
      'Financial ratios'
    ],
    'customers': [
      'Customer demographics',
      'Purchase behavior analysis',
      'Customer lifetime value',
      'Retention rates',
      'Top customers list'
    ],
    'inventory': [
      'Stock levels overview',
      'Low stock alerts',
      'Inventory valuation',
      'Stock movement history',
      'Reorder recommendations'
    ],
    'orders': [
      'Order status distribution',
      'Order processing times',
      'Customer order history',
      'Order value analysis',
      'Shipping performance'
    ],
    'products': [
      'Product performance metrics',
      'Sales by product',
      'Category analysis',
      'Product profitability',
      'Stock turnover rates'
    ],
    'summary': [
      'Key business metrics',
      'Performance overview',
      'Growth indicators',
      'Operational insights',
      'Strategic recommendations'
    ]
  };
  
  return contents[reportType] || ['General report data'];
};

export default ExportReports;


