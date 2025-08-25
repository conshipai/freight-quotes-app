// src/components/PartnerQuotes/ExportAir.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Package, DollarSign, Plane } from 'lucide-react';
import CargoSection from '../shared/CargoSection';
import UnitSelector from '../shared/UnitSelector';
import { airportAPI, quoteAPI } from '../../services/api';

const ExportAir = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [airportInfo, setAirportInfo] = useState({
    origin: null,
    destination: null
  });
  
  const [formData, setFormData] = useState({
    // Origin (Door pickup or Airport)
    pickupZip: '',
    originAirport: '', // For CPT incoterm
    resolvedOriginAirport: '', // Auto-resolved from ZIP for EXW
    
    // Destination
    destinationAirport: '',
    
    // Incoterms for Foreign Partners
    incoterm: 'EXW', // EXW or CPT
    
    // Carrier selection based on incoterm
    carriers: ['freightforce', 'pelicargo'], // Initial for EXW
    
    // Unit system
    units: 'imperial', // 'imperial' or 'metric'
    
    // Cargo
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
    
    // Insurance
    insurance: {
      requested: false,
      value: 0
    }
  });

  // Handle ZIP code change and resolve airport for EXW
  const handleZipChange = async (value) => {
    setFormData(prev => ({ ...prev, pickupZip: value }));
    
    // Only resolve if it's a 5-digit ZIP
    if (value.length === 5 && formData.incoterm === 'EXW') {
      try {
        const result = await airportAPI.getNearestAirport(value);
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            resolvedOriginAirport: result.data.airportCode
          }));
          setAirportInfo(prev => ({
            ...prev,
            origin: {
              code: result.data.airportCode,
              city: result.data.city,
              state: result.data.state
            }
          }));
          // Clear any ZIP error
          setErrors(prev => ({ ...prev, pickupZip: null }));
        }
      } catch (error) {
        console.error('Failed to resolve airport:', error);
        setErrors(prev => ({ 
          ...prev, 
          pickupZip: 'Could not find airport for this ZIP code' 
        }));
      }
    }
  };

  // Handle destination airport validation
  const handleDestinationAirportChange = async (value) => {
    const upperValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, destinationAirport: upperValue }));
    
    // Validate when 3 letters are entered
    if (upperValue.length === 3) {
      try {
        const result = await airportAPI.getAirportsByCodes(upperValue);
        if (result.success && result.data[upperValue]) {
          const airport = result.data[upperValue];
          setAirportInfo(prev => ({
            ...prev,
            destination: {
              code: airport.code,
              name: airport.name,
              city: airport.city,
              country: airport.country
            }
          }));
          setErrors(prev => ({ ...prev, destination: null }));
        } else {
          setErrors(prev => ({ 
            ...prev, 
            destination: 'Invalid airport code' 
          }));
        }
      } catch (error) {
        console.error('Failed to validate airport:', error);
      }
    }
  };

  // Handle origin airport for CPT
  const handleOriginAirportChange = async (value) => {
    const upperValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, originAirport: upperValue }));
    
    // Validate when 3 letters are entered
    if (upperValue.length === 3) {
      try {
        const result = await airportAPI.getAirportsByCodes(upperValue);
        if (result.success && result.data[upperValue]) {
          const airport = result.data[upperValue];
          setAirportInfo(prev => ({
            ...prev,
            origin: {
              code: airport.code,
              name: airport.name,
              city: airport.city,
              state: airport.state
            }
          }));
          setErrors(prev => ({ ...prev, originAirport: null }));
        } else {
          setErrors(prev => ({ 
            ...prev, 
            originAirport: 'Invalid airport code' 
          }));
        }
      } catch (error) {
        console.error('Failed to validate airport:', error);
      }
    }
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
      carriers: carriers,
      // Clear fields not needed for the selected incoterm
      pickupZip: value === 'EXW' ? prev.pickupZip : '',
      originAirport: value === 'CPT' ? prev.originAirport : '',
      resolvedOriginAirport: value === 'EXW' ? prev.resolvedOriginAirport : ''
    }));
    
    // Clear related errors
    setErrors(prev => ({
      ...prev,
      pickupZip: null,
      originAirport: null
    }));
  };

  // Get weight/dimension labels based on unit system
  const getUnitLabels = () => {
    if (formData.units === 'metric') {
      return {
        weight: 'Weight (kg)',
        length: 'Length (cm)',
        width: 'Width (cm)',
        height: 'Height (cm)'
      };
    }
    return {
      weight: 'Weight (lbs)',
      length: 'Length (in)',
      width: 'Width (in)',
      height: 'Height (in)'
    };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.incoterm === 'EXW') {
      if (!formData.pickupZip) {
        newErrors.pickupZip = 'Pickup ZIP code is required';
      }
      if (!formData.resolvedOriginAirport) {
        newErrors.pickupZip = 'Unable to resolve airport for this ZIP';
      }
    } else if (formData.incoterm === 'CPT') {
      if (!formData.originAirport) {
        newErrors.originAirport = 'Origin airport is required';
      }
    }
    
    if (!formData.destinationAirport) {
      newErrors.destination = 'Destination airport is required';
    }
    
    if (!formData.cargo.pieces.some(p => p.weight > 0)) {
      newErrors.cargo = 'At least one cargo piece with weight is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Check for special cargo types
    const hasBatteries = formData.cargo.pieces.some(p => p.cargoType === 'Batteries');
    const hasDG = formData.cargo.pieces.some(p => p.cargoType === 'Dangerous Goods');
    
    // Navigate to special forms if needed
    if (hasDG && !hasBatteries) {
      navigate('/quotes/dg-details', { state: { draft: formData } });
      return;
    }
    
    if (hasBatteries && !hasDG) {
      navigate('/quotes/battery-details', { state: { draft: formData } });
      return;
    }
    
    if (hasDG && hasBatteries) {
      navigate('/quotes/dg-details', {
        state: { draft: formData, includeBatterySection: true }
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare request data
      const requestData = {
        ...formData,
        origin: {
          zipCode: formData.pickupZip || undefined,
          airport: formData.incoterm === 'EXW' 
            ? formData.resolvedOriginAirport 
            : formData.originAirport
        },
        destination: {
          airport: formData.destinationAirport
        },
        weightUnit: formData.units === 'metric' ? 'kg' : 'lbs',
        dimensionUnit: formData.units === 'metric' ? 'cm' : 'inches',
        userRole: 'foreign_partner',
        quoteType: 'export-air'
      };
      
      const response = await quoteAPI.createQuote(requestData);
      
      if (response.success) {
        navigate(`/quotes/${response.data.quoteId || response.data._id}`);
      }
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to create quote' 
      });
    } finally {
      setLoading(false);
    }
  };

  const unitLabels = getUnitLabels();

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
                  {Object.entries(errors).filter(([_, v]) => v).map(([key, error]) => (
                    <li key={key} className={isDarkMode ? 'text-red-400' : 'text-red-700'}>
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
            {/* EXW Option */}
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

            {/* CPT Option */}
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
            Origin Details
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
                onChange={(e) => handleZipChange(e.target.value)}
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
              {formData.resolvedOriginAirport && (
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ✓ Nearest airport: {formData.resolvedOriginAirport}
                  {airportInfo.origin && ` (${airportInfo.origin.city}, ${airportInfo.origin.state})`}
                </p>
              )}
              {!formData.resolvedOriginAirport && formData.pickupZip.length === 5 && (
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Resolving airport...
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Origin Airport Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.originAirport}
                onChange={(e) => handleOriginAirportChange(e.target.value)}
                placeholder="e.g., JFK, LAX"
                maxLength="3"
                className={`w-full px-3 py-2 rounded-md border uppercase ${
                  errors.originAirport
                    ? 'border-red-300'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-white'
                      : 'border-gray-300 bg-white'
                }`}
              />
              {airportInfo.origin && formData.originAirport.length === 3 && (
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ✓ {airportInfo.origin.name} - {airportInfo.origin.city}
                  {airportInfo.origin.state && `, ${airportInfo.origin.state}`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Destination Section */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Destination Details
          </h3>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Destination Airport Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.destinationAirport}
              onChange={(e) => handleDestinationAirportChange(e.target.value)}
              placeholder="e.g., LHR, CDG, NRT"
              maxLength="3"
              className={`w-full px-3 py-2 rounded-md border uppercase ${
                errors.destination
                  ? 'border-red-300'
                  : isDarkMode
                    ? 'border-gray-600 bg-gray-800 text-white'
                    : 'border-gray-300 bg-white'
              }`}
            />
            {airportInfo.destination && formData.destinationAirport.length === 3 && (
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ✓ {airportInfo.destination.name} - {airportInfo.destination.city}
                {airportInfo.destination.country && `, ${airportInfo.destination.country}`}
              </p>
            )}
          </div>
        </div>

        {/* Unit Selector */}
        <UnitSelector 
          value={formData.units}
          onChange={(units) => setFormData({...formData, units})}
          isDarkMode={isDarkMode}
        />

        {/* Cargo Section with dynamic labels */}
        <CargoSection 
          cargo={formData.cargo}
          onChange={(cargo) => setFormData({...formData, cargo})}
          isDarkMode={isDarkMode}
          error={errors.cargo}
          unitLabels={unitLabels}
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
