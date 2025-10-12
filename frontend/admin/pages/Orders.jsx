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
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
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

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        per_page: rowsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
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
    }
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

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await apiService.put(`/admin/orders/${selectedOrder.id}`, {
        status: newStatus.toLowerCase()
      });
      
      if (response.success) {
        setSuccess(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh the orders list
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#4CAF50';
      case 'processing':
      case 'shipped':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      case 'cancelled':
      case 'canceled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CheckCircle />;
      case 'processing':
      case 'shipped':
        return <LocalShipping />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
      case 'canceled':
        return <Cancel />;
      default:
        return <ShoppingCart />;
    }
  };

  // Loading and error states
  if (loading && orders.length === 0) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error && orders.length === 0) {
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
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#FFD700',
            color: '#2C2C2C',
            '&:hover': {
              backgroundColor: '#F57F17',
              transform: 'translateY(-2px)',
            },
            px: 3,
            py: 1.5,
          }}
        >
          Create Order
        </Button>
      </Box>

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
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}
      >
        <Table sx={{ tableLayout: 'fixed', minWidth: '1400px' }}>
          <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '100px' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '200px' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '150px' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '180px' }}>Email ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Phone No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '200px' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>City</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>District</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Payment Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '120px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121', width: '80px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
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
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2
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
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        maxHeight: '60px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {order.shipping_address || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2
                      }}
                    >
                      {order.city || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#757575',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2
                      }}
                    >
                      {order.district || 'N/A'}
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
                    description="No orders match your current filters. Try adjusting your search criteria."
                    size="small"
                  />
                </TableCell>
              </TableRow>
            )}
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
       
        <MenuItem
          onClick={() => handleUpdateStatus('Completed')}
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
          onClick={() => handleUpdateStatus('Cancelled')}
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
    </Box>
  );
};

export default Orders;
