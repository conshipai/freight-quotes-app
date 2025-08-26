import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plane } from 'lucide-react';
import axios from 'axios';

// Import modular components
import IncotermSelector from './IncotermSelector';
import OriginSection from './OriginSection';
import DestinationSection from './DestinationSection';
import CargoSection from '../shared/CargoSection';
import UnitSelector from '../shared/UnitSelector';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

  // Handle partial form data updates
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Handle Incoterm changes from selector
  const handleIncotermUpdate = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Reset selected airports based on mode
    setSelectedAirports(prev => ({
      origin: updates.incoterm === 'CPT' ? prev.origin : null,
      destination: prev.destination
    }));
  };

  // Handle error updates
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

  // Handle cargo changes
  const handleCargoChange = (cargo) => {
    console.log('Cargo updated:', cargo); // Debug log
    setFormData(prev => ({ ...prev, cargo }));
  };

  // Handle units change
  const handleUnitsChange = (units) => {
    setFormData(prev => ({ ...prev, units }));
  };

  // Handle insurance change
  const handleInsuranceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      insurance: { ...prev.insurance, [field]: value }
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

  // Validate form
  const validateForm = async () => {
    const newErrors = {};

    if (!formData.pickupZip && formData.incoterm === 'EXW') {
      newErrors.pickupZip = 'Pickup ZIP code is required';
    }
    
    // If there's already a ZIP error (outside pickup area), keep it
    if (errors.pickupZip && formData.incoterm === 'EXW') {
      newErrors.pickupZip = errors.pickupZip;
    }
    
    // If EXW mode with ZIP but no airport found
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
      let originAirport = formData.originAirport;

      // If EXW, get the nearest airport for the ZIP code
      if (formData.incoterm === 'EXW' && formData.pickupZip) {
        try {
          console.log('Looking up airport for ZIP:', formData.pickupZip);
          const airportResponse = await axios.post(
            `${API_URL}/airports/nearest-airport`,
            { zipCode: formData.pickupZip }
          );

          if (airportResponse.data.success && airportResponse.data.airport) {
            const foundAirport = airportResponse.data.airport;
            originAirport = foundAirport.code;

            setFormData(prev => ({ ...prev, originAirport: foundAirport.code }));
            setSelectedAirports(prev => ({ ...prev, origin: foundAirport }));

            const deliveryZone = foundAirport.deliveryZone ? ` (Zone ${foundAirport.deliveryZone})` : '';
            alert(`✅ Found airport for ZIP ${formData.pickupZip}:\n\n${foundAirport.code} - ${foundAirport.name || foundAirport.city}\n${foundAirport.city}, ${foundAirport.state}${deliveryZone}`);
          } else {
            updateError('pickupZip', `No airport found for ZIP ${formData.pickupZip}. Please switch to CPT mode and select origin airport manually.`);
            setFormData(prev => ({ ...prev, incoterm: 'CPT' }));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error finding airport:', error.response?.data || error);
          updateError('pickupZip', error.response?.data?.message || `Could not find airport for ZIP ${formData.pickupZip}. Please select manually.`);
          setFormData(prev => ({ ...prev, incoterm: 'CPT' }));
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
        updateError('airports', validateResponse.data.error);
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
              weightKg: formData.units === 'metric' ? Number(piece.weight) : Number(piece.weight) * 0.453592,
              lengthCm: formData.units === 'metric' ? Number(piece.length) : Number(piece.length) * 2.54,
              widthCm: formData.units === 'metric' ? Number(piece.width) : Number(piece.width) * 2.54,
              heightCm: formData.units === 'metric' ? Number(piece.height) : Number(piece.height) * 2.54,
            })),
            totalPieces: formData.cargo.pieces.reduce((sum, p) => sum + Number(p.quantity || 0), 0),
            totalWeight: formData.cargo.pieces.reduce((sum, p) => sum + (Number(p.weight || 0) * Number(p.quantity || 0)), 0),
            totalWeightKg: formData.cargo.pieces.reduce((sum, p) => {
              const weightKg = formData.units === 'metric' ? Number(p.weight || 0) : Number(p.weight || 0) * 0.453592;
              return sum + (weightKg * Number(p.quantity || 0));
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
        setSelectedAirports({ origin: null, destination: null });
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
          isDarkMode={isDarkMode}
          error={errors.cargo}
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
