
// src/components/CustomerQuotes/Booking/index.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const BookingPage = () => {
  const { quoteId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Booking Page</h1>
      <p>Booking for Quote ID: {quoteId}</p>
    </div>
  );
};

export default BookingPage;
