// src/components/UnifiedLayout/TopBar.jsx
import React from 'react';
import ViewToggle from './ViewToggle';

const TopBar = ({ viewMode, canToggleView, setViewMode, shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  const user = shellContext?.user || {};
  
  return (
    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {viewMode === 'customer' ? 'Customer Portal' : 'Agent Portal'}
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user.name || 'User'}
            </p>
          </div>
          
          {/* View Toggle for Admins */}
          {canToggleView && (
            <ViewToggle
              currentView={viewMode}
              onToggle={setViewMode}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
