// src/components/PartnerQuotes/ExportAir.jsx - Complete Version
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plane } from 'lucide-react';
import axios from 'axios';

import IncotermSelector from './IncotermSelector';
import OriginSection from './OriginSection';
import DestinationSection from './DestinationSection';
import CargoSection from '../shared/CargoSection';
import UnitSelector from '../shared/UnitSelector';
import CargoTypeSelector from './CargoTypeSelector';
import AircraftTypeSelector from './AircraftTypeSelector';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const convertDimensions = (cargo, units) => {
  return cargo.pieces.map(piece => ({
    ...piece,
    // Store original values with units
    weightLbs: units === 'imperial' ? Number(piece.weight || 0) : Number(piece.weight || 0) * 2.20462,
    weightKg: units === 'metric' ? Number(piece.weight || 0) : Number(piece.weight || 0) * 0.453592,
    lengthIn: units === 'imperial' ? Number(piece.length || 0) : Number(piece.length || 0) * 0.393701,
    lengthCm: units === 'metric' ? Number(piece.length || 0) : Number(piece.length || 0) * 2.54,
    widthIn: units === 'imperial' ? Number(piece.width || 0) : Number(piece.width || 0) * 0.393701,
    widthCm: units === 'metric' ? Number(piece.width || 0) : Number(piece.width || 0) * 2.54,
    heightIn: units === 'imperial' ? Number(piece.height || 0) : Number(piece.height || 0) * 0.393701,
    heightCm: units === 'metric' ? Number(piece.height || 0) : Number(piece.height || 0) * 2.54
  }));
};

// Helper function for calculating totals
const getTotals = (pieces, units) => {
  const totalPieces = pieces.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalWeightRaw = pieces.reduce(
    (sum, p) => sum + (Number(p.weight) || 0) * (Number(p.quantity) || 0),
    0
  );
  // Round nicely
  const totalWeight = Math.round((totalWeightRaw + Number.EPSILON) * 100) / 100;
  const displayWeight = `${totalWeight} ${units === 'metric' ? 'kg' : 'lbs'}`;
  return { totalPieces, totalWeight, displayWeight };
};

