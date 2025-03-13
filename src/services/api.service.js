import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Identity API calls
const identityApi = {
  register: (data) => apiClient.post('/identity/register', data),
  update: (data) => apiClient.post('/identity/update', data),
  addChainIdentity: (data) => apiClient.post('/identity/chain', data),
  getByDID: (did) => apiClient.get(`/identity/did/${did}`),
  getByTokenId: (tokenId) => apiClient.get(`/identity/token/${tokenId}`),
  getChainIdentities: (tokenId) => apiClient.get(`/identity/chain/${tokenId}`),
  verifyChainAddress: (data) => apiClient.post('/identity/verify-chain', data),
};

// Verification API calls
const verificationApi = {
  request: (data) => apiClient.post('/verification/request', data),
  getById: (requestId) => apiClient.get(`/verification/request/${requestId}`),
  getByDID: (did) => apiClient.get(`/verification/did/${did}`),
  updateStatus: (requestId, data) => apiClient.put(`/verification/status/${requestId}`, data),
  complete: (requestId, data) => apiClient.post(`/verification/complete/${requestId}`, data),
  getPending: () => apiClient.get('/verification/pending'),
};

// Bridge API calls
const bridgeApi = {
  sendMessage: (data) => apiClient.post('/bridge/message', data),
  getById: (messageId) => apiClient.get(`/bridge/message/${messageId}`),
  getByChains: (sourceChain, targetChain) => apiClient.get(`/bridge/chains/${sourceChain}/${targetChain}`),
  updateStatus: (messageId, data) => apiClient.put(`/bridge/status/${messageId}`, data),
  getPendingMessages: (targetChain) => apiClient.get(`/bridge/pending/${targetChain}`),
};

// Authentication API calls
const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getProfile: () => apiClient.get('/auth/profile'),
};

export {
  apiClient,
  identityApi,
  verificationApi,
  bridgeApi,
  authApi,
};

