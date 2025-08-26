import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Package, Plane, Search } from 'lucide-react';
import CargoSection from '../shared/CargoSection';
import UnitSelector from '../shared/UnitSelector';
import axios from 'axios';

// Use the environment variable injected by webpack at build time
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ExportAir = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [airportSuggestions, setAirportSuggestions] = useState({
    origin: [],
    destination: []
  });
  const [searchingAirports, setSearchingAirports] = useState({
    origin: false,
    destination: false
  });
  
  const [formData, setFormData] = useState({
    pickupZip: '',
    originAirport: '',
    destinationAirport: '',
    incoterm: 'EXW',
    carriers: ['freightforce', 'pelicargo'],
    units: 'imperial',
    cargo: {
      pieces: [{
        id: 1,
        quantity: 1,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        commodity: '',
        stackable: true
      }]
    },
    insurance: {
      requested: false,
      value: 0
    }
  });

 const searchAirports = async (query, type) => {
  const q = (query || '').trim();
  if (q.length < 2) {
    setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
    return;
  }

  setSearchingAirports(prev => ({ ...prev, [type]: true }));

  try {
    console.log('Searching airports:', { query: q, type }); // Debug log

    const response = await axios.get(`${API_URL}/airports/search`, {
      params: {
        q,
        type: type === 'origin' ? 'domestic' : 'international'
      }
    });

    console.log('Airport search response:', response.data); // Debug log

    if (response.data?.success) {
      setAirportSuggestions(prev => ({
        ...prev,
        [type]: response.data.airports || []
      }));
    } else {
      setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
    }
  } catch (error) {
    console.error('Airport search error:', error);
    setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
  } finally {
    setSearchingAirports(prev => ({ ...prev, [type]: false }));
  }
};

  // Handle airport selection
  const selectAirport = (airport, type) => {
    if (type === 'origin') {
      setFormData(prev => ({ ...prev, originAirport: airport.code }));
      setErrors(prev => ({ ...prev, originAirport: null }));
    } else {
      setFormData(prev => ({ ...prev, destinationAirport: airport.code }));
      setErrors(prev => ({ ...prev, destinationAirport: null }));
    }
    setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  // Handle Incoterm change
  const handleIncotermChange = (value) => {
    let carriers = [];
    
    if (value === 'EXW') {
      carriers = ['freightforce', 'pelicargo'];
    } else if (value === 'CPT') {
      carriers = ['pelicargo'];
    }
    
    setFormData(prev => ({
      ...prev,
      incoterm: value,
      carriers: carriers
    }));
  };

  // Validate airports with backend
  const validateAirports = async () => {
    if (!formData.originAirport || !formData.destinationAirport) {
      return false;
    }

    try {
      const response = await axios.post(`${API_URL}/airports/validate`, {
        originCode: formData.originAirport,
        destinationCode: formData.destinationAirport
      });

      if (!response.data.success) {
        setErrors(prev => ({
          ...prev,
          airports: response.data.error
        }));
        return false;
      }

      return true;
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors(prev => ({
          ...prev,
          airports: error.response.data.error
        }));
      }
      return false;
    }
  };

  // Validate form
  const validateForm = async () => {
    const newErrors = {};
    
    if (!formData.pickupZip && formData.incoterm === 'EXW') {
      newErrors.pickupZip = 'Pickup ZIP code is required';
    }
    
    if (!formData.originAirport && formData.incoterm === 'CPT') {
      newErrors.originAirport = 'Origin airport is required';
    }
    
    if (!formData.destinationAirport) {
      newErrors.destinationAirport = 'Destination airport is required';
    }
    
    if (!formData.cargo.pieces.some(p => p.weight > 0)) {
      newErrors.cargo = 'At least one cargo piece with weight is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    // Validate airport pair if CPT
    if (formData.incoterm === 'CPT') {
      const airportsValid = await validateAirports();
      if (!airportsValid) {
        return false;
      }
    }

    return true;
  };

  // Submit quote to backend
  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // If EXW, get the nearest airport for the ZIP code
      let originAirport = formData.originAirport;
      
      if (formData.incoterm === 'EXW' && formData.pickupZip) {
        try {
          const airportResponse = await axios.post(`${API_URL}/airports/nearest`, { zipCode: formData.pickupZip });
            zipCode: formData.pickupZip
          });
          
          if (airportResponse.data.success) {
            originAirport = airportResponse.data.airport.code;
            console.log(`Found airport ${originAirport} for ZIP ${formData.pickupZip}`);
          } else {
            // If no mapping found, user must select manually
            setErrors(prev => ({
              ...prev,
              pickupZip: 'No airport found for this ZIP. Please select origin airport manually.'
            }));
            setFormData(prev => ({ ...prev, incoterm: 'CPT' }));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error finding airport:', error);
          setErrors(prev => ({
            ...prev,
            pickupZip: 'Could not find airport for this ZIP. Please select manually.'
          }));
          setLoading(false);
          return;
        }
      }
      
      // Validate the final airport pair
      const validateResponse = await axios.post(`${API_URL}/airports/validate`, {
        originCode: originAirport,
        destinationCode: formData.destinationAirport
      });

      if (!validateResponse.data.success) {
        setErrors(prev => ({
          ...prev,
          airports: validateResponse.data.error
        }));
        setLoading(false);
        return;
      }

      // Prepare the quote request
      const quoteRequest = {
        quoteType: 'export-air',
        userRole: 'foreign_partner',
        shipment: {
          origin: {
            airport: originAirport,
            city: validateResponse.data.origin.city,
            state: validateResponse.data.origin.state,
            zipCode: formData.pickupZip || ''
          },
          destination: {
            airport: formData.destinationAirport,
            city: validateResponse.data.destination.city,
            country: validateResponse.data.destination.country
          },
          cargo: {
            pieces: formData.cargo.pieces.map(piece => ({
              ...piece,
              weightKg: formData.units === 'metric' ? piece.weight : piece.weight * 0.453592,
              lengthCm: formData.units === 'metric' ? piece.length : piece.length * 2.54,
              widthCm: formData.units === 'metric' ? piece.width : piece.width * 2.54,
              heightCm: formData.units === 'metric' ? piece.height : piece.height * 2.54,
            })),
            totalPieces: formData.cargo.pieces.reduce((sum, p) => sum + p.quantity, 0),
            totalWeight: formData.cargo.pieces.reduce((sum, p) => sum + (p.weight * p.quantity), 0),
            totalWeightKg: formData.cargo.pieces.reduce((sum, p) => {
              const weightKg = formData.units === 'metric' ? p.weight : p.weight * 0.453592;
              return sum + (weightKg * p.quantity);
            }, 0)
          }
        },
        insurance: formData.insurance,
        incoterm: formData.incoterm,
        carriers: formData.carriers
      };
      
      console.log('Submitting quote request:', quoteRequest);
      
      // Submit to backend
      const response = await axios.post(`${API_URL}/quotes/create`, quoteRequest);
      
      if (response.data.success) {
        const requestNumber = response.data.data.requestNumber;
        
        alert(`Quote request ${requestNumber} submitted successfully!\n\nThe system is fetching rates from carriers.`);
        
        // Reset form
        setFormData({
          pickupZip: '',
          originAirport: '',
          destinationAirport: '',
          incoterm: 'EXW',
          carriers: ['freightforce', 'pelicargo'],
          units: 'imperial',
          cargo: {
            pieces: [{
              id: 1,
              quantity: 1,
              weight: 0,
              length: 0,
              width: 0,
              height: 0,
              commodity: '',
              stackable: true
            }]
          },
          insurance: {
            requested: false,
            value: 0
          }
        });
        
      } else {
        throw new Error(response.data.error || 'Failed to create quote');
      }
      
    } catch (error) {
      console.error('Quote submission error:', error);
      setErrors({ 
        submit: error.response?.data?.error || error.message || 'Failed to create quote.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <Plane className="w-6 h-6 text-conship-purple" />
          Air Export Quote
        </h2>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 text-sm list-disc pl-5">
                  {Object.values(errors).map((error, idx) => (
                    <li key={idx} className={isDarkMode ? 'text-red-400' : 'text-red-700'}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Incoterms Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Select Incoterm
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
              formData.incoterm === 'EXW'
                ? isDarkMode 
                  ? 'border-conship-orange bg-orange-900/20'
                  : 'border-conship-purple bg-purple-50'
                : isDarkMode
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="incoterm"
                value="EXW"
                checked={formData.incoterm === 'EXW'}
                onChange={(e) => handleIncotermChange(e.target.value)}
                className="mt-1"
              />
              <div className="ml-3">
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  EXW - Ex Works (Door to Airport)
                </div>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pickup from US door (ZIP code) to foreign airport
                </p>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-orange-400' : 'text-purple-600'}`}>
                  Available carriers: Freightforce & Pelicargo
                </p>
              </div>
            </label>

            <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
              formData.incoterm === 'CPT'
                ? isDarkMode 
                  ? 'border-conship-orange bg-orange-900/20'
                  : 'border-conship-purple bg-purple-50'
                : isDarkMode
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="incoterm"
                value="CPT"
                checked={formData.incoterm === 'CPT'}
                onChange={(e) => handleIncotermChange(e.target.value)}
                className="mt-1"
              />
              <div className="ml-3">
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  CPT - Carriage Paid To (Airport to Airport)
                </div>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  US airport to foreign airport
                </p>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-orange-400' : 'text-purple-600'}`}>
                  Available carrier: Pelicargo only
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Origin Section */}
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
                onChange={(e) => setFormData({...formData, pickupZip: e.target.value})}
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
                  onChange={(e) => {
                    setFormData({...formData, originAirport: e.target.value.toUpperCase()});
                    searchAirports(e.target.value, 'origin');
                  }}
                  placeholder="Search US airports (e.g., JFK, LAX)"
                  className={`w-full px-3 py-2 pr-10 rounded-md border uppercase ${
                    errors.originAirport
                      ? 'border-red-300'
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-800 text-white'
                        : 'border-gray-300 bg-white'
                  }`}
                />
                {searchingAirports.origin && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {airportSuggestions.origin.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
                }`}>
                  {airportSuggestions.origin.map(airport => (
                    <button
                      key={airport.code}
                      onClick={() => selectAirport(airport, 'origin')}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        isDarkMode ? 'hover:bg-gray-700' : ''
                      }`}
                    >
                      <span className="font-medium">{airport.code}</span> - {airport.name}, {airport.city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Destination Section */}
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
                onChange={(e) => {
                  setFormData({...formData, destinationAirport: e.target.value.toUpperCase()});
                  searchAirports(e.target.value, 'destination');
                }}
                placeholder="Search international airports (e.g., LHR, CDG)"
                className={`w-full px-3 py-2 pr-10 rounded-md border uppercase ${
                  errors.destinationAirport
                    ? 'border-red-300'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-white'
                      : 'border-gray-300 bg-white'
                }`}
              />
              {searchingAirports.destination && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {airportSuggestions.destination.length > 0 && (
              <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
              }`}>
                {airportSuggestions.destination.map(airport => (
                  <button
                    key={airport.code}
                    onClick={() => selectAirport(airport, 'destination')}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                      isDarkMode ? 'hover:bg-gray-700' : ''
                    }`}
                  >
                    <span className="font-medium">{airport.code}</span> - {airport.name}, {airport.city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unit Selector */}
        <UnitSelector 
          value={formData.units}
          onChange={(units) => setFormData({...formData, units})}
          isDarkMode={isDarkMode}
        />

        {/* Cargo Section */}
        <CargoSection 
          cargo={formData.cargo}
          onChange={(cargo) => setFormData({...formData, cargo})}
          isDarkMode={isDarkMode}
          error={errors.cargo}
        />

        {/* Insurance Option */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.insurance.requested}
              onChange={(e) => setFormData({
                ...formData, 
                insurance: {...formData.insurance, requested: e.target.checked}
              })}
              className="w-4 h-4 text-conship-purple"
            />
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add All Risk Insurance
            </span>
          </label>
          
          {formData.insurance.requested && (
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Insured Value (USD)
              </label>
              <input
                type="number"
                value={formData.insurance.value}
                onChange={(e) => setFormData({
                  ...formData,
                  insurance: {...formData.insurance, value: parseFloat(e.target.value) || 0}
                })}
                placeholder="Enter value"
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-800 text-white'
                    : 'border-gray-300 bg-white'
                }`}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`px-6 py-2 rounded-lg border ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-conship-orange hover:bg-orange-600'
                  : 'bg-conship-purple hover:bg-purple-800'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportAir;
