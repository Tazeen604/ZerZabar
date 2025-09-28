import React, { useState } from 'react';
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
} from '@mui/icons-material';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const ordersData = [
    {
      id: 'RB5625',
      date: '29 April 2024',
      product: 'Laptop',
      productIcon: '💻',
      customerName: 'Anna M. Hines',
      email: 'anna.hines@mail.com',
      phone: '(+1)-555-1564-261',
      address: 'Burr Ridge/Illinois',
      paymentType: 'Credit Card',
      status: 'Completed',
      totalPrice: 1299.99,
      quantity: 1,
    },
    {
      id: 'RB9652',
      date: '25 April 2024',
      product: 'Camera',
      productIcon: '📷',
      customerName: 'Judith H. Fritsche',
      email: 'judith.fritsche.com',
      phone: '(+57)-305-5579-759',
      address: 'SULLIVAN/Kentucky',
      paymentType: 'Credit Card',
      status: 'Completed',
      totalPrice: 899.99,
      quantity: 1,
    },
    {
      id: 'RB5984',
      date: '25 April 2024',
      product: 'Smartwatch',
      productIcon: '⌚',
      customerName: 'Peter T. Smith',
      email: 'peter.smith@mail.com',
      phone: '(+33)-655-5187-93',
      address: 'Yreka/California',
      paymentType: 'PayPal',
      status: 'Completed',
      totalPrice: 399.99,
      quantity: 1,
    },
    {
      id: 'RB3625',
      date: '21 April 2024',
      product: 'Smartphone',
      productIcon: '📱',
      customerName: 'Emmanuel J. Delcid',
      email: 'emmanuel.delicid@mail.com',
      phone: '(+30)-693-5553-637',
      address: 'Atlanta/Georgia',
      paymentType: 'PayPal',
      status: 'Processing',
      totalPrice: 799.99,
      quantity: 1,
    },
    {
      id: 'RB7891',
      date: '20 April 2024',
      product: 'Headphones',
      productIcon: '🎧',
      customerName: 'Sarah Johnson',
      email: 'sarah.johnson@mail.com',
      phone: '(+1)-555-1234-567',
      address: 'New York/New York',
      paymentType: 'Credit Card',
      status: 'Pending',
      totalPrice: 199.99,
      quantity: 2,
    },
    {
      id: 'RB4567',
      date: '18 April 2024',
      product: 'Tablet',
      productIcon: '📱',
      customerName: 'Michael Brown',
      email: 'michael.brown@mail.com',
      phone: '(+1)-555-9876-543',
      address: 'Los Angeles/California',
      paymentType: 'PayPal',
      status: 'Cancelled',
      totalPrice: 599.99,
      quantity: 1,
    },
  ];

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleViewOrder = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditOrder = () => {
    console.log('Edit order:', selectedOrder);
    handleMenuClose();
  };

  const handleUpdateStatus = (newStatus) => {
    console.log('Update status:', selectedOrder.id, newStatus);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50';
      case 'Processing':
        return '#FF9800';
      case 'Pending':
        return '#2196F3';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle />;
      case 'Processing':
        return <LocalShipping />;
      case 'Pending':
        return <Pending />;
      case 'Cancelled':
        return <Cancel />;
      default:
        return <ShoppingCart />;
    }
  };

  const filteredData = ordersData.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

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
          + Create Order
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
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Email ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Phone No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Payment Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
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
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      {order.date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '1.2rem' }}>{order.productIcon}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {order.product}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.customerName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      {order.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      {order.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      {order.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentType}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#2196F3',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                        fontWeight: 'bold',
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
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
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
          onClick={handleEditOrder}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Edit sx={{ color: '#FF9800' }} />
          </ListItemIcon>
          <ListItemText>Edit Order</ListItemText>
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
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#212121' }}>
          Order Details - #{selectedOrder?.id}
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
                      <strong>Name:</strong> {selectedOrder.customerName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedOrder.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedOrder.phone}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {selectedOrder.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
                    Order Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Order ID:</strong> #{selectedOrder.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {selectedOrder.date}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Product:</strong> {selectedOrder.product}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Quantity:</strong> {selectedOrder.quantity}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment:</strong> {selectedOrder.paymentType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total:</strong> ${selectedOrder.totalPrice}
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
    </Box>
  );
};

export default Orders;
