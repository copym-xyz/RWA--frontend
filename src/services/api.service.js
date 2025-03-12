import axios from 'axios';

/**
 * Service for API communications
 */
class ApiService {
  constructor() {
    // Get API URL from environment
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Get token from localStorage if available
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // Handle error responses
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        
        // If unauthorized (401), clear token
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
        }
        
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  /**
   * Make a GET request
   * @param {string} url - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async get(url, params = {}) {
    try {
      return await this.axiosInstance.get(url, { params });
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<any>} Response data
   */
  async post(url, data = {}) {
    try {
      return await this.axiosInstance.post(url, data);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<any>} Response data
   */
  async put(url, data = {}) {
    try {
      return await this.axiosInstance.put(url, data);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param {string} url - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async delete(url, params = {}) {
    try {
      return await this.axiosInstance.delete(url, { params });
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Upload a file
   * @param {string} url - API endpoint
   * @param {File} file - File to upload
   * @param {Object} additionalData - Additional form data
   * @returns {Promise<any>} Response data
   */
  async uploadFile(url, file, additionalData = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add any additional data
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      return await this.axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error(`File upload to ${url} failed:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();