import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.data.status === 'success') {
        setUser(response.data.data);
      }
    } catch (error) {
      // Don't show error toast for auth check
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await userService.login(credentials);
      if (response.data.status === 'success') {
        setUser(response.data.data);
        toast.success('Login successful!');
        return response;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await userService.signup(userData);
      if (response.data.status === 'success') {
        setUser(response.data.data);
        toast.success('Account created successfully!');
        return response;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      signup,
      isAuthenticated: !!user 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 