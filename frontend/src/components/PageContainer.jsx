import React from 'react';
import { Box } from '@mui/material';
import Logo from './Logo';

const PageContainer = ({ children, maxWidth = 'lg', sx = {} }) => {
  return (
    <Box
      sx={{
        pt: { xs: 14, md: 16 }, // Top padding to account for logo + navbar (reduced)
        minHeight: '100vh',
        position: 'relative',
        ...sx,
      }}
    >
      {/* Logo for all pages */}
      <Logo size="medium" position="fixed" />
      
      <Box
        sx={{
          maxWidth: maxWidth,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          ...sx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageContainer;

