import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Package, DollarSign, Plane, CheckCircle, Loader } from 'lucide-react';
import CargoSection from '../shared/CargoSection';
import UnitSelector from '../shared/UnitSelector';
import { airportAPI, quoteAPI } from '../../services/api';

const ExportAir = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationStatus, setValidationStatus] = useState({
    originAirport: null, // null, 'validating', 'valid', 'invalid'
    destinationAirport: null,
    pickupZip: null
  });
  const [airportInfo, setAirportInfo] = useState({
    origin: null,
    destination: null
  });
  
  const [formData, setFormData] = useState({
    // Origin (Door pickup)
    pickupZip: '',
    originAirport: '', // Will be auto-resolved from ZIP
    
    // Destination
    destinationAirport: '',
    
    // Incoterms for Foreign Partners
    incoterm: 'EXW', // EXW or CPT
    
    // Carrier selection based on incoterm
    carriers: ['freightforce', 'pelicargo'], // Will be updated based on selection
    
    // Units system
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
        stackable: true,
        cargoType: 'General'
      }]
    },
    
    // Insurance
    insurance: {
      requested: false,
      value: 0
    }
  });

  // Debounce timer for ZIP code lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.pickupZip && formData.pickupZip.length === 5 && formData.incoterm === 'EXW') {
        lookupZipCode(formData.pickupZip);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.pickupZip, formData.incoterm]);

  // Validate airport codes when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.originAirport && formData.originAirport.length === 3 && formData.incoterm === 'CPT') {
        validateAirportCode('origin', formData.originAirport);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.originAirport, formData.incoterm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.destinationAirport && formData.destinationAirport.length === 3) {
        validateAirportCode('destination', formData.destinationAirport);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.destinationAirport]);

  // Lookup ZIP code to get nearest airport
  const lookupZipCode = async (zipCode) => {
    setValidationStatus(prev => ({ ...prev, pickupZip: 'validating' }));
    
    try {
      const response = await airportAPI.getNearestAirport(zipCode);
      
      if (response.success && response.data) {
        setValidationStatus(prev => ({ ...prev, pickupZip: 'valid' }));
        setAirportInfo(prev => ({
          ...prev,
          origin: {
            code: response.data.airportCode,
            city: response.data.city,
            state: response.data.state,
            deliveryZone: response.data.deliveryZone
          }
        }));
        
        // Clear any ZIP error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.pickupZip;
          return newErrors;
        });
      } else {
        setValidationStatus(prev => ({ ...prev, pickupZip: 'invalid' }));
        setErrors(prev => ({
          ...prev,
          pickupZip: `No airport found for ZIP ${zipCode}`
        }));
      }
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, pickupZip: 'invalid' }));
      setErrors(prev => ({
        ...prev,
        pickupZip: 'Unable to find airport for this ZIP code'
      }));
    }
  };

  // Validate airport codes
  const validateAirportCode = async (type, code) => {
    const statusKey = type === 'origin' ? 'originAirport' : 'destinationAirport';
    setValidationStatus(prev => ({ ...prev, [statusKey]: 'validating' }));
    
    try {
      const response = await airportAPI.getAirportsByCodes(code);
      
      if (response.success && response.data && response.data[code]) {
        const airport = response.data[code];
        
        if (!airport.error) {
          setValidationStatus(prev => ({ ...prev, [statusKey]: 'valid' }));
          setAirportInfo(prev => ({
            ...prev,
            [type]: {
              code: airport.code,
              name: airport.name,
              city: airport.city,
              fullName: airport.fullName
            }
          }));
          
          // Clear any airport error
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[statusKey];
            return newErrors;
          });
        } else {
          setValidationStatus(prev => ({ ...prev, [statusKey]: 'invalid' }));
          setErrors(prev => ({
            ...prev,
            [statusKey]: `Airport code ${code} not found`
          }));
        }
      }
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, [statusKey]: 'invalid' }));
      setErrors(prev => ({
        ...prev,
        [statusKey]: 'Unable to validate airport code'
      }));
    }
  };

  // Handle Unit System Change
  const handleUnitChange = (unitSystem) => {
    setFormData(prev => ({
      ...prev,
      units: unitSystem
    }));
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
    
    // Clear certain validations when switching
    setValidationStatus(prev => ({
      ...prev,
      originAirport: null,
      pickupZip: null
    }));
    setAirportInfo(prev => ({
      ...prev,
      origin: null
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pickupZip && formData.incoterm === 'EXW') {
      newErrors.pickupZip = 'Pickup ZIP code is required';
    }
    
    if (!formData.originAirport && formData.incoterm === 'CPT') {
      newErrors.originAirport = 'Origin airport is required';
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

  // Submit quote to backend
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare the quote request data
      const quoteData = {
        // Origin information
        ...(formData.incoterm === 'EXW' 
          ? { 
              pickupZipCode: formData.pickupZip,
              origin: {
                zipCode: formData.pickupZip,
                city: airportInfo.origin?.city,
                state: airportInfo.origin?.state,
                airport: airportInfo.origin?.code // This will be resolved by backend
              }
            }
          : { 
              originAirport: formData.originAirport,
              origin: {
                airport: formData.originAirport
              }
            }
        ),
        
        // Destination
        destinationAirport: formData.destinationAirport,
        destination: {
          airport: formData.destinationAirport,
          city: airportInfo.destination?.city
        },
        
        // Cargo details
        cargo: {
          pieces: formData.cargo.pieces.map(p => ({
            quantity: p.quantity,
            weight: p.weight,
            length: p.length,
            width: p.width,
            height: p.height,
            commodity: p.commodity,
            cargoType: p.cargoType,
            stackable: p.stackable
          })),
          weightUnit: formData.units === 'imperial' ? 'lbs' : 'kg',
          dimensionUnit: formData.units === 'imperial' ? 'in' : 'cm'
        },
        
        // Service options
        services: ['standard'],
        carriers: formData.carriers,
        incoterm: formData.incoterm,
        
        // Insurance if requested
        ...(formData.insurance.requested && {
          insurance: {
            declaredValue: formData.insurance.value
          }
        }),
        
        // Apply markup (default true for partners)
        applyMarkup: true
      };
      
      console.log('Submitting quote:', quoteData);
      
      // Call the backend API
      const response = await quoteAPI.createQuote(quoteData);
      
      if (response.success) {
        // Show success message with quote ID
        const quoteId = response.data?.quoteNumber || response.data?._id || 'Generated';
        alert(`Quote ${quoteId} created successfully!`);
        
        // Navigate to quote details or list
        if (response.data?._id) {
          // You could navigate to a quote details page here
          // navigate(`/quotes/${response.data._id}`);
        }
        
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
              stackable: true,
              cargoType: 'General'
            }]
          },
          insurance: {
            requested: false,
            value: 0
          }
        });
        
        setAirportInfo({ origin: null, destination: null });
        setValidationStatus({ originAirport: null, destinationAirport: null, pickupZip: null });
        setErrors({});
        
      } else {
        alert(`Failed to create quote: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Quote submission error:', error);
      alert(`Error creating quote: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render validation icon
  const renderValidationIcon = (status) => {
    if (status === 'validating') return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === 'valid') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'invalid') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
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
            Origin Details
          </h3>
          
          {formData.incoterm === 'EXW' ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Pickup ZIP Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.pickupZip}
                  onChange={(e) => setFormData({...formData, pickupZip: e.target.value})}
                  placeholder="Enter 5-digit ZIP"
                  maxLength="5"
                  className={`w-full px-3 py-2 pr-10 rounded-md border ${
                    errors.pickupZip
                      ? 'border-red-300'
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-800 text-white'
                        : 'border-gray-300 bg-white'
                  }`}
                />
                <div className="absolute right-2 top-2.5">
                  {renderValidationIcon(validationStatus.pickupZip)}
                </div>
              </div>
              {airportInfo.origin && (
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ✓ Nearest airport: {airportInfo.origin.code} - {airportInfo.origin.city}, {airportInfo.origin.state}
                </p>
              )}
              {!airportInfo.origin && validationStatus.pickupZip !== 'invalid' && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  We'll automatically determine the nearest airport
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
              <div className="relative">
                <input
                  type="text"
                  value={formData.originAirport}
                  onChange={(e) => setFormData({...formData, originAirport: e.target.value.toUpperCase()})}
                  placeholder="e.g., JFK, LAX"
                  maxLength="3"
                  className={`w-full px-3 py-2 pr-10 rounded-md border uppercase ${
                    errors.originAirport
                      ? 'border-red-300'
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-800 text-white'
                        : 'border-gray-300 bg-white'
                  }`}
                />
                <div className="absolute right-2 top-2.5">
                  {renderValidationIcon(validationStatus.originAirport)}
                </div>
              </div>
              {airportInfo.origin && (
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ✓ {airportInfo.origin.fullName}
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
            <div className="relative">
              <input
                type="text"
                value={formData.destinationAirport}
                onChange={(e) => setFormData({...formData, destinationAirport: e.target.value.toUpperCase()})}
                placeholder="e.g., LHR, CDG, NRT"
                maxLength="3"
                className={`w-full px-3 py-2 pr-10 rounded-md border uppercase ${
                  errors.destination
                    ? 'border-red-300'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-white'
                      : 'border-gray-300 bg-white'
                }`}
              />
              <div className="absolute right-2 top-2.5">
                {renderValidationIcon(validationStatus.destinationAirport)}
              </div>
            </div>
            {airportInfo.destination && (
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ✓ {airportInfo.destination.fullName}
              </p>
            )}
          </div>
        </div>

        {/* Unit Selector */}
        <UnitSelector 
          value={formData.units}
          onChange={handleUnitChange}
          isDarkMode={isDarkMode}
        />

        {/* Cargo Section */}
        <CargoSection 
          cargo={formData.cargo}
          onChange={(cargo) => setFormData({...formData, cargo})}
          isDarkMode={isDarkMode}
          error={errors.cargo}
          unitSystem={formData.units}
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
            className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-conship-orange hover:bg-orange-600'
                  : 'bg-conship-purple hover:bg-purple-800'
            }`}
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Generating...' : 'Generate Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportAir;
