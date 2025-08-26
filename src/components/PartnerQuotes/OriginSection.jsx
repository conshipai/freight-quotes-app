import React, { useState } from 'react';
import { AlertCircle, Plane } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const OriginSection = ({ 
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
        params: { q, type: 'domestic' }
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

  const handleZipChange = async (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 5);
    onFormDataChange({ pickupZip: digitsOnly });
    
    // Clear any previous ZIP errors when typing
    if (errors.pickupZip) {
      onErrorChange('pickupZip', null);
    }
    
    // Auto-lookup when 5 digits entered
    if (digitsOnly.length === 5) {
      try {
        const response = await axios.post(
          `${API_URL}/airports/nearest-airport`,
          { zipCode: digitsOnly }
        );
        
        if (response.data.success && response.data.airport) {
          const foundAirport = response.data.airport;
          onFormDataChange({ originAirport: foundAirport.code });
          onAirportSelect(foundAirport);
          onErrorChange('pickupZip', null);
        } else {
          // No airport found for this ZIP
          onFormDataChange({ originAirport: '' });
          onAirportSelect(null);
          onErrorChange('pickupZip', 
            `Pickup ZIP ${digitsOnly} is outside normal pickup areas. Please contact operations for a custom quote.`
          );
        }
      } catch (error) {
        console.error('Error finding airport:', error);
        onFormDataChange({ originAirport: '' });
        onAirportSelect(null);
        onErrorChange('pickupZip', 
          `Pickup ZIP ${digitsOnly} is outside normal pickup areas. Please contact operations for a custom quote.`
        );
      }
    } else {
      // Clear airport if ZIP incomplete
      onFormDataChange({ originAirport: '' });
      onAirportSelect(null);
    }
  };

  const handleAirportInputChange = (e) => {
    onFormDataChange({ originAirport: e.target.value.toUpperCase() });
    onAirportSelect(null);
    searchAirports(e.target.value);
    
    // Clear any airport-related errors when typing
    if (errors.originAirport || errors.airports) {
      onErrorChange('originAirport', null);
      onErrorChange('airports', null);
    }
  };

  const selectAirport = (airport) => {
    onFormDataChange({ originAirport: (airport.code || '').toUpperCase() });
    onAirportSelect(airport);
    onErrorChange('originAirport', null);
    onErrorChange('airports', null);
    setAirportSuggestions([]);
  };

  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Origin Details (US Domestic)
      </h3>

      {formData.incoterm === 'EXW' ? (
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Pickup ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.pickupZip}
            onChange={handleZipChange}
            placeholder="Enter 5-digit ZIP"
            maxLength="5"
            className={`w-full px-3 py-2 rounded-md border ${
              errors.pickupZip
                ? 'border-red-300'
                : isDarkMode
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white'
            }`}
          />
          
          {errors.pickupZip && (
            <div className={`mt-2 p-2 rounded flex items-start gap-2 ${
              isDarkMode 
                ? 'bg-red-900/20 border border-red-800' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} />
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                {errors.pickupZip}
              </p>
            </div>
          )}
          
          {/* Display found airport immediately after ZIP entry */}
          {selectedAirport && formData.incoterm === 'EXW' && (
            <div className={`mt-2 p-2 rounded ${
              isDarkMode 
                ? 'bg-green-900/20 border border-green-800' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                ✓ Airport found: {selectedAirport.code} - {selectedAirport.name}
              </p>
              <p className={`text-xs ${
                isDarkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                {selectedAirport.city}, {selectedAirport.state}
                {selectedAirport.deliveryZone && ` (Zone ${selectedAirport.deliveryZone})`}
              </p>
            </div>
          )}
          
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            We'll determine the nearest airport from your database
          </p>
        </div>
      ) : (
        <div className="relative">
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Origin Airport Code (US Only) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.originAirport}
              onChange={handleAirportInputChange}
              placeholder="Search US airports (e.g., JFK, LAX)"
              className={`w-full px-3 py-2 pr-10 rounded-md border uppercase ${
                errors.originAirport
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
                  <span className="font-medium">{airport.code}</span> - {airport.name}, {airport.city}
                </button>
              ))}
            </div>
          )}

          {errors.airports && (
            <p className="text-red-500 text-xs mt-2">{errors.airports}</p>
          )}

          {/* Visual chip for selected origin airport */}
          {selectedAirport && (
            <div className={`mt-3 p-3 rounded-md ${
              isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-2">
                <Plane className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-orange-400' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAirport.code} - {selectedAirport.name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedAirport.city}{selectedAirport.state ? `, ${selectedAirport.state}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OriginSection;
