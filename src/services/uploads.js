// src/services/uploads.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @param {string} type - The type of file (e.g., 'msds', 'battery-cert')
 * @returns {Promise} - Promise resolving to upload response
 */
export const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Delete an uploaded file
 * @param {string} fileId - The ID of the file to delete
 * @returns {Promise} - Promise resolving to deletion response
 */
export const deleteFile = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Delete failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

// src/services/quotes.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Create a new quote
 * @param {Object} quoteData - The quote data
 * @returns {Promise} - Promise resolving to the created quote
 */
export const createQuote = async (quoteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(quoteData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create quote');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create quote error:', error);
    throw error;
  }
};

/**
 * Get all quotes for the current user
 * @returns {Promise} - Promise resolving to an array of quotes
 */
export const getQuotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch quotes error:', error);
    throw error;
  }
};

/**
 * Get a single quote by ID
 * @param {string} quoteId - The quote ID
 * @returns {Promise} - Promise resolving to the quote
 */
export const getQuoteById = async (quoteId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch quote error:', error);
    throw error;
  }
};

/**
 * Update a quote
 * @param {string} quoteId - The quote ID
 * @param {Object} updateData - The data to update
 * @returns {Promise} - Promise resolving to the updated quote
 */
export const updateQuote = async (quoteId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update quote');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update quote error:', error);
    throw error;
  }
};

/**
 * Delete a quote
 * @param {string} quoteId - The quote ID
 * @returns {Promise} - Promise resolving to deletion confirmation
 */
export const deleteQuote = async (quoteId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete quote');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete quote error:', error);
    throw error;
  }
};
