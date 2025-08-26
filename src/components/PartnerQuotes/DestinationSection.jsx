import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DestinationSection = ({ 
  formData, 
  onFormDataChange,
  selectedAirport,
  onAirportSelect,
  errors,
  onErrorChange,
  isDarkMode 
}) => {
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [searchingAirports, setSearchingAirports] = useState(false);

  const searchAirports = async (query) => {
    const q = (query || '').trim();
    if (q.length < 2) {
      setAirportSuggestions([]);
      return;
    }

    setSearchingAirports(true);
    try {
      const response = await axios.get(`${API_URL}/airports/search`, {
        params: { q, type: 'international' }
      });

      if (response.data?.success) {
        setAirportSuggestions(response.data.airports || []);
      } else {
        setAirportSuggestions([]);
      }
    } catch (error) {
      console.error('Airport search error:', error);
      setAirportSuggestions([]);
    } finally {
      setSearchingAirports(false);
    }
  };

  const handleAirportInputChange = (e) => {
    onFormDataChange({ destinationAirport: e.target.value.toUpperCase() });
    onAirportSelect(null);
    searchAirports(e.target.value);
    
    // Clear any airport-related errors when typing
    if (errors.destinationAirport || errors.airports) {
      onErrorChange('destinationAirport', null);
      onErrorChange('airports', null);
    }
  };

  const selectAirport = (airport) => {
    onFormDataChange({ destinationAirport: (airport.code || '').toUpperCase() });
    onAirportSelect(airport);
    onErrorChange('destinationAirport', null);
    onErrorChange('airports', null);
    setAirportSuggestions([]);
  };

  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Destination Details (International)
      </h3>

      <div className="relative">
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Destination Airport Code (Non-US) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.destinationAirport}
            onChange={handleAirportInputChange}
            placeholder="Search international airports (e.g., LHR, CDG)"
            className={`w-full px-3 py-2 pr-10 rounded-md border uppercase ${
              errors.destinationAirport
                ? 'border-red-300'
                : isDarkMode
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white'
            }`}
          />
          {searchingAirports && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        {airportSuggestions.length > 0 && (
          <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
          }`}>
            {airportSuggestions.map(airport => (
              <button
                key={airport.code}
                onClick={() => selectAirport(airport)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                  isDarkMode ? 'hover:bg-gray-700' : ''
                }`}
              >
                <span className="font-medium">{airport.code}</span> - {airport.name}
                {airport.city && `, ${airport.city}`}
                {airport.country && ` (${airport.country})`}
              </button>
            ))}
          </div>
        )}

        {errors.airports && (
          <p className="text-red-500 text-xs mt-2">{errors.airports}</p>
        )}

        {/* Visual chip for selected destination airport */}
        {selectedAirport && (
          <div className={`mt-3 p-3 rounded-md ${
            isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-start gap-2">
              <Plane className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-orange-400' : 'text-green-500'}`} />
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedAirport.code} - {selectedAirport.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedAirport.country}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationSection;
