import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
  Chip,
  Grid,
} from '@mui/material';
import { Close, Help } from '@mui/icons-material';

// Size chart data for different categories
const SIZE_CHART_DATA = {
  'T-Shirts': {
    'XS': { chest: '34-36', length: '28', shoulder: '16', sleeve: '24' },
    'S': { chest: '36-38', length: '29', shoulder: '17', sleeve: '25' },
    'M': { chest: '38-40', length: '30', shoulder: '18', sleeve: '26' },
    'L': { chest: '40-42', length: '31', shoulder: '19', sleeve: '27' },
    'XL': { chest: '42-44', length: '32', shoulder: '20', sleeve: '28' },
    'XXL': { chest: '44-46', length: '33', shoulder: '21', sleeve: '29' },
  },
  'Shirts': {
    'XS': { chest: '34-36', length: '28', shoulder: '16', sleeve: '24' },
    'S': { chest: '36-38', length: '29', shoulder: '17', sleeve: '25' },
    'M': { chest: '38-40', length: '30', shoulder: '18', sleeve: '26' },
    'L': { chest: '40-42', length: '31', shoulder: '19', sleeve: '27' },
    'XL': { chest: '42-44', length: '32', shoulder: '20', sleeve: '28' },
    'XXL': { chest: '44-46', length: '33', shoulder: '21', sleeve: '29' },
  },
  'Pants': {
    '28': { waist: '28', length: '42', hip: '36', thigh: '24' },
    '30': { waist: '30', length: '42', hip: '38', thigh: '25' },
    '32': { waist: '32', length: '42', hip: '40', thigh: '26' },
    '34': { waist: '34', length: '42', hip: '42', thigh: '27' },
    '36': { waist: '36', length: '42', hip: '44', thigh: '28' },
    '38': { waist: '38', length: '42', hip: '46', thigh: '29' },
  },
  'Shorts': {
    '28': { waist: '28', length: '20', hip: '36', thigh: '24' },
    '30': { waist: '30', length: '20', hip: '38', thigh: '25' },
    '32': { waist: '32', length: '20', hip: '40', thigh: '26' },
    '34': { waist: '34', length: '20', hip: '42', thigh: '27' },
    '36': { waist: '36', length: '20', hip: '44', thigh: '28' },
    '38': { waist: '38', length: '20', hip: '46', thigh: '29' },
  },
  'Coats': {
    'XS': { chest: '36-38', length: '32', shoulder: '17', sleeve: '26' },
    'S': { chest: '38-40', length: '33', shoulder: '18', sleeve: '27' },
    'M': { chest: '40-42', length: '34', shoulder: '19', sleeve: '28' },
    'L': { chest: '42-44', length: '35', shoulder: '20', sleeve: '29' },
    'XL': { chest: '44-46', length: '36', shoulder: '21', sleeve: '30' },
    'XXL': { chest: '46-48', length: '37', shoulder: '22', sleeve: '31' },
  },
  'default': {
    'XS': { chest: '34-36', length: '28', shoulder: '16', sleeve: '24' },
    'S': { chest: '36-38', length: '29', shoulder: '17', sleeve: '25' },
    'M': { chest: '38-40', length: '30', shoulder: '18', sleeve: '26' },
    'L': { chest: '40-42', length: '31', shoulder: '19', sleeve: '27' },
    'XL': { chest: '42-44', length: '32', shoulder: '20', sleeve: '28' },
    'XXL': { chest: '44-46', length: '33', shoulder: '21', sleeve: '29' },
  }
};

