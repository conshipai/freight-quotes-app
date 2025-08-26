// src/components/PartnerQuotes/PendingQuotes.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const PendingQuotes = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode;
  
  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <Clock className="w-6 h-6 text-blue-500" />
        Quote Processing
      </h2>
      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
        Your quote is being processed. Fetching rates from carriers...
      </p>
    </div>
  );
};

export default PendingQuotes;
