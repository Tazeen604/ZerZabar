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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Delete,
  Add,
 
  Warning,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editQuantity, setEditQuantity] = useState(0);

  const inventoryData = [
    {
      id: 'INV001',
      name: 'Premium Cotton T-Shirt',
      category: 'Clothing',
      quantity: 45,
      price: 29.99,
      status: 'In Stock',
      lastUpdated: '2024-01-15',
      supplier: 'Textile Co.',
    },
    {
      id: 'INV002',
      name: 'Designer Denim Jeans',
      category: 'Clothing',
      quantity: 23,
      price: 79.99,
      status: 'In Stock',
      lastUpdated: '2024-01-14',
      supplier: 'Denim Ltd.',
    },
    {
      id: 'INV003',
      name: 'Sports Running Shoes',
      category: 'Footwear',
      quantity: 5,
      price: 129.99,
      status: 'Low Stock',
      lastUpdated: '2024-01-13',
      supplier: 'Sports Inc.',
    },
    {
      id: 'INV004',
      name: 'Winter Wool Jacket',
      category: 'Clothing',
      quantity: 0,
      price: 199.99,
      status: 'Out of Stock',
      lastUpdated: '2024-01-12',
      supplier: 'Winter Co.',
    },
    {
      id: 'INV005',
      name: 'Casual Sneakers',
      category: 'Footwear',
      quantity: 34,
      price: 89.99,
      status: 'In Stock',
      lastUpdated: '2024-01-11',
      supplier: 'Shoe Corp.',
    },
    {
      id: 'INV006',
      name: 'Summer Dress',
      category: 'Clothing',
      quantity: 18,
      price: 59.99,
      status: 'In Stock',
      lastUpdated: '2024-01-10',
      supplier: 'Fashion Ltd.',
    },
    {
      id: 'INV007',
      name: 'Leather Handbag',
      category: 'Accessories',
      quantity: 2,
      price: 149.99,
      status: 'Low Stock',
      lastUpdated: '2024-01-09',
      supplier: 'Leather Co.',
    },
    {
      id: 'INV008',
      name: 'Smart Watch',
      category: 'Electronics',
      quantity: 12,
      price: 299.99,
      status: 'In Stock',
      lastUpdated: '2024-01-08',
      supplier: 'Tech Inc.',
    },
  ];

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    setEditQuantity(selectedItem.quantity);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('Delete item:', selectedItem);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    console.log('Update quantity:', selectedItem.id, editQuantity);
    setEditDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return '#4CAF50';
      case 'Low Stock':
        return '#FF9800';
      case 'Out of Stock':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Stock':
        return <CheckCircle />;
      case 'Low Stock':
        return <Warning />;
      case 'Out of Stock':
        return <Cancel />;
      default:
        return <Inventory />;
    }
  };

  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Inventory Management
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Track and manage your product inventory
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
          Add Item
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search inventory..."
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
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            sx={{
              borderRadius: '12px',
              backgroundColor: '#F5F5F5',
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="clothing">Clothing</MenuItem>
            <MenuItem value="footwear">Footwear</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
            <MenuItem value="electronics">Electronics</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            sx={{
              borderRadius: '12px',
              backgroundColor: '#F5F5F5',
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="in-stock">In Stock</MenuItem>
            <MenuItem value="low-stock">Low Stock</MenuItem>
            <MenuItem value="out-of-stock">Out of Stock</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Product ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Last Updated</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow
                  key={item.id}
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
                    {item.id}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: '#E3F2FD',
                          color: '#2196F3',
                        }}
                      >
                        <Inventory />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#2196F3',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: item.quantity < 10 ? '#F44336' : '#212121',
                      }}
                    >
                      {item.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      ${item.price}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={item.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(item.status) + '20',
                        color: getStatusColor(item.status),
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      {item.lastUpdated}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, item)}
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
          onClick={handleEdit}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Edit sx={{ color: '#FF9800' }} />
          </ListItemIcon>
          <ListItemText>Edit Quantity</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: '#F44336',
            },
          }}
        >
          <ListItemIcon>
            <Delete sx={{ color: '#F44336' }} />
          </ListItemIcon>
          <ListItemText>Delete Item</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Quantity Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setEditDialogOpen(false);
          }
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#212121' }}>
          Edit Quantity
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
              Product: {selectedItem?.name}
            </Typography>
            <TextField
              fullWidth
              label="New Quantity"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: '#757575' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              '&:hover': {
                backgroundColor: '#F57F17',
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
