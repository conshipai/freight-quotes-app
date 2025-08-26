import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Get IDs from server - used for DG and Battery forms
export const initializeQuote = async (quoteType = 'export-air') => {
  try {
    const response = await axios.post(`${API_URL}/quotes/init`, { 
      quoteType 
    });
    
    if (!response.data?.success) {
      throw new Error('Failed to initialize quote');
    }
    
    return {
      requestId: response.data.requestId,
      quoteId: response.data.quoteId,
      costId: response.data.costId
    };
  } catch (error) {
    console.error('Failed to initialize quote:', error);
    throw error;
  }
};

// Legacy function name for compatibility - redirects to new function
export const generateQuoteNumbers = initializeQuote;
