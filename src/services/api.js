// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: 'https://api.gcc.conship.ai',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token if it exists (from shellContext or localStorage)
API.interceptors.request.use(
  (config) => {
    // Try to get token from shellContext first, then localStorage
    const token = window.shellContext?.token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Airport API methods
export const airportAPI = {
  // Get nearest airport from ZIP code
  getNearestAirport: async (zipCode) => {
    try {
      const response = await API.post('/airports/nearest-airport', { zipCode });
      return response.data;
    } catch (error) {
      console.error('Error getting nearest airport:', error);
      throw error;
    }
  },
  
  // Validate airport codes
  getAirportsByCodes: async (codes) => {
    try {
      const response = await API.get(`/airports/by-codes?codes=${codes}`);
      return response.data;
    } catch (error) {
      console.error('Error validating airport codes:', error);
      throw error;
    }
  }
};

// Quote API methods
export const quoteAPI = {
  // Create air quote
  createQuote: async (quoteData) => {
    try {
      const response = await API.post('/quotes/air', quoteData);
      return response.data;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  },
  
  // Get quote by ID
  getQuote: async (quoteId) => {
    try {
      const response = await API.get(`/quotes/${quoteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  },
  
  // Get quote history
  getQuoteHistory: async (params = {}) => {
    try {
      const response = await API.get('/quotes/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching quote history:', error);
      throw error;
    }
  }
};

export default API;
