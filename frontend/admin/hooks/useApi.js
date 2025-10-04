import { useState, useEffect } from 'react';
import apiService from '../../src/services/api';
import { useError } from '../contexts/ErrorContext';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const execute = async (customUrl = url, customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get(customUrl, customOptions);
      
      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'API request failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      showError(errorMessage);
      console.error('API Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    return execute();
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      execute();
    }
  }, [url]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
  };
};

export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useError();

  const mutate = async (apiCall, successMessage = 'Operation completed successfully') => {
    try {
      setLoading(true);
      const response = await apiCall();
      
      if (response?.success) {
        showSuccess(successMessage);
        return response.data;
      } else {
        throw new Error(response?.message || 'Operation failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      showError(errorMessage);
      console.error('Mutation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    mutate,
  };
};


