import React from 'react';
import { Ship } from 'lucide-react';

const ExportOcean = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode;
  
  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <Ship className="w-6 h-6 text-blue-500" />
        Ocean Export Quote
      </h2>
      <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <Ship className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Ocean Export functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default ExportOcean;
