import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const showError = (message, type = 'error') => {
    setError({ message, type });
    setOpen(true);
  };

  const showSuccess = (message) => {
    setError({ message, type: 'success' });
    setOpen(true);
  };

  const showWarning = (message) => {
    setError({ message, type: 'warning' });
    setOpen(true);
  };

  const showInfo = (message) => {
    setError({ message, type: 'info' });
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setError(null);
  };

  const value = {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {error && (
          <Alert
            onClose={handleClose}
            severity={error.type}
            sx={{ width: '100%' }}
          >
            {error.message}
          </Alert>
        )}
      </Snackbar>
    </ErrorContext.Provider>
  );
};


