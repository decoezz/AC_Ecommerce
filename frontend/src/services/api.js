import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure CORS credentials are always included
    config.withCredentials = true;
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please check if the server is running.');
      console.error('Server connection error:', error);
    } else if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Test connection function
const testConnection = async () => {
  try {
    await api.get('/test');
    console.log('Server connection successful');
    return true;
  } catch (error) {
    console.error('Server connection failed:', error);
    return false;
  }
};

export const userService = {
  testConnection,
  signup: async (userData) => {
    try {
      const response = await api.post('/users/signup', userData);
      return response;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please ensure the server is running.');
      }
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please ensure the server is running.');
      }
      throw error;
    }
  },
  logout: () => api.get('/users/logout'),
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please ensure the server is running.');
      }
      throw error;
    }
  },
  getAllUsers: (query) => api.get(`/users${query || ''}`),
  getUser: (id) => api.get(`/users/${id}`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const productService = {
  getAllProducts: (query) => api.get(`/products${query || ''}`),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.patch(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const orderService = {
  getUserOrders: (userId) => api.get(`/orders/${userId}/user`),
};

export default api; 