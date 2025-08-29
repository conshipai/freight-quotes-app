// src/components/UnifiedLayout/Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, Menu } from 'lucide-react';

const Navigation = ({ 
  isCollapsed, 
  setIsCollapsed, 
  mobileMenuOpen, 
  navigationItems, 
  shellContext 
}) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  
  return (
    <aside
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:relative
        h-full
        transition-all duration-300 ease-in-out
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        shadow-xl
        z-40
        flex flex-col
      `}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Freight Quotes
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              hidden lg:block
              p-1.5 rounded-md transition-colors
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
              }
            `}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${isActive
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-blue-50 text-blue-700'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Stats - Only when expanded */}
      {!isCollapsed && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">Quick Stats</p>
            <div className="flex justify-between">
              <span>Active Quotes:</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between">
              <span>This Week:</span>
              <span className="font-bold">48</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Navigation;
