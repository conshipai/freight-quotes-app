import axios from 'axios';

const API_URL = 'https://api.gcc.conship.ai/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    throw error;
  }
);