const SizeChartDrawer = ({ open, onClose, selectedSize, productCategory, availableSizes }) => {
  const [selectedChartSize, setSelectedChartSize] = useState(selectedSize || '');

  useEffect(() => {
    setSelectedChartSize(selectedSize || '');
  }, [selectedSize]);

  const getCategoryKey = (category) => {
    if (!category) return 'default';
    const categoryName = category.toLowerCase();
    if (categoryName.includes('shirt') && !categoryName.includes('t-shirt')) return 'Shirts';
    if (categoryName.includes('t-shirt') || categoryName.includes('tshirt')) return 'T-Shirts';
    if (categoryName.includes('pant') || categoryName.includes('trouser')) return 'Pants';
    if (categoryName.includes('short')) return 'Shorts';
    if (categoryName.includes('coat') || categoryName.includes('jacket')) return 'Coats';
    return 'default';
  };

  const getSizeChartData = () => {
    const categoryKey = getCategoryKey(productCategory);
    return SIZE_CHART_DATA[categoryKey] || SIZE_CHART_DATA['default'];
  };

  const getMeasurements = () => {
    const chartData = getSizeChartData();
    return chartData[selectedChartSize] || {};
  };

  const getMeasurementLabels = () => {
    const categoryKey = getCategoryKey(productCategory);
    if (categoryKey === 'Pants' || categoryKey === 'Shorts') {
      return [
        { key: 'waist', label: 'Waist' },
        { key: 'length', label: 'Length' },
        { key: 'hip', label: 'Hip' },
        { key: 'thigh', label: 'Thigh' }
      ];
    } else {
      return [
        { key: 'chest', label: 'Body Length' },
        { key: 'length', label: 'Chest Width' },
        { key: 'shoulder', label: 'Shoulder' },
        { key: 'sleeve', label: 'Full Sleeves Length' }
      ];
    }
  };

  const chartData = getSizeChartData();
  const measurements = getMeasurements();
  const measurementLabels = getMeasurementLabels();
  const availableSizesList = availableSizes || Object.keys(chartData);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1300, // Ensure it's above navbar
        '& .MuiDrawer-paper': {
          width: { xs: '75vw', sm: '60vw', md: '600px' },
          maxWidth: { xs: '75vw', sm: '60vw', md: '600px' },
          minWidth: { xs: '300px', sm: '400px', md: '600px' },
          top: { xs: '64px', sm: '64px', md: 0 }, // Position below navbar
          height: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 64px)', md: '100vh' }, // Account for navbar height
          borderLeft: '1px solid #e5e5e5',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            Size help
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Size Selection */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>
            Select size
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {availableSizesList.map((size) => (
              <Button
                key={size}
                variant={selectedChartSize === size ? "contained" : "outlined"}
                onClick={() => setSelectedChartSize(size)}
                sx={{
                  minWidth: '60px',
                  height: '40px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  backgroundColor: selectedChartSize === size ? '#000' : 'transparent',
                  color: selectedChartSize === size ? '#fff' : '#000',
                  borderColor: '#000',
                  '&:hover': {
                    backgroundColor: selectedChartSize === size ? '#333' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                {size}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Measurements Table */}
        <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>
            MEASUREMENTS
          </Typography>
          
          {selectedChartSize && measurements && Object.keys(measurements).length > 0 ? (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>MEASUREMENTS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>CM</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>INCH</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {measurementLabels.map((label) => (
                    <TableRow key={label.key}>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{label.label}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                        {measurements[label.key] || '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                        {measurements[label.key] ? Math.round(parseFloat(measurements[label.key]) * 0.393701 * 10) / 10 : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Select a size to view measurements
              </Typography>
            </Box>
          )}
        </Box>

        {/* Measurement Diagram */}
        <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={3}>
            {/* Left side - Front view diagram */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                  Front View
                </Typography>
                <Box sx={{ 
                  position: 'relative', 
                  width: '200px', 
                  height: '250px', 
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}>
                  {/* Shirt outline */}
                  <Box sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '50px',
                    width: '100px',
                    height: '200px',
                    border: '2px solid #333',
                    borderRadius: '4px',
                    background: '#fff'
                  }} />
                  
                  {/* Measurement arrows and labels */}
                  <Box sx={{ position: 'absolute', top: '30px', left: '20px' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      A- SLEEVE LENGTH
                    </Typography>
                    <Box sx={{ 
                      width: '2px', 
                      height: '60px', 
                      background: '#333',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '-2px',
                        width: '6px',
                        height: '6px',
                        background: '#333',
                        transform: 'rotate(45deg)'
                      }
                    }} />
                  </Box>
                  
                  <Box sx={{ position: 'absolute', top: '80px', left: '10px' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      B- CHEST WIDTH
                    </Typography>
                    <Box sx={{ 
                      width: '80px', 
                      height: '2px', 
                      background: '#333',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: '-2px',
                        width: '6px',
                        height: '6px',
                        background: '#333',
                        transform: 'rotate(45deg)'
                      }
                    }} />
                  </Box>
                  
                  <Box sx={{ position: 'absolute', top: '200px', left: '10px' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      C- BOTTOM HEM WIDTH
                    </Typography>
                    <Box sx={{ 
                      width: '80px', 
                      height: '2px', 
                      background: '#333',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: '-2px',
                        width: '6px',
                        height: '6px',
                        background: '#333',
                        transform: 'rotate(45deg)'
                      }
                    }} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Back view diagram */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                  Back View
                </Typography>
                <Box sx={{ 
                  position: 'relative', 
                  width: '200px', 
                  height: '250px', 
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}>
                  {/* Shirt outline */}
                  <Box sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '50px',
                    width: '100px',
                    height: '200px',
                    border: '2px solid #333',
                    borderRadius: '4px',
                    background: '#fff'
                  }} />
                  
                  {/* Measurement arrows and labels */}
                  <Box sx={{ position: 'absolute', top: '30px', left: '20px' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      D- SHOULDER WIDTH
                    </Typography>
                    <Box sx={{ 
                      width: '60px', 
                      height: '2px', 
                      background: '#333',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: '-2px',
                        width: '6px',
                        height: '6px',
                        background: '#333',
                        transform: 'rotate(45deg)'
                      }
                    }} />
                  </Box>
                  
                  <Box sx={{ position: 'absolute', top: '30px', left: '20px' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      E- LENGTH FROM (CB)
                    </Typography>
                    <Box sx={{ 
                      width: '2px', 
                      height: '180px', 
                      background: '#333',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '-2px',
                        width: '6px',
                        height: '6px',
                        background: '#333',
                        transform: 'rotate(45deg)'
                      }
                    }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Measurement Definitions */}
        <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>
            Measurement Definitions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                A- SLEEVE LENGTH (CENTER BACK):
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                For long sleeve, measure from center back of your neck, edge of shoulder, elbow and to your wrist. For short sleeve, measure from shoulder crown to the mid of your upper arm.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                B- CHEST WIDTH:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Measure under your arms, around the fullest part of your chest.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                C- BOTTOM HEM WIDTH:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Measure the width at the bottom of the garment.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                D- SHOULDER WIDTH:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                With arms straight down at sides, measure horizontally across the back from one side of the tip of the shoulder to the other side.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                E- LENGTH FROM CENTER BACK:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Measure vertically from the center of the neck line to the bottom hem.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer Note */}
        <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
            Note: The size help refers to the product measurements which may slightly vary according to design.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SizeChartDrawer;
