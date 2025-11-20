// Use environment variables for both development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

console.log('API Config:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_STORAGE_URL: import.meta.env.VITE_STORAGE_URL,
  API_BASE_URL: API_BASE_URL
});

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('admin_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  getHeaders(isFormData = false) {
    const headers = {
      'Accept': 'application/json',
    };

    // Only set Content-Type for JSON requests, not for FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Always check for the latest token from localStorage
    const currentToken = localStorage.getItem('admin_token');
    if (currentToken) {
      this.token = currentToken;
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
    };
    
    console.log('API Request:', { url, config, token: this.token });

    // Set headers based on whether it's FormData or not
    const isFormData = options.body instanceof FormData;
    config.headers = this.getHeaders(isFormData);

    console.log('API Request:', url, config);

    try {
      const response = await fetch(url, config);
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}...`);
      }
      
      console.log('API Response data:', data);
      console.log('API Response success field:', data.success);

      if (!response.ok) {
        // Handle validation errors (422)
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.values(data.errors).flat();
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        throw new Error(data.message || `Server error (${response.status}): ${data.error || 'An error occurred'}`);
      }

      console.log('✅ API request successful, returning data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  }

  async post(endpoint, data) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    const isFormData = data instanceof FormData;
    console.log('PUT request to:', endpoint);
    console.log('Is FormData:', isFormData);
    console.log('Data type:', typeof data);

    // IMPORTANT: PHP/Symfony do not parse multipart bodies on true PUT/PATCH.
    // For FormData, use POST with method override so Laravel can populate $request->all().
    if (isFormData) {
      if (!data.has('_method')) data.append('_method', 'PUT');
      return this.request(endpoint, {
        method: 'POST',
        body: data,
      });
    }

    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

      // Admin Authentication
      async adminLogin(credentials) {
        return this.request('/admin/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      }

      async adminSignup(userData) {
        return this.request('/admin/signup', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
      }

      async forgotPassword(data) {
        return this.request('/admin/forgot-password', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }

      async resetPassword(data) {
        return this.request('/admin/reset-password', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }

  async adminLogout() {
    return this.request('/admin/logout', {
      method: 'POST',
    });
  }

  async getAdminProfile() {
    return this.request('/admin/me');
  }

  // Admin Dashboard
  async getDashboard() {
    return this.request('/admin/dashboard');
  }

  // Admin Products
  async getAdminProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/products${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminProduct(id) {
    return this.request(`/admin/products/${id}`);
  }

  async createAdminProduct(productData) {
    const isFormData = productData instanceof FormData;
    const options = {
      method: 'POST',
      body: productData,
    };
    
    return this.request('/admin/products', options);
  }

  async updateAdminProduct(id, productData) {
    console.log('API: Updating product with ID:', id);
    console.log('API: Product data:', productData);
    
    // Add _method=PUT for Laravel to handle FormData with PUT
    if (productData instanceof FormData) {
      productData.append('_method', 'PUT');
    }
    
    const options = {
      method: 'POST', // Use POST with _method=PUT for FormData
      body: productData,
    };
    
    console.log('API: Request options:', options);
    
    return this.request(`/admin/products/${id}`, options);
  }

  async deleteAdminProduct(id) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }



  // Admin Categories
  async getAdminCategories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/categories${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminCategory(id) {
    return this.request(`/admin/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Inventory
  async getInventory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/inventory${queryString ? `?${queryString}` : ''}`);
  }


  async adjustStock(productId, stockData) {
    return this.request(`/admin/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  }

  async getInventoryHistory(productId) {
    return this.request(`/admin/inventory/${productId}/history`);
  }

  // Admin Orders
  async getAdminOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminOrder(id) {
    return this.request(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id, statusData) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  async updatePaymentStatus(id, paymentData) {
    return this.request(`/admin/orders/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  }

  async cancelOrder(id) {
    return this.request(`/admin/orders/${id}/cancel`, {
      method: 'POST',
    });
  }

  async refundOrder(id) {
    return this.request(`/admin/orders/${id}/refund`, {
      method: 'POST',
    });
  }

  // Customer APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.request('/products/featured');
  }

  async getNewArrivals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/products/new-arrivals?${queryString}` : '/products/new-arrivals';
    return this.request(url);
  }

  async getCarouselProducts() {
    return this.request('/products/carousel');
  }

  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  // Admin-specific methods
  async getAdminCategories() {
    return this.request('/admin/categories');
  }

  async getSubcategories() {
    return this.request('/subcategories');
  }

  async getNextProductId() {
    console.log('🔍 API Service - getNextProductId called');
    const response = await this.request('/products/next-id');
    console.log('🔍 API Service - getNextProductId response:', response);
    return response;
  }

  async calculateCart(cartData) {
    return this.request('/cart/calculate', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
  }

  async createOrder(orderData) {
    console.log('API: Creating order with data:', orderData);
    return this.request('/orders/with-variants', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }
}

export default new ApiService();
