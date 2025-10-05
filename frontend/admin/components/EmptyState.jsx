import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  size = 'medium',
  variant = 'default' 
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 80;
      default: return 60;
    }
  };

  const getTitleVariant = () => {
    switch (size) {
      case 'small': return 'h6';
      case 'large': return 'h4';
      default: return 'h5';
    }
  };

  const getDescriptionVariant = () => {
    switch (size) {
      case 'small': return 'body2';
      case 'large': return 'body1';
      default: return 'body2';
    }
  };

  const getCardPadding = () => {
    switch (size) {
      case 'small': return 2;
      case 'large': return 6;
      default: return 4;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      case 'success': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <Card 
      sx={{ 
        textAlign: 'center',
        backgroundColor: variant === 'default' ? '#FAFAFA' : 'transparent',
        boxShadow: variant === 'default' ? 1 : 'none',
      }}
    >
      <CardContent sx={{ p: getCardPadding() }}>
        <Avatar
          sx={{
            width: getIconSize(),
            height: getIconSize(),
            backgroundColor: getIconColor(),
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Avatar>
        
        <Typography 
          variant={getTitleVariant()} 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1, 
            color: '#212121' 
          }}
        >
          {title}
        </Typography>
        
        {description && (
          <Typography 
            variant={getDescriptionVariant()} 
            sx={{ 
              mb: 3, 
              color: '#757575',
              maxWidth: 400,
              mx: 'auto'
            }}
          >
            {description}
          </Typography>
        )}
        
        {actionLabel && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              '&:hover': { backgroundColor: '#F57F17' },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;



