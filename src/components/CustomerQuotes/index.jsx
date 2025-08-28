// src/components/CustomerQuotes/index.jsx
import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Plane, Ship, Truck, ArrowDown, ArrowUp } from 'lucide-react';
import GroundQuotes from './GroundQuotes';
// import ImportAir from './ImportAir';
// import ImportOcean from './ImportOcean';
// import ExportAir from './ExportAir';
// import ExportOcean from './ExportOcean';

const CustomerQuotes = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode;
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <NavLink to="import-air" className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                  : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
              }`
            }>
              <ArrowDown className="w-4 h-4" />
              <Plane className="w-4 h-4" />
              Import Air
            </NavLink>
            
            <NavLink to="import-ocean" className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                  : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
              }`
            }>
              <ArrowDown className="w-4 h-4" />
              <Ship className="w-4 h-4" />
              Import Ocean
            </NavLink>
            
            <NavLink to="export-air" className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                  : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
              }`
            }>
              <ArrowUp className="w-4 h-4" />
              <Plane className="w-4 h-4" />
              Export Air
            </NavLink>
            
            <NavLink to="export-ocean" className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                  : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
              }`
            }>
              <ArrowUp className="w-4 h-4" />
              <Ship className="w-4 h-4" />
              Export Ocean
            </NavLink>
            
            <NavLink to="ground" className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                  : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
              }`
            }>
              <Truck className="w-4 h-4" />
              Ground
            </NavLink>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="import-air" element={<ImportAir shellContext={shellContext} />} />
          <Route path="import-ocean" element={<ImportOcean shellContext={shellContext} />} />
          <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
          <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
          <Route path="ground/*" element={<GroundQuotes shellContext={shellContext} />} />
          <Route path="*" element={
            <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Business Partner Quote Portal
              </h2>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Select a service type above to get started
              </p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default CustomerQuotes;
