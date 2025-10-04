import React from 'react';
import { Box } from '@mui/material';

const PageContainer = ({ children, maxWidth = 'lg', sx = {} }) => {
  return (
    <Box
      sx={{
        pt: { xs: 12, md: 14 }, // Top padding to account for logo bar + navbar
        minHeight: '100vh',
        ...sx,
      }}
    >
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

