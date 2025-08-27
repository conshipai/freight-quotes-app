// src/services/bookingNumbers.js
const BOOKING_NUMBER_KEY = 'booking_sequence_2025';

export const generateBookingNumber = () => {
  // Get current sequence from localStorage
  const currentSequence = parseInt(localStorage.getItem(BOOKING_NUMBER_KEY) || '0', 10);
  
  // Increment sequence
  const nextSequence = currentSequence + 1;
  
  // Save new sequence
  localStorage.setItem(BOOKING_NUMBER_KEY, nextSequence.toString());
  
  // Format booking number
  const year = new Date().getFullYear();
  const paddedSequence = nextSequence.toString().padStart(6, '0');
  
  return `B-${year}-${paddedSequence}`;
};

// Reset sequence (useful for testing or year change)
export const resetBookingSequence = () => {
  localStorage.setItem(BOOKING_NUMBER_KEY, '0');
};

// Get current sequence without incrementing
export const getCurrentBookingSequence = () => {
  return parseInt(localStorage.getItem(BOOKING_NUMBER_KEY) || '0', 10);
};
