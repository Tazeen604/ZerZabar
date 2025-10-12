import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  ShoppingCart,
  Person,
  Email,
  Phone,
  LocationOn,
  Payment,
  CalendarToday,
  AttachMoney,
  Inventory,
  Visibility,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../src/services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching order details for ID:', id);
      const response = await apiService.get(`/admin/orders/${id}`);
      console.log('Full API response:', response);
      
      if (response.success) {
        console.log('Order data received:', response.data);
        console.log('Customer info:', {
          name: response.data.customer_name,
          email: response.data.customer_email,
          phone: response.data.customer_phone,
          city: response.data.city,
          district: response.data.district
        });
        console.log('Billing address:', response.data.billing_address);
        console.log('Shipping address:', response.data.shipping_address);
        console.log('Order items:', response.data.items);
        console.log('Order items count:', response.data.items?.length || 0);
        console.log('First item details:', response.data.items?.[0]);
        console.log('Size and Color for first item:', {
          size: response.data.items?.[0]?.size,
          color: response.data.items?.[0]?.color
        });
        setOrder(response.data);
        setNewStatus(response.data.status);
      } else {
        console.error('API Error:', response);
        setError(response.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      // Validate status transitions
      const currentStatus = order?.status?.toLowerCase();
      const targetStatus = newStatus.toLowerCase();
      
      // Check if trying to complete a cancelled order
      if (currentStatus === 'cancelled' && targetStatus === 'completed') {
        setError('Cannot mark a cancelled order as completed. Please create a new order instead.');
        return;
      }
      
      // Check if trying to cancel a completed order
      if (currentStatus === 'completed' && targetStatus === 'cancelled') {
        setError('Cannot cancel a completed order. The order has already been finalized.');
        return;
      }
      
      // Check if trying to cancel a delivered order
      if (currentStatus === 'delivered' && targetStatus === 'cancelled') {
        setError('Cannot cancel a delivered order. The order has already been delivered.');
        return;
      }
      
      const response = await apiService.put(`/admin/orders/${id}`, {
        status: targetStatus
      });
      
      if (response.success) {
        setSuccess(`Order status updated to ${newStatus}`);
        setStatusUpdateOpen(false);
        fetchOrderDetails(); // Refresh order details
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `PKR ${parseFloat(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<ShoppingCart />}
          title="Failed to Load Order"
          description={error}
          actionLabel="Retry"
          onAction={fetchOrderDetails}
          variant="error"
        />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<ShoppingCart />}
          title="Order Not Found"
          description="The requested order could not be found."
          actionLabel="Back to Orders"
          onAction={() => navigate('/admin/orders')}
          variant="error"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate('/admin/orders')}
          sx={{ mr: 2, color: '#757575' }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            Order Details
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Order #{order.order_number || order.id}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => setStatusUpdateOpen(true)}
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
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Customer & Order Info */}
        <Grid item xs={12} lg={8}>
          {/* Customer Information */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1, color: '#FFD700' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
                  Customer Information
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem' }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {order.customer_name || 
                         (typeof order.billing_address === 'object' && order.billing_address?.name) ||
                         (typeof order.shipping_address === 'object' && order.shipping_address?.name) ||
                         'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem' }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {order.customer_email || 
                         (typeof order.billing_address === 'object' && order.billing_address?.email) ||
                         (typeof order.shipping_address === 'object' && order.shipping_address?.email) ||
                         'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem' }}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {order.customer_phone || 
                         (typeof order.billing_address === 'object' && order.billing_address?.phone) ||
                         (typeof order.shipping_address === 'object' && order.shipping_address?.phone) ||
                         'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, color: '#757575', fontSize: 20, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem' }}>
                        Shipping Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', wordWrap: 'break-word' }}>
                        {typeof order.shipping_address === 'object' && order.shipping_address !== null
                          ? `${order.shipping_address.address || ''}${order.shipping_address.city ? ', ' + order.shipping_address.city : ''}${order.shipping_address.district ? ', ' + order.shipping_address.district : ''}`
                          : order.shipping_address || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem' }}>
                        City
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {order.city || 
                         (typeof order.billing_address === 'object' && order.billing_address?.city) ||
                         (typeof order.shipping_address === 'object' && order.shipping_address?.city) ||
                         'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem' }}>
                        District
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {order.district || 
                         (typeof order.billing_address === 'object' && order.billing_address?.district) ||
                         (typeof order.shipping_address === 'object' && order.shipping_address?.district) ||
                         'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ShoppingCart sx={{ mr: 1, color: '#FFD700' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
                  Order Items ({order.items?.length || 0} items)
                </Typography>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={item.product?.images?.[0] || ''}
                              sx={{ width: 40, height: 40, mr: 2 }}
                            >
                              <ShoppingCart />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {item.product_name || 'Unknown Product'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#757575' }}>
                                SKU: {item.product_sku || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{item.size || 'N/A'}</TableCell>
                        <TableCell>{item.color || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(item.total_price || (item.unit_price * item.quantity))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Order Summary & Status */}
<Grid item xs={12} lg={4}>
  <Grid
    container
    spacing={2}
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', lg: 'row' },
      alignItems: 'stretch',
    }}
  >
       {/* Order Status Card */}
    <Grid item xs={12} lg={4}>
      <Card sx={{ flex: 1, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Visibility sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
              Order Status
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon(order.status)}
            label={order.status || 'Unknown'}
            sx={{
              backgroundColor: getStatusColor(order.status) + '20',
              color: getStatusColor(order.status),
              fontWeight: 'bold',
              fontSize: '1rem',
              py: 2,
              px: 1,
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Payment Method
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {order.payment_method || 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>


        {/* Order Timeline Card */}
    <Grid item xs={12} lg={4}>
      <Card sx={{ flex: 1, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarToday sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
              Timeline
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#757575' }}>Placed</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {formatDate(order.created_at)}
            </Typography>
            {order.shipped_at && (
              <>
                <Typography variant="body2" sx={{ color: '#757575' }}>Shipped</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDate(order.shipped_at)}
                </Typography>
              </>
            )}
            {order.delivered_at && (
              <>
                <Typography variant="body2" sx={{ color: '#757575' }}>Delivered</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDate(order.delivered_at)}
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>


         {/* Order Summary Card */}
    <Grid item xs={12} lg={4}>
      <Card sx={{ flex: 1, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AttachMoney sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
              Summary
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Subtotal: <b>{formatCurrency(order.subtotal)}</b>
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Shipping: <b>{formatCurrency(order.shipping_cost)}</b>
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              Total: {formatCurrency(order.total_amount)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem 
                value="completed"
                disabled={order?.status?.toLowerCase() === 'cancelled'}
              >
                Completed
                {order?.status?.toLowerCase() === 'cancelled' && ' (Cannot complete cancelled order)'}
              </MenuItem>
              <MenuItem 
                value="cancelled"
                disabled={order?.status?.toLowerCase() === 'completed' || order?.status?.toLowerCase() === 'delivered'}
              >
                Cancelled
                {(order?.status?.toLowerCase() === 'completed' || order?.status?.toLowerCase() === 'delivered') && ' (Cannot cancel completed/delivered order)'}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
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
      </Grid>
    </Box>
  );
};

export default OrderDetails;
