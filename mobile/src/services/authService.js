import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        // You might want to dispatch a logout action here
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async logout() {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
  },

  async refreshToken() {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    return api.post('/auth/refresh', { refreshToken });
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token, password) {
    return api.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token) {
    return api.post('/auth/verify-email', { token });
  },
};

export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');
    return !!(token && user);
  } catch (error) {
    console.error('Check auth status error:', error);
    return false;
  }
};

export default api;