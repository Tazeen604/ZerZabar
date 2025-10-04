import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

const LoadingSkeleton = ({ type = 'default', count = 1 }) => {
  const renderCardSkeleton = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1 }} />
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Box>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 1 }} />
      {[...Array(5)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Skeleton variant="rectangular" height={48} sx={{ flex: 1 }} />
          <Skeleton variant="rectangular" height={48} sx={{ flex: 1 }} />
          <Skeleton variant="rectangular" height={48} sx={{ flex: 1 }} />
          <Skeleton variant="rectangular" height={48} sx={{ flex: 1 }} />
        </Box>
      ))}
    </Box>
  );

  const renderChartSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      </CardContent>
    </Card>
  );

  const renderDashboardSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} md={3} key={index}>
          {renderCardSkeleton()}
        </Grid>
      ))}
      <Grid item xs={12} lg={8}>
        {renderChartSkeleton()}
      </Grid>
      <Grid item xs={12} lg={4}>
        {renderChartSkeleton()}
      </Grid>
    </Grid>
  );

  const renderListSkeleton = () => (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#F8F9FA', borderRadius: 1 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );

  const renderContent = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'chart':
        return renderChartSkeleton();
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width={200} height={24} sx={{ mx: 'auto' }} />
              <Skeleton variant="text" width={150} height={16} sx={{ mx: 'auto' }} />
            </Box>
          </Box>
        );
    }
  };

  return renderContent();
};

export default LoadingSkeleton;


