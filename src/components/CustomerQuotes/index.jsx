// src/components/CustomerQuotes/index.jsx - Updated
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Plane, Ship, Truck, 
  ArrowDown, ArrowUp, History, MapPin
} from 'lucide-react';
import CustomerDashboard from './Dashboard/CustomerDashboard';
import GroundQuotes from './GroundQuotes';
import ImportAir from './ImportAir';
import ImportOcean from './ImportOcean';
import ExportAir from './ExportAir';
import ExportOcean from './ExportOcean';
import SavedAddresses from './SavedAddresses';
import QuoteHistory from './QuoteHistory';

const CustomerQuotes = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode;
  const location = useLocation();
  const [showNavigation, setShowNavigation] = useState(true);
  
  // Hide navigation on dashboard
  useEffect(() => {
    setShowNavigation(!location.pathname.includes('dashboard'));
  }, [location]);
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {showNavigation && (
        <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8 overflow-x-auto">
              <NavLink to="dashboard" className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                    : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
                }`
              }>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              
              {/* ... rest of your existing navigation ... */}
              
              <NavLink to="history" className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                    : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
                }`
              }>
                <History className="w-4 h-4" />
                History
              </NavLink>
              
              <NavLink to="saved-addresses" className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? isDarkMode ? 'border-conship-orange text-conship-orange' : 'border-conship-purple text-conship-purple'
                    : isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'
                }`
              }>
                <MapPin className="w-4 h-4" />
                Addresses
              </NavLink>
            </nav>
          </div>
        </div>
      )}
      
      <div className={showNavigation ? 'max-w-7xl mx-auto px-4 py-6' : ''}>
        <Routes>
          <Route path="/" element={<CustomerDashboard shellContext={shellContext} />} />
          <Route path="dashboard" element={<CustomerDashboard shellContext={shellContext} />} />
          <Route path="import-air" element={<ImportAir shellContext={shellContext} />} />
          <Route path="import-ocean" element={<ImportOcean shellContext={shellContext} />} />
          <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
          <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
          <Route path="ground/*" element={<GroundQuotes shellContext={shellContext} />} />
          <Route path="history" element={<QuoteHistory shellContext={shellContext} />} />
          <Route path="saved-addresses" element={<SavedAddresses shellContext={shellContext} />} />
        </Routes>
      </div>
    </div>
  );
};

export default CustomerQuotes;
