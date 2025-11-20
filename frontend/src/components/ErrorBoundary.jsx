import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 4,
            textAlign: 'center',
          }}
        >
          <ErrorOutline 
            sx={{ 
              fontSize: 64, 
              color: 'error.main', 
              mb: 2 
            }} 
          />
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'error.main',
              mb: 2 
            }}
          >
            Something went wrong
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              mb: 3,
              maxWidth: '600px'
            }}
          >
            We're sorry, but something unexpected happened. This might be a temporary issue.
          </Typography>

          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              maxWidth: '600px',
              textAlign: 'left'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Error Details:
            </Typography>
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
              {this.state.error && this.state.error.toString()}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              Reload Page
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box sx={{ mt: 4, maxWidth: '800px', textAlign: 'left' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                Development Error Details:
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  border: '1px solid #ddd',
                }}
              >
                {this.state.errorInfo.componentStack}
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

