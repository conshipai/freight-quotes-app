// src/components/quotes/QuoteGenerator/AircraftTypeSection.jsx
import React from 'react';
import { useQuote } from '../../../contexts/QuoteContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Plane, AlertCircle, Info } from 'lucide-react';

const AircraftTypeSection = () => {
  const { currentQuote, updateQuote } = useQuote();
  const { isDarkMode } = useTheme();

  const handleAircraftTypeChange = (type) => {
    updateQuote({
      aircraftType: type
    });
  };

  return (
    <div className={`shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Aircraft Type Preference
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select based on your shipper status and location type
          </p>
        </div>
        <Plane className="h-6 w-6 text-blue-600" />
      </div>

      {/* Info Box about Known Shipper */}
      <div className={`mb-6 p-4 border rounded-lg ${
        isDarkMode 
          ? 'bg-blue-900/20 border-blue-800' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex">
          <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>
              Important: Known Shipper Status
            </p>
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-blue-400' : 'text-blue-800'
            }`}>
              This quote assumes the shipper is a "Known Shipper" by the TSA. 
              If shipping from a residential location or new company, please select "Cargo Aircraft Only" below.
            </p>
          </div>
        </div>
      </div>

      {/* Aircraft Type Selection */}
      <div className="space-y-3">
        <label className={`flex items-start cursor-pointer p-3 border rounded-lg transition-colors ${
          isDarkMode 
            ? 'border-gray-600 hover:bg-gray-700' 
            : 'border-gray-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="aircraft-type"
            value="passenger"
            checked={currentQuote.aircraftType !== 'cargo-only'}
            onChange={() => handleAircraftTypeChange('passenger')}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3 flex-1">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Passenger Aircraft Permitted
            </div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Standard option for Known Shippers. Cargo can fly on passenger or cargo aircraft.
            </p>
          </div>
        </label>

        <label className={`flex items-start cursor-pointer p-3 border rounded-lg transition-colors ${
          isDarkMode 
            ? 'border-gray-600 hover:bg-gray-700' 
            : 'border-gray-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="aircraft-type"
            value="cargo-only"
            checked={currentQuote.aircraftType === 'cargo-only'}
            onChange={() => handleAircraftTypeChange('cargo-only')}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3 flex-1">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Cargo Aircraft Only
            </div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Required for residential shippers or companies not registered as Known Shippers.
            </p>
          </div>
        </label>
      </div>

      {/* Additional Guidance */}
      <div className={`mt-6 p-4 border rounded-lg ${
        isDarkMode 
          ? 'bg-amber-900/20 border-amber-800' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex">
          <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            isDarkMode ? 'text-amber-400' : 'text-amber-600'
          }`} />
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-amber-300' : 'text-amber-900'
            }`}>
              When to select "Cargo Aircraft Only":
            </p>
            <ul className={`mt-2 text-sm space-y-1 ${
              isDarkMode ? 'text-amber-400' : 'text-amber-800'
            }`}>
              <li>• Shipping from a residential address</li>
              <li>• New company without TSA Known Shipper status</li>
              <li>• First-time international shippers</li>
              <li>• When specifically requested by customer</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Selection Display */}
      {currentQuote.aircraftType && (
        <div className={`mt-4 p-3 rounded-md ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-medium">Selected:</span>{' '}
            {currentQuote.aircraftType === 'cargo-only' 
              ? 'Cargo Aircraft Only - No passenger aircraft will be used'
              : 'Passenger Aircraft Permitted - Best rates available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AircraftTypeSection;
