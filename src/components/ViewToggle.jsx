// src/components/ViewToggle.jsx
import React from 'react';
import { Users, Building2 } from 'lucide-react';

const ViewToggle = ({ currentView, onToggle, isDarkMode }) => {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-lg ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <button
        onClick={() => onToggle('agent')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
          currentView === 'agent'
            ? isDarkMode 
              ? 'bg-conship-orange text-white' 
              : 'bg-conship-purple text-white'
            : isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        }`}
        title="Switch to Agent/Partner View"
      >
        <Building2 className="w-4 h-4" />
        <span>Agent</span>
      </button>
      <button
        onClick={() => onToggle('customer')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
          currentView === 'customer'
            ? isDarkMode 
              ? 'bg-conship-orange text-white' 
              : 'bg-conship-purple text-white'
            : isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        }`}
        title="Switch to Customer View"
      >
        <Users className="w-4 h-4" />
        <span>Customer</span>
      </button>
    </div>
  );
};

export default ViewToggle;
