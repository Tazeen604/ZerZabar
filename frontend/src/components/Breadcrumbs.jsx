import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Link, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from '@mui/icons-material';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbItems = [
      {
        label: 'Home',
        path: '/',
        icon: <Home sx={{ fontSize: '1rem', mr: 0.5 }} />
      }
    ];

    let currentPath = '';
    
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      // Convert pathname to readable label
      let label = pathname;
      switch (pathname) {
        case 'shop':
          label = 'Shop';
          break;
        case 'new-arrivals':
          label = 'New Arrivals';
          break;
        case 'product':
          label = 'Product';
          break;
        case 'cart':
          label = 'Shopping Cart';
          break;
        case 'checkout':
          label = 'Checkout';
          break;
        case 'contact':
          label = 'Contact';
          break;
        case 'about':
          label = 'About';
          break;
        default:
          // Capitalize first letter and replace hyphens with spaces
          label = pathname.charAt(0).toUpperCase() + pathname.slice(1).replace(/-/g, ' ');
      }

      // Don't add the last item if it's a product ID (numeric)
      if (index === pathnames.length - 1 && !isNaN(pathname)) {
        return;
      }

      breadcrumbItems.push({
        label,
        path: currentPath,
        isLast: index === pathnames.length - 1
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <Box 
      sx={{ 
        mt: { xs: 0.5, sm: 0.5 },
        py: { xs: 1.5, sm: 2 },
        px: { xs: 2, sm: 3, md: 4 },
        backgroundColor: '#FFD700',
        borderBottom: '1px solid #e9ecef'
      }}
    >
      <MuiBreadcrumbs
        separator={<ChevronRight sx={{ fontSize: '1rem', color: '#6c757d' }} />}
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: { xs: 0.5, sm: 1 }
          }
        }}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = item.isLast;
          
          if (isLast) {
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  color: '#000',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {item.icon}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              sx={{
                color: '#000',
                textDecoration: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  color: '#000',
                  textDecoration: 'underline'
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;














