// src/services/api/client.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional: Add response/request interceptors for error handling
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    throw error;
  }
);
