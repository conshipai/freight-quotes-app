import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Plane, Ship, Truck, ArrowDown, ArrowUp } from 'lucide-react';

const CustomerQuotes = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode;
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <NavLink to="/import-air" className="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
              <ArrowDown className="w-4 h-4" />
              <Plane className="w-4 h-4" />
              Import Air
            </NavLink>
            <NavLink to="/import-ocean" className="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
              <ArrowDown className="w-4 h-4" />
              <Ship className="w-4 h-4" />
              Import Ocean
            </NavLink>
            <NavLink to="/export-air" className="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
              <ArrowUp className="w-4 h-4" />
              <Plane className="w-4 h-4" />
              Export Air
            </NavLink>
            <NavLink to="/export-ocean" className="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
              <ArrowUp className="w-4 h-4" />
              <Ship className="w-4 h-4" />
              Export Ocean
            </NavLink>
            <NavLink to="/ground" className="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Ground
            </NavLink>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Customer Quote Portal
          </h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Import/Export and Ground shipping quotes coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerQuotes;
