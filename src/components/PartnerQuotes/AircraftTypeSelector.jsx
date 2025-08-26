// src/components/PartnerQuotes/AircraftTypeSelector.jsx
import React from 'react';
import { Plane, AlertCircle, Info } from 'lucide-react';

const AircraftTypeSelector = ({ value, onChange, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Aircraft Type Preference
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select based on your shipper status
          </p>
        </div>
        <Plane className="h-6 w-6 text-blue-600" />
      </div>

      {/* Info Box */}
      <div className={`mb-4 p-3 border rounded-lg ${
        isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex">
          <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div className="ml-3">
            <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
              Known Shippers can use passenger aircraft for better rates. 
              Residential/new shippers must select "Cargo Aircraft Only".
            </p>
          </div>
        </div>
      </div>

      {/* Selection */}
      <div className="space-y-3">
        <label className={`flex items-start cursor-pointer p-3 border rounded-lg ${
          value === 'passenger'
            ? isDarkMode ? 'border-conship-orange bg-orange-900/20' : 'border-conship-purple bg-purple-50'
            : isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <input
            type="radio"
            value="passenger"
            checked={value === 'passenger'}
            onChange={() => onChange('passenger')}
            className="mt-1 h-4 w-4"
          />
          <div className="ml-3">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Passenger Aircraft Permitted
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              For Known Shippers - Best rates available
            </p>
          </div>
        </label>

        <label className={`flex items-start cursor-pointer p-3 border rounded-lg ${
          value === 'cargo-only'
            ? isDarkMode ? 'border-conship-orange bg-orange-900/20' : 'border-conship-purple bg-purple-50'
            : isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <input
            type="radio"
            value="cargo-only"
            checked={value === 'cargo-only'}
            onChange={() => onChange('cargo-only')}
            className="mt-1 h-4 w-4"
          />
          <div className="ml-3">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cargo Aircraft Only
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Required for residential/non-Known Shippers
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AircraftTypeSelector;
