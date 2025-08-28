// src/components/CustomerQuotes/Booking/BookingPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const BookingPage = ({ shellContext }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  
  const { state } = location;

  // If no state, show error
  if (!state || !state.rate) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No Quote Selected
        </h2>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          State: {JSON.stringify(state)}
        </p>
        <button
          onClick={() => navigate('/quotes/ground')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start New Quote
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Booking Page
      </h1>
      <pre className={`p-4 rounded ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100'}`}>
        {JSON.stringify(state, null, 2)}
      </pre>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default BookingPage;