const ExportAir = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [selectedAirports, setSelectedAirports] = useState({
    origin: null,
    destination: null
  });

  const [formData, setFormData] = useState({
    pickupZip: '',
    originAirport: '',
    destinationAirport: '',
    incoterm: 'EXW',
    carriers: ['freightforce', 'pelicargo'],
    units: 'imperial',
    cargoType: 'general',
    aircraftType: 'passenger',
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

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleIncotermUpdate = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSelectedAirports(prev => ({
      origin: updates.incoterm === 'CPT' ? prev.origin : null,
      destination: prev.destination
    }));
  };

  const updateError = (field, value) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (value === null || value === undefined) {
        delete newErrors[field];
      } else {
        newErrors[field] = value;
      }
      return newErrors;
    });
  };

  const handleCargoChange = (cargo) => {
    setFormData(prev => ({ ...prev, cargo }));
  };

  const handleUnitsChange = (units) => {
    setFormData(prev => ({ ...prev, units }));
  };

  const handleCargoTypeChange = (cargoType) => {
    setFormData(prev => ({ ...prev, cargoType }));
  };

  const handleAircraftTypeChange = (aircraftType) => {
    setFormData(prev => ({ ...prev, aircraftType }));
  };

  const handleInsuranceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      insurance: { ...prev.insurance, [field]: value }
    }));
  };

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
        updateError('airports', response.data.error);
        return false;
      }

      return true;
    } catch (error) {
      if (error.response?.data?.error) {
        updateError('airports', error.response.data.error);
      }
      return false;
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.pickupZip && formData.incoterm === 'EXW') {
      newErrors.pickupZip = 'Pickup ZIP code is required';
    }
    
    if (errors.pickupZip && formData.incoterm === 'EXW') {
      newErrors.pickupZip = errors.pickupZip;
    }
    
    if (formData.incoterm === 'EXW' && formData.pickupZip && !formData.originAirport) {
      newErrors.pickupZip = `Pickup ZIP ${formData.pickupZip} is outside normal pickup areas. Please contact operations for a custom quote.`;
    }

    if (!formData.originAirport && formData.incoterm === 'CPT') {
      newErrors.originAirport = 'Origin airport is required';
    }

    if (!formData.destinationAirport) {
      newErrors.destinationAirport = 'Destination airport is required';
    }

    if (!formData.cargo.pieces.some(p => Number(p.weight) > 0)) {
      newErrors.cargo = 'At least one cargo piece with weight is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    if (formData.incoterm === 'CPT') {
      const airportsValid = await validateAirports();
      if (!airportsValid) {
        return false;
      }
    }

    return true;
  };

  // Keep submitQuote for potential future use with real API
  const submitQuote = async (quoteData) => {
    try {
      setLoading(true);
      setErrors({});

      const response = await axios.post(`${API_URL}/quotes/create`, {
        quoteType: 'export-air',
        userRole: 'foreign_partner',
        ...quoteData
      });

      if (response.data.success) {
        const requestNumber = response.data.data.requestNumber;
        
        // Navigate to pending page
        navigate('pending', {
          state: {
            requestNumber,
            origin: quoteData.originAirport,
            destination: quoteData.destinationAirport
          }
        });
      } else {
        throw new Error(response.data.error || 'Failed to create quote');
      }
    } catch (err) {
      console.error('Quote submission error:', err);
      setErrors({
        submit: err.response?.data?.error || err.message || 'Failed to create quote.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    // Convert dimensions to include both units
    const convertedCargo = {
      ...formData.cargo,
      pieces: convertDimensions(formData.cargo, formData.units)
    };

    // Check cargo type for routing
    if (formData.cargoType === 'batteries') {
      localStorage.setItem('tempQuoteData', JSON.stringify({
        ...formData,
        cargo: convertedCargo,
        aircraftType: formData.aircraftType
      }));
      
      navigate('../battery-details', {
        state: {
          quoteData: { ...formData, cargo: convertedCargo },
          aircraftType: formData.aircraftType
        }
      });
      return;
    }
    
    if (formData.cargoType === 'dangerous_goods') {
      localStorage.setItem('tempQuoteData', JSON.stringify({
        ...formData,
        cargo: convertedCargo,
        aircraftType: formData.aircraftType
      }));
      
      navigate('../dangerous-goods', {
        state: {
          quoteData: { ...formData, cargo: convertedCargo },
          aircraftType: formData.aircraftType
        }
      });
      return;
    }

    // General cargo - use mock response for Phase 1
    // Mock response for now
    const mockResponse = {
      success: true,
      data: {
        requestNumber: `REQ-2024-${Math.floor(Math.random() * 10000)}`,
        quoteNumber: `Q-2024-${Math.floor(Math.random() * 10000)}`,
      }
    };

    if (mockResponse.success) {
      const { totalPieces, displayWeight } = getTotals(formData.cargo.pieces, formData.units);
      
      navigate('/quotes/success', {
        state: {
          requestNumber: mockResponse.data.requestNumber,
          quoteNumber: mockResponse.data.quoteNumber,
          origin: formData.originAirport,
          destination: formData.destinationAirport,
          pieces: totalPieces,
          weight: displayWeight,
          hasBatteries: formData.cargoType === 'batteries',
          hasDG: formData.cargoType === 'dangerous_goods'
        }
      });
    }

    // For future real API implementation:
    // await submitQuote({
    //   ...formData,
    //   cargo: convertedCargo
    // });
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
        {Object.keys(errors).length > 0 && Object.values(errors).some(e => e) && (
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
                  {Object.values(errors).filter(error => error).map((error, idx) => (
                    <li key={idx} className={isDarkMode ? 'text-red-400' : 'text-red-700'}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Incoterm Selection */}
        <IncotermSelector
          formData={formData}
          onChange={handleIncotermUpdate}
          isDarkMode={isDarkMode}
        />

        {/* Origin Section */}
        <OriginSection
          formData={formData}
          onFormDataChange={updateFormData}
          selectedAirport={selectedAirports.origin}
          onAirportSelect={(airport) => setSelectedAirports(prev => ({ ...prev, origin: airport }))}
          errors={errors}
          onErrorChange={updateError}
          isDarkMode={isDarkMode}
        />

        {/* Destination Section */}
        <DestinationSection
          formData={formData}
          onFormDataChange={updateFormData}
          selectedAirport={selectedAirports.destination}
          onAirportSelect={(airport) => setSelectedAirports(prev => ({ ...prev, destination: airport }))}
          errors={errors}
          onErrorChange={updateError}
          isDarkMode={isDarkMode}
        />

        {/* Unit Selector */}
        <UnitSelector
          value={formData.units}
          onChange={handleUnitsChange}
          isDarkMode={isDarkMode}
        />

        {/* Cargo Section */}
        <CargoSection
          cargo={formData.cargo}
          onChange={handleCargoChange}
          units={formData.units}
          isDarkMode={isDarkMode}
          error={errors.cargo}
        />

        {/* Cargo Type Selection */}
        <CargoTypeSelector
          value={formData.cargoType}
          onChange={handleCargoTypeChange}
          isDarkMode={isDarkMode}
        />

        {/* Aircraft Type Selection - shows right before submit */}
        <AircraftTypeSelector
          value={formData.aircraftType}
          onChange={handleAircraftTypeChange}
          isDarkMode={isDarkMode}
        />

        {/* Insurance Option */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.insurance.requested}
              onChange={(e) => handleInsuranceChange('requested', e.target.checked)}
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
                onChange={(e) => handleInsuranceChange('value', parseFloat(e.target.value) || 0)}
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
