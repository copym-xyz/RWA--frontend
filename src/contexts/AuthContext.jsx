import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if token is valid and not expired
  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && isTokenValid(token)) {
        try {
          // Set up axios auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch current user data
          const response = await axios.get(`${API_URL}/api/identity/me`);
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          logout(); // Token might be invalid or expired
        }
      } else {
        // Clear invalid token
        if (token) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      const { token: newToken, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Set up axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to login');
      throw error;
    }
  };

  // Register function
  const register = async (email, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/api/auth/register`, { email, password });
      
      const { token: newToken, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Set up axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user data
  const updateUser = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};