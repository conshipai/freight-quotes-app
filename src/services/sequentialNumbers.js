// src/services/sequentialNumbers.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'aip.gcc.conship.ai/api';

const getNextSequentialNumber = async (type = 'REQ') => {
  try {
    const response = await axios.post(`${API_URL}/sequences/next`, {
      type: type,
      year: new Date().getFullYear()
    });
    
    return response.data.number; // e.g., "REQ-2025-10001"
  } catch (error) {
    console.error('Failed to get sequential number:', error);
    // Fallback to timestamp-based ID
    return `${type}-${new Date().getFullYear()}-${Date.now()}`;
  }
};

export const generateQuoteNumbers = async () => {
  const baseNumber = await getNextSequentialNumber('REQ');
  const sequenceNumber = baseNumber.split('-')[2]; // Extract "10001"
  const year = new Date().getFullYear();
  
  return {
    requestId: `REQ-${year}-${sequenceNumber}`,
    quoteId: `Q-${year}-${sequenceNumber}`,
    costId: `C-${year}-${sequenceNumber}`
  };
};

export default getNextSequentialNumber;
