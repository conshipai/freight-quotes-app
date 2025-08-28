import React from 'react';

const QuotesWidget = ({ context }) => {
  const { isDarkMode } = context;
  
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Recent Quotes
      </h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No recent quotes
      </p>
    </div>
  );
};

export default QuotesWidget;
