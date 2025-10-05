import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  Assessment,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  ExpandLess,
  Add,
  BarChart,
  Settings,
} from '@mui/icons-material';

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin',
      hasSubmenu: false,
    },
    {
      text: 'Add Product',
      icon: <Add />,
      path: '/admin/add-product',
      hasSubmenu: false,
    },
    {
      text: 'Products',
      icon: <Inventory />,
      path: '/admin/products',
      hasSubmenu: true,
      subItems: [
        { text: 'Product Management', path: '/admin/product-management' },
        { text: 'Add Category', path: '/admin/add-category' },
        { text: 'Category Management', path: '/admin/category-management' },
      ],
    },
    {
      text: 'Inventory',
      icon: <Assessment />,
      path: '/admin/inventory',
      hasSubmenu: true,
      subItems: [
        { text: 'Stock Overview', path: '/admin/inventory' },
      ],
    },
    {
      text: 'Orders',
      icon: <ShoppingCart />,
      path: '/admin/orders',
      hasSubmenu: true,
      subItems: [
        { text: 'All Orders', path: '/admin/orders' },
        { text: 'Pending Orders', path: '/admin/orders/pending' },
        { text: 'Completed Orders', path: '/admin/orders/completed' },
      ],
    },
    {
      text: 'Reports',
      icon: <BarChart />,
      path: '/admin/reports',
      hasSubmenu: false,
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/admin/settings',
      hasSubmenu: false,
    },
  ];

  const handleSubmenuToggle = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawerWidth = open ? 280 : 60;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          p: 2,
          minHeight: 64,
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#FFD700',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart sx={{ color: '#2C2C2C', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
              Zer Zabar
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider sx={{ backgroundColor: '#424242' }} />

      {/* Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item, index) => (
          <Box key={index}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => !item.hasSubmenu && handleNavigation(item.path)}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  backgroundColor: isActive(item.path) ? '#FFD700' : 'transparent',
                  color: isActive(item.path) ? '#2C2C2C' : '#FFFFFF',
                  '&:hover': {
                    backgroundColor: isActive(item.path) ? '#F57F17' : 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? '#2C2C2C' : '#FFFFFF',
                    minWidth: open ? 40 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: item.active ? 600 : 400,
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                    {item.hasSubmenu && (
                      <IconButton
                        size="small"
                        onClick={() => handleSubmenuToggle(index)}
                        sx={{ color: item.active ? '#2C2C2C' : '#FFFFFF' }}
                      >
                        {expandedItems[index] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {item.hasSubmenu && open && (
              <Collapse in={expandedItems[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        pl: 4,
                        py: 0.5,
                        borderRadius: '6px',
                        backgroundColor: isActive(subItem.path) ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ListItemText
                        primary={subItem.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.85rem',
                            color: isActive(subItem.path) ? '#FFD700' : '#BDBDBD',
                            fontWeight: isActive(subItem.path) ? 'bold' : 'normal',
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
