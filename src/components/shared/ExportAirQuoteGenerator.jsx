// src/components/shared/ExportAirQuoteGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Info, Globe, DollarSign, Shield } from 'lucide-react';
import { getAvailableIncoterms, INCOTERM_DETAILS, getUserType } from '../../utils/serviceAccess';

// Import reusable components (these would be in the shared folder)
import UnitSelector from './UnitSelector';
import CargoSection from './CargoSection';
import ServiceOptions from './ServiceOptions';
import InsuranceSection from './InsuranceSection';
import AircraftTypeSection from './AircraftTypeSection';

const ExportAirQuoteGenerator = ({ user, isDarkMode = false }) => {
  const navigate = useNavigate();
  const userType = getUserType(user);
  const availableIncoterms = getAvailableIncoterms(userType, 'air');

  // Form state
  const [formData, setFormData] = useState({
    serviceType: 'export-air',
    userType: userType,
    units: {
      weight: 'lbs',
      dimensions: 'in'
    },
    origin: {
      zipCode: '',
      airport: '',
      city: '',
      state: ''
    },
    destination: {
      airport: '',
      country: ''
    },
    cargo: {
      pieces: [{
        quantity: 1,
        weight: '',
        length: '',
        width: '',
        height: '',
        cargoType: 'general'
      }]
    },
    services: {
      pickupRequired: false,
      packingRequired: false,
      customsClearance: false
    },
    insurance: {
      requested: false,
      commodity: '',
      insuredValue: 0
    },
    preferAircraftType: 'any'
  });

  // Export-specific state
  const [selectedIncoterm, setSelectedIncoterm] = useState(availableIncoterms[0] || 'CPT');
  const [originCompany, setOriginCompany] = useState({
    companyName: '',
    address: '',
    city: '',
    state: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [destinationCompany, setDestinationCompany] = useState({
    companyName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [ddpInfo, setDdpInfo] = useState({
    fobValue: '',
    hsCode: ''
  });
  
  // UI state
  const [localErrors, setLocalErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resolvingZip, setResolvingZip] = useState(false);
  const [zipError, setZipError] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [validatingAirport, setValidatingAirport] = useState(false);
  const [airportValidation, setAirportValidation] = useState({ valid: null, message: '' });

  // Auto-enable insurance for CIP
  useEffect(() => {
    const incotermDetails = INCOTERM_DETAILS[selectedIncoterm];
    if (incotermDetails?.requiresInsurance) {
      setFormData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          requested: true
        }
      }));
    }
  }, [selectedIncoterm]);

  // Handle ZIP code change with auto-resolution
  const handleZipChange = async (e) => {
    const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, origin: { ...prev.origin, zipCode: zip } }));
    setZipError('');

    if (zip.length < 5) {
      setFormData(prev => ({
        ...prev,
        origin: { ...prev.origin, airport: '', city: '', state: '' }
      }));
    }

    if (zip.length === 5) {
      setResolvingZip(true);
      try {
        // This is the only API call we keep - ZIP to airport resolution
        const response = await fetch(`/api/airports/nearest?zip=${zip}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            origin: {
              ...prev.origin,
              airport: result.data.airport || result.data.code,
              city: result.data.city,
              state: result.data.state
            }
          }));
          setOriginCompany(prev => ({
            ...prev,
            city: result.data.city || prev.city,
            state: result.data.state || prev.state
          }));
        } else {
          setZipError(result.error || 'Unable to find airport for this ZIP code');
        }
      } catch (err) {
        setZipError('Unable to find airport for this ZIP code');
      } finally {
        setResolvingZip(false);
      }
    }
  };

  // Validate destination airport
  const validateDestinationAirport = (code) => {
    if (!code || code.length !== 3) {
      setAirportValidation({ valid: null, message: '' });
      return;
    }

    // Basic validation - just check format
    const isValid = /^[A-Z]{3}$/.test(code);
    
    if (isValid) {
      setAirportValidation({ 
        valid: true, 
        message: `✓ ${code} - International airport` 
      });
      setFormData(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          airport: code
        }
      }));
    } else {
      setAirportValidation({ 
        valid: false, 
        message: 'Must be 3-letter airport code' 
      });
    }
  };

  // Form validation
  const validateQuote = () => {
    const errors = {};

    // ZIP is mandatory
    if (!formData.origin.zipCode || !/^\d{5}$/.test(formData.origin.zipCode)) {
      errors.zip = 'Please enter a valid 5-digit ZIP code';
    }

    // Origin airport must be resolved
    if (!formData.origin.airport?.trim()) {
      errors.origin = 'Please enter a valid ZIP code to determine origin airport';
    }

    // Destination airport required
    if (!formData.destination.airport?.trim()) {
      errors.destination = 'Please select a destination airport';
    }

    // Cargo validation
    const hasValidCargo = formData.cargo.pieces.some(
      piece => Number(piece.quantity) > 0 && Number(piece.weight) > 0
    );
    if (!hasValidCargo) {
      errors.cargo = 'Please enter at least one cargo piece with valid weight';
    }

    // CIP requires insurance details
    if (selectedIncoterm === 'CIP') {
      if (!formData.insurance.commodity?.trim()) {
        errors.insurance = 'Commodity description is required for CIP terms';
      }
      if (!formData.insurance.insuredValue || formData.insurance.insuredValue <= 0) {
        errors.insurance = 'Insurance value is required for CIP terms';
      }
    }

    // DAP/DDP requires destination company details
    if (selectedIncoterm === 'DAP' || selectedIncoterm === 'DDP') {
      if (!destinationCompany.companyName?.trim()) {
        errors.destinationCompanyName = 'Destination company name is required for DAP/DDP terms';
      }
      if (!destinationCompany.address?.trim()) {
        errors.destinationAddress = 'Destination address is required for DAP/DDP terms';
      }
      if (!destinationCompany.city?.trim()) {
        errors.destinationCity = 'Destination city is required for DAP/DDP terms';
      }
      if (!destinationCompany.country?.trim()) {
        errors.destinationCountry = 'Destination country is required for DAP/DDP terms';
      }
    }

    // DDP requires FOB value and HS code
    if (selectedIncoterm === 'DDP') {
      if (!ddpInfo.fobValue || ddpInfo.fobValue <= 0) {
        errors.fobValue = 'FOB value is required for DDP terms';
      }
      if (!ddpInfo.hsCode?.trim()) {
        errors.hsCode = 'HS code is required for DDP terms';
      }
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission - Just create request ID
  const handleSubmit = async () => {
    if (!validateQuote()) return;

    // Check for special cargo types
    const pieces = formData.cargo.pieces || [];
    const hasDG = pieces.some(p => (p?.cargoType || '').toLowerCase() === 'dangerous goods');
    const hasBatteries = pieces.some(p => (p?.cargoType || '').toLowerCase() === 'batteries');

    // Navigate to special forms if needed
    if (hasDG && !hasBatteries) {
      return navigate('/quotes/dg-details', { state: { draft: formData } });
    }
    if (hasBatteries && !hasDG) {
      return navigate('/quotes/battery-details', { state: { draft: formData } });
    }
    if (hasDG && hasBatteries) {
      return navigate('/quotes/dg-details', {
        state: { draft: formData, includeBatterySection: true },
      });
    }

    setLoading(true);
    try {
      // Prepare the payload
      const payload = {
        ...formData,
        serviceType: 'export-air',
        incoterm: selectedIncoterm,
        originCompany: {
          ...originCompany,
          zipCode: formData.origin.zipCode
        },
        ...((selectedIncoterm === 'DAP' || selectedIncoterm === 'DDP') && {
          destinationCompany
        }),
        ...(selectedIncoterm === 'DDP' && {
          fobValue: parseFloat(ddpInfo.fobValue),
          hsCode: ddpInfo.hsCode
        }),
        status: (selectedIncoterm === 'DAP' || selectedIncoterm === 'DDP') 
          ? 'awaiting_destination_costs' 
          : 'pending'
      };

      // Just create a request ID - no direct API calls
      const response = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to success page with request ID
        navigate('/quotes/success', {
          state: {
            requestId: result.requestId,
            origin: formData.origin.airport,
            destination: formData.destination.airport,
            incoterm: selectedIncoterm,
            status: payload.status
          }
        });
      } else {
        setLocalErrors({ submit: result.error || 'Failed to create quote request' });
      }
    } catch (err) {
      setLocalErrors({ submit: 'Failed to submit quote request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Export Air Quote Generator
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate an international air freight export quote
          </p>
        </div>

        {/* Error Display */}
        {Object.keys(localErrors).length > 0 && (
          <div className={`mb-6 border rounded-lg p-4 ${
            isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-400'}`} />
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                  Please fix the following errors:
                </h3>
                <ul className={`mt-2 text-sm list-disc pl-5 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                  {Object.values(localErrors).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Incoterms Selection */}
          <div className={`shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Incoterms 2020
              </h2>
            </div>
            
            <div className="space-y-3">
              {availableIncoterms.map((incotermCode) => {
                const term = INCOTERM_DETAILS[incotermCode];
                return (
                  <label
                    key={term.code}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedIncoterm === term.code
                        ? isDarkMode 
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="incoterm"
                      value={term.code}
                      checked={selectedIncoterm === term.code}
                      onChange={(e) => setSelectedIncoterm(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {term.code}
                        </span>
                        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          - {term.name}
                        </span>
                        {term.requiresInsurance && (
                          <Shield className="ml-2 h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {term.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Warning for DAP/DDP */}
            {(selectedIncoterm === 'DAP' || selectedIncoterm === 'DDP') && (
              <div className={`mt-4 p-4 border rounded-lg ${
                isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`} />
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-amber-400' : 'text-amber-800'
                    }`}>
                      Important: Door Delivery Service
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      {selectedIncoterm === 'DAP' 
                        ? 'DAP terms include delivery to the destination address. You will need to provide complete destination details below.'
                        : 'DDP terms include delivery to the destination address plus all customs duties and taxes. You will need to provide complete destination details and customs information below.'
                      }
                    </p>
                    <p className={`text-sm mt-2 ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      You will receive an email when destination charges are calculated and the complete quote is ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Origin Company Details */}
          <div className={`shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Origin Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ZIP Code - Mandatory */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.origin.zipCode}
                    onChange={handleZipChange}
                    placeholder="Enter 5-digit ZIP"
                    maxLength="5"
                    className={`w-full px-3 py-2 border rounded-md ${
                      localErrors.zip 
                        ? 'border-red-300' 
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  />
                  {resolvingZip && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                {zipError && (
                  <p className="mt-1 text-sm text-red-600">{zipError}</p>
                )}
                {formData.origin.airport && !zipError && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ Origin Airport: {formData.origin.airport}
                  </p>
                )}
              </div>

              {/* Company Name - Optional */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={originCompany.companyName}
                  onChange={(e) => setOriginCompany({...originCompany, companyName: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              {/* Additional fields... */}
            </div>
          </div>

          {/* Destination Details */}
          <div className={`shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Destination Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destination Airport */}
              <div className={selectedIncoterm === 'DAP' || selectedIncoterm === 'DDP' ? 'md:col-span-2' : ''}>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Destination Airport Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                      setDestinationInput(value);
                      validateDestinationAirport(value);
                    }}
                    placeholder="Enter 3-letter code (e.g., LHR)"
                    maxLength="3"
                    className={`w-full px-3 py-2 border rounded-md uppercase ${
                      localErrors.destination || (airportValidation.valid === false)
                        ? 'border-red-300' 
                        : airportValidation.valid === true
                          ? 'border-green-500'
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
                
                {/* Validation message */}
                {airportValidation.message && (
                  <p className={`mt-1 text-sm ${
                    airportValidation.valid 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {airportValidation.message}
                  </p>
                )}
                
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter the 3-letter IATA code for an international airport
                </p>
              </div>

              {/* Destination Company Details - Required for DAP/DDP */}
              {(selectedIncoterm === 'DAP' || selectedIncoterm === 'DDP') && (
                <>
                  {/* Company fields for DAP/DDP */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={destinationCompany.companyName}
                      onChange={(e) => setDestinationCompany({...destinationCompany, companyName: e.target.value})}
                      placeholder="Destination company name"
                      className={`w-full px-3 py-2 border rounded-md ${
                        localErrors.destinationCompanyName 
                          ? 'border-red-300' 
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white'
                      }`}
                    />
                  </div>
                  {/* Additional destination fields... */}
                </>
              )}
            </div>
          </div>

          {/* Unit Selector */}
          <UnitSelector 
            value={formData.units}
            onChange={(units) => setFormData(prev => ({ ...prev, units }))}
            isDarkMode={isDarkMode}
          />

          {/* Cargo Section */}
          <CargoSection 
            cargo={formData.cargo}
            units={formData.units}
            onChange={(cargo) => setFormData(prev => ({ ...prev, cargo }))}
            error={localErrors.cargo}
            isDarkMode={isDarkMode}
          />

          {/* DDP Specific Information */}
          {selectedIncoterm === 'DDP' && (
            <div className={`shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  DDP Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    FOB Value (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={ddpInfo.fobValue}
                    onChange={(e) => setDdpInfo({...ddpInfo, fobValue: e.target.value})}
                    placeholder="Enter FOB value"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md ${
                      localErrors.fobValue 
                        ? 'border-red-300' 
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  />
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Free on Board value for customs calculation
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    HS Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ddpInfo.hsCode}
                    onChange={(e) => setDdpInfo({...ddpInfo, hsCode: e.target.value})}
                    placeholder="e.g., 8471.30"
                    className={`w-full px-3 py-2 border rounded-md ${
                      localErrors.hsCode 
                        ? 'border-red-300' 
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  />
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Harmonized System code for customs classification
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Services */}
          <ServiceOptions 
            services={formData.services}
            onChange={(services) => setFormData(prev => ({ ...prev, services }))}
            isDarkMode={isDarkMode}
          />

          {/* Insurance Section - Modified for CIP */}
          {selectedIncoterm === 'CIP' ? (
            <div className={`shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    All Risk Insurance (Required for CIP)
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    CIP terms require minimum insurance coverage
                  </p>
                </div>
              </div>

              <div className={`p-4 border rounded-lg mb-4 ${
                isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex">
                  <Info className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className="ml-3">
                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Insurance is mandatory for CIP incoterms. Please provide commodity description and value.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Commodity Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.insurance.commodity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      insurance: {
                        ...prev.insurance,
                        commodity: e.target.value
                      }
                    }))}
                    placeholder="e.g., Electronics, Machinery, Textiles"
                    className={`w-full px-3 py-2 border rounded-md ${
                      localErrors.insurance && !formData.insurance.commodity 
                        ? 'border-red-300' 
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Insured Value (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.insurance.insuredValue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      insurance: {
                        ...prev.insurance,
                        insuredValue: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="Enter value in USD"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md ${
                      localErrors.insurance && !formData.insurance.insuredValue
                        ? 'border-red-300'
                        : isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <InsuranceSection 
              insurance={formData.insurance}
              onChange={(insurance) => setFormData(prev => ({ ...prev, insurance }))}
              error={localErrors.insurance}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Aircraft Type */}
          <AircraftTypeSection 
            value={formData.preferAircraftType}
            onChange={(preferAircraftType) => setFormData(prev => ({ ...prev, preferAircraftType }))}
            isDarkMode={isDarkMode}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-6 py-2 border rounded-md text-sm font-medium ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating Request...' : 'Submit Quote Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportAirQuoteGenerator;
