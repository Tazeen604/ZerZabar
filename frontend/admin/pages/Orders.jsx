import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
  Search,
  MoreVert,
  Visibility,
  Edit,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  Add,
  ShoppingCart,
  Error,
  Print,
  Refresh,
  AssignmentReturn,
} from '@mui/icons-material';
import apiService from '../../src/services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const Orders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [orderForStatusUpdate, setOrderForStatusUpdate] = useState(null);
  
  // Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'custom'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Filter orders function
  const filterOrders = async (type, start = null, end = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let params = new URLSearchParams();
      
      if (type === 'today') {
        params.append('filter', 'today');
      } else if (type === 'custom' && start && end) {
        const formattedStart = typeof start === 'string' ? start : format(start, 'yyyy-MM-dd');
        const formattedEnd = typeof end === 'string' ? end : format(end, 'yyyy-MM-dd');
        params.append('start_date', formattedStart);
        params.append('end_date', formattedEnd);
      }
      
      const response = await apiService.get(`/admin/orders/filter?${params.toString()}`);
      
      if (response.success) {
        setFilteredOrders(response.data || []);
        setIsFiltered(true);
        setFilterType(type);
        // keep Date objects in state for UI
        setStartDate(start);
        setEndDate(end);
      } else {
        setError(response.message || 'Failed to filter orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to filter orders');
      console.error('Error filtering orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType('all');
    setStartDate(null);
    setEndDate(null);
    setFilteredOrders([]);
    setIsFiltered(false);
    fetchOrders(); // Reload all orders
  };

  // Apply custom date range filter
  const applyCustomFilter = () => {
    if (startDate && endDate) {
      filterOrders('custom', startDate, endDate);
    } else {
      setError('Please select both start and end dates');
    }
  };

  // Apply today's filter
  const applyTodayFilter = () => {
    filterOrders('today');
  };

  // Print/Export functionality
  const printOrders = () => {
    // Apply all active filters to get the correct orders for printing
    let ordersToPrint = orders;
    
    // Apply date filters if active
    if (isFiltered && filteredOrders.length > 0) {
      ordersToPrint = filteredOrders;
    }
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      ordersToPrint = ordersToPrint.filter(order => order.status === statusFilter);
    }
    
    // Note: Search filtering is handled by the backend API, 
    // so we don't need to apply additional frontend filtering here
    const printWindow = window.open('', '_blank');
    
    // Calculate totals
    const totalOrders = ordersToPrint.length;
    const totalAmount = ordersToPrint.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const paidOrders = ordersToPrint.filter(order => order.payment_status === 'paid').length;
    const pendingOrders = ordersToPrint.filter(order => order.payment_status === 'pending').length;
    
    const printContent = `
      <html>
        <head>
          <title>Zer Zabar - Orders Report</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
              body { -webkit-print-color-adjust: exact; }
            }
            
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f8f9fa;
              color: #333;
            }
            
            .print-container {
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .store-header {
              text-align: center;
              border-bottom: 3px solid #2196F3;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            
            .store-name {
              font-size: 32px;
              font-weight: bold;
              color: #2196F3;
              margin: 0;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .store-tagline {
              font-size: 14px;
              color: #666;
              margin: 5px 0;
              font-style: italic;
            }
            
            .report-title {
              font-size: 20px;
              color: #333;
              margin: 10px 0 5px 0;
              font-weight: 600;
            }
            
            .filter-info {
              background: #e3f2fd;
              padding: 8px;
              border-radius: 5px;
              margin: 5px 0;
              border-left: 4px solid #2196F3;
            }
            
            /* Summary stats styles removed - now integrated into filter-info */
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 5px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              font-size: 10px;
            }
            
            th { 
              background: linear-gradient(135deg, #2196F3, #1976D2);
              color: white;
              padding: 8px 6px;
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 10px;
            }
            
            td { 
              padding: 6px;
              border-bottom: 1px solid #eee;
              vertical-align: top;
              word-wrap: break-word;
              word-break: break-word;
              white-space: normal;
              max-width: 200px;
            }
            
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            tr:hover {
              background-color: #e3f2fd;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            .status-pending {
              background: #fff3cd;
              color: #856404;
            }
            
            .status-completed {
              background: #d4edda;
              color: #155724;
            }
            
            .status-cancelled {
              background: #f8d7da;
              color: #721c24;
            }
            
            .status-returned {
              background: #e1bee7;
              color: #4a148c;
            }
            
            .status-inprocess, .status-in-process {
              background: #ffe0b2;
              color: #e65100;
            }
            
            .payment-paid {
              background: #d4edda;
              color: #155724;
            }
            
            .payment-pending {
              background: #fff3cd;
              color: #856404;
            }
            
            .total-amount {
              font-weight: bold;
              color: #2196F3;
            }
            
            .report-footer {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            
            .print-date {
              font-weight: bold;
              color: #333;
            }
            
            .address-cell {
              max-width: 250px;
              word-wrap: break-word;
              word-break: break-word;
              white-space: normal;
              line-height: 1.4;
            }
            
            .district-cell, .city-cell {
              max-width: 120px;
              word-wrap: break-word;
              word-break: break-word;
              white-space: normal;
            }
            
            .order-number-cell {
              max-width: 100px;
              word-wrap: break-word;
              word-break: break-word;
            }
            
            .customer-cell {
              max-width: 150px;
              word-wrap: break-word;
              word-break: break-word;
            }
            
            .email-cell {
              max-width: 180px;
              word-wrap: break-word;
              word-break: break-word;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="store-header">
              <h1 class="store-name">ZER ZABAR</h1>
              <p class="store-tagline">Premium Fashion & Lifestyle Store</p>
              <p class="store-tagline">Your Style, Our Passion</p>
            </div>
            
            <h2 class="report-title">Orders Report</h2>
            
            <div class="filter-info">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 200px;">
                  <strong>Report Filters:</strong> 
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    <li><strong>Period:</strong> ${isFiltered ? 
                      (filterType === 'today' ? 'Today\'s Orders' : 
                       `Orders from ${startDate} to ${endDate}`) : 
                      'All Orders'
                    }</li>
                    <li><strong>Status:</strong> ${statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</li>
                    ${searchTerm ? `<li><strong>Search:</strong> "${searchTerm}"</li>` : ''}
                  </ul>
                </div>
                
                <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
                  <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #2196F3;">${totalOrders}</div>
                    <div style="font-size: 12px; color: #666;">Total Orders</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #FF9800;">${pendingOrders}</div>
                    <div style="font-size: 12px; color: #666;">Pending Orders</div>
                  </div>
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Product ID</th>
                  <th>Variant ID</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${ordersToPrint.map((order, index) => {
                  // Get first item's product and variant info
                  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                  const productId = firstItem?.product_identifier || 'N/A';
                  const variantId = firstItem?.variant_sku || 'N/A';
                  
                  // Normalize status for CSS class
                  const statusNormalized = (order.status || '').toLowerCase().replace(/\s+/g, '');
                  
                  return `
                  <tr>
                    <td class="order-number-cell">${index + 1}</td>
                    <td class="order-number-cell"><strong>${order.order_number}</strong></td>
                    <td class="customer-cell">${order.customer_name || 'N/A'}</td>
                    <td class="email-cell">${order.customer_email || 'N/A'}</td>
                    <td>${order.customer_phone || 'N/A'}</td>
                    <td class="address-cell">${order.shipping_address || 'N/A'}</td>
                    <td>${productId}</td>
                    <td>${variantId}</td>
                    <td><span class="status-badge status-${statusNormalized}">${order.status || 'N/A'}</span></td>
                    <td class="total-amount">Rs ${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td>${new Date(order.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="report-footer">
              <p>Generated on <span class="print-date">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span></p>
              <p>Zer Zabar Store Management System</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Auto-print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Fetch orders from API
  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        per_page: rowsPerPage.toString(),
      });
      
      if (searchTerm) {
        const normalized = searchTerm.trim();
        if (normalized) {
          params.append('search', normalized);
        }
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await apiService.get(`/admin/orders?${params.toString()}`);
      
      if (response.success) {
        setOrders(response.data?.data || []);
        setTotalCount(response.data?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchOrders(true);
  };

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setPage(0);
        // Ensure date filter results don't override search results
        setIsFiltered(false);
        setFilteredOrders([]);
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleViewOrder = () => {
    navigate(`/admin/orders/${selectedOrder.id}`);
    handleMenuClose();
  };

  const handleEditOrder = () => {
    console.log('Edit order:', selectedOrder);
    handleMenuClose();
  };

  // Check if status can be changed
  const canChangeStatus = (order) => {
    if (!order || !order.status) return true;
    const currentStatus = order.status.toLowerCase();
    // Once these final statuses are set, they cannot be changed
    const finalStatuses = ['completed', 'cancelled', 'returned'];
    return !finalStatuses.includes(currentStatus);
  };

  // Handle status change request (opens confirmation dialog)
  const handleStatusChangeRequest = (newStatus) => {
    if (!selectedOrder) return;
    
    // Check if status can be changed
    if (!canChangeStatus(selectedOrder)) {
      setError('This order status cannot be changed once set.');
      handleMenuClose();
      return;
    }
    
    // Store the order and pending status
    setOrderForStatusUpdate(selectedOrder);
    setPendingStatus(newStatus);
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  // Map frontend status to backend status format
  const mapStatusToBackend = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'in process':
      case 'inprocess':
        return 'processing';
      case 'returned':
        return 'returned';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      case 'completed':
        return 'completed';
      case 'pending':
        return 'pending';
      default:
        return statusLower;
    }
  };

  // Confirm and update status
  const handleConfirmStatusUpdate = async () => {
    if (!orderForStatusUpdate || !pendingStatus) return;
    
    try {
      const backendStatus = mapStatusToBackend(pendingStatus);
      const response = await apiService.put(`/admin/orders/${orderForStatusUpdate.id}`, {
        status: backendStatus
      });
      
      if (response.success) {
        setSuccess(`Order status updated to ${pendingStatus}`);
        fetchOrders(); // Refresh the orders list
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
    
    setConfirmDialogOpen(false);
    setPendingStatus(null);
    setOrderForStatusUpdate(null);
  };

  // Cancel status update
  const handleCancelStatusUpdate = () => {
    setConfirmDialogOpen(false);
    setPendingStatus(null);
    setOrderForStatusUpdate(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#4CAF50';
      case 'in process':
      case 'inprocess':
      case 'shipped':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      case 'cancelled':
      case 'canceled':
        return '#F44336';
      case 'returned':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CheckCircle />;
      case 'in process':
      case 'inprocess':
      case 'shipped':
        return <LocalShipping />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
      case 'canceled':
        return <Cancel />;
      case 'returned':
        return <AssignmentReturn />;
      default:
        return <ShoppingCart />;
    }
  };

  // Loading and error states
  if (loading && (isFiltered ? filteredOrders : orders).length === 0) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error && (isFiltered ? filteredOrders : orders).length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<Error />}
          title="Failed to Load Orders"
          description={error}
          actionLabel="Retry"
          onAction={fetchOrders}
          variant="error"
        />
      </Box>
    );
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            Recent Orders
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Manage and track customer orders
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
            borderColor: '#2196F3',
            color: '#2196F3',
            '&:hover': {
              backgroundColor: '#2196F320',
              borderColor: '#2196F3',
            },
            '&:disabled': {
              borderColor: '#bdbdbd',
              color: '#bdbdbd',
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Filter Orders
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            {/* Today's Orders Button */}
            

            {/* Date Range Picker */}
            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sm={6} md={1}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={applyCustomFilter}
                  disabled={!startDate || !endDate}
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#45a049' },
                  }}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  size="small"
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      backgroundColor: '#f44336',
                      color: 'white',
                    },
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Print/Export Button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={printOrders}
              sx={{
                borderColor: '#2196F3',
                color: '#2196F3',
                '&:hover': {
                  backgroundColor: '#2196F3',
                  color: 'white',
                },
              }}
            >
              Print/Export
            </Button>
          </Box>

          {/* Filter Status */}
          {(isFiltered || statusFilter !== 'all' || searchTerm) && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {isFiltered && (
                <Chip
                  label={
                    filterType === 'today' 
                      ? "Today's Orders" 
                      : `Orders from ${startDate?.toLocaleDateString()} to ${endDate?.toLocaleDateString()}`
                  }
                  color="primary"
                  onDelete={resetFilters}
                  deleteIcon={<Cancel />}
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  label={`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                  color="secondary"
                  onDelete={() => setStatusFilter('all')}
                  deleteIcon={<Cancel />}
                />
              )}
              {searchTerm && (
                <Chip
                  label={`Search: "${searchTerm}"`}
                  color="default"
                  onDelete={() => setSearchTerm('')}
                  deleteIcon={<Cancel />}
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#F5F5F5',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: '1px solid #FFD700',
              },
              '&.Mui-focused fieldset': {
                border: '2px solid #FFD700',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#757575' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              borderRadius: '12px',
              backgroundColor: '#F5F5F5',
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in process">In Process</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="returned">Returned</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflowX: 'scroll', // Use 'scroll' instead of 'auto' to force scrollbar visibility
          maxWidth: '100%',
          // Force scrollbar to always be visible
          '&::-webkit-scrollbar': {
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
            '&:hover': {
              background: '#555',
            },
          },
        }}
      >
        <Table sx={{ tableLayout: 'fixed', minWidth: '1600px' }}>
          <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '60px' }}>Sr No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '100px' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '200px' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Product ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Variant ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '150px' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '180px' }}>Email ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Phone No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '200px' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Payment Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '80px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(() => {
              // Apply all active filters to get the correct orders for display
              let displayOrders = orders;
              
              // Apply date filters if active
              if (isFiltered && filteredOrders.length > 0) {
                displayOrders = filteredOrders;
              }
              
              // Apply status filter if not 'all'
              if (statusFilter !== 'all') {
                displayOrders = displayOrders.filter(order => order.status === statusFilter);
              }
              
              // Note: Search filtering is handled by the backend API, 
              // so we don't need to apply additional frontend filtering here
              
              return displayOrders.length > 0 ? (
                displayOrders.map((order, index) => (
                <TableRow
                  key={order.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#F8F9FA',
                    },
                    '&:last-child td, &:last-child th': {
                      border: 0,
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold', color: '#212121', textAlign: 'center' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100px'
                      }}
                    >
                      #{order.order_number || order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {order.items && order.items.length > 0 ? (
                        order.items.slice(0, 2).map((item, index) => (
                          <Typography 
                            key={index} 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold', 
                              fontSize: '0.875rem',
                              wordWrap: 'break-word',
                              whiteSpace: 'normal',
                              lineHeight: 1.2
                            }}
                          >
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
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          +{order.items.length - 2} more items
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#2196F3',
                        fontSize: '0.875rem',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2
                      }}
                    >
                      {order.items && order.items.length > 0 ? 
                        (order.items[0]?.product_identifier || 'N/A') : 'N/A'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#4CAF50',
                        fontSize: '0.875rem',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2
                      }}
                    >
                      {order.items && order.items.length > 0 ? 
                        (order.items[0]?.variant_sku || 'N/A') : 'N/A'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2
                      }}
                    >
                      {order.customer_name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#757575',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        fontSize: '0.75rem'
                      }}
                    >
                      {order.customer_email || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {order.customer_phone || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#757575',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        maxHeight: '60px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.75rem'
                      }}
                    >
                      {order.shipping_address || 'N/A'}
                    </Typography>
                  </TableCell>
                  {/* City and District columns removed */}
                  <TableCell>
                    <Chip
                      label={order.payment_method || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#2196F3',
                        fontWeight: 'bold',
                        maxWidth: '100%',
                        '& .MuiChip-label': {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status || 'Unknown'}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                        fontWeight: 'bold',
                        maxWidth: '100%',
                        '& .MuiChip-label': {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, order)}
                      sx={{
                        color: '#757575',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} sx={{ textAlign: 'center', py: 4 }}>
                    <EmptyState
                      icon={<ShoppingCart />}
                      title="No Orders Found"
                      description="Try adjusting your filters"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem
          onClick={handleViewOrder}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Visibility sx={{ color: '#2196F3' }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
       
        {/* Status options - only show if status can be changed */}
        {selectedOrder && canChangeStatus(selectedOrder) && (
          <>
            <MenuItem
              onClick={() => handleStatusChangeRequest('In Process')}
              disabled={selectedOrder?.status?.toLowerCase() === 'in process' || selectedOrder?.status?.toLowerCase() === 'inprocess'}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <LocalShipping sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText>Mark as In Process</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusChangeRequest('Completed')}
              disabled={selectedOrder?.status?.toLowerCase() === 'completed'}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <CheckCircle sx={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText>Mark as Completed</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusChangeRequest('Cancelled')}
              disabled={selectedOrder?.status?.toLowerCase() === 'cancelled' || selectedOrder?.status?.toLowerCase() === 'canceled'}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  color: '#F44336',
                },
              }}
            >
              <ListItemIcon>
                <Cancel sx={{ color: '#F44336' }} />
              </ListItemIcon>
              <ListItemText>Cancel Order</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusChangeRequest('Returned')}
              disabled={selectedOrder?.status?.toLowerCase() === 'returned'}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  color: '#9C27B0',
                },
              }}
            >
              <ListItemIcon>
                <AssignmentReturn sx={{ color: '#9C27B0' }} />
              </ListItemIcon>
              <ListItemText>Mark as Returned</ListItemText>
            </MenuItem>
          </>
        )}
        {selectedOrder && !canChangeStatus(selectedOrder) && (
          <MenuItem disabled>
            <ListItemText 
              primary="Status cannot be changed" 
              secondary="This order has a final status"
              sx={{ color: '#757575', fontStyle: 'italic' }}
            />
          </MenuItem>
        )}
      </Menu>

      {/* Order Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setViewDialogOpen(false);
          }
        }}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#212121' }}>
          Order Details - #{selectedOrder?.order_number || selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
                    Customer Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedOrder.customer_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedOrder.customer_phone || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {selectedOrder.shipping_address || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>City:</strong> {selectedOrder.city || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>District:</strong> {selectedOrder.district || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
                    Order Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Order ID:</strong> #{selectedOrder.order_number || selectedOrder.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Items:</strong> {selectedOrder.items?.length || 0} items
                    </Typography>
                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Products:
                        </Typography>
                        {selectedOrder.items.map((item, index) => (
                          <Typography key={index} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                            • {item.product_name || item.product?.name || 'Unknown Product'}
                            {item.quantity > 1 && ` (Qty: ${item.quantity})`}
                            {item.size && ` - Size: ${item.size}`}
                            {item.color && ` - Color: ${item.color}`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedOrder.status || 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment:</strong> {selectedOrder.payment_method || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total:</strong> PKR {selectedOrder.total_amount?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: '#757575' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              '&:hover': {
                backgroundColor: '#F57F17',
              },
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog for Status Update */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelStatusUpdate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#212121' }}>
          Confirm Status Update
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Are you sure you want to change the order status to <strong>{pendingStatus}</strong>?
          </Typography>
          {orderForStatusUpdate && (
            <Typography variant="body2" sx={{ mt: 2, color: '#757575' }}>
              Current Status: <strong>{orderForStatusUpdate.status}</strong>
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 2, color: '#F44336', fontStyle: 'italic' }}>
            Note: Once certain statuses (Completed, Cancelled, Returned) are set, they cannot be changed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCancelStatusUpdate}
            sx={{
              color: '#757575',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            No, Cancel
          </Button>
          <Button
            onClick={handleConfirmStatusUpdate}
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              '&:hover': {
                backgroundColor: '#F57F17',
              },
            }}
          >
            Yes, Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
