// src/components/CustomerQuotes/GroundQuotes/LTLQuote.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle, Loader2 } from 'lucide-react';
import ShipmentDetails from './components/ShipmentDetails';
import FreightItems from './components/FreightItems';
import CarrierResults from './components/CarrierResults';
import { getLTLRates } from '../../../services/ltlService';

const LTLQuote = ({ shellContext, customerCarriers, customerId }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [step, setStep] = useState(1); // 1: Details, 2: Results
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [carrierRates, setCarrierRates] = useState([]);
  
  const [formData, setFormData] = useState({
    // Project Reference
    projectReference: '',
    
    // Shipment Details
    pickupDate: '',
    
    // Origin
    originZip: '',
    originCity: '',
    originState: '',
    originType: 'business',
    originAccessorials: {
      liftgate: false,
      insidePickup: false,
      residential: false,
      limitedAccess: false,
      constructionSite: false
    },
    
    // Destination
    destinationZip: '',
    destinationCity: '',
    destinationState: '',
    destinationType: 'business',
    destinationAccessorials: {
      liftgate: false,
      insideDelivery: false,
      residential: false,
      limitedAccess: false,
      notifyBeforeDelivery: false,
      constructionSite: false
    },
    
    // Freight Details
    units: 'imperial',
    items: [{
      id: 1,
      class: '50',
      weight: '',
      length: '',
      width: '',
      height: '',
      quantity: 1,
      packagingType: 'pallets',
      description: '',
      nmfc: '',
      hazmat: false,
      stackable: true
    }],
    
    // Additional Services
    insurance: {
      requested: false,
      value: 0
    },
    
    // Special Instructions
    specialInstructions: ''
  });

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.originZip || formData.originZip.length !== 5) {
      newErrors.originZip = 'Valid 5-digit origin ZIP required';
    }

    if (!formData.destinationZip || formData.destinationZip.length !== 5) {
      newErrors.destinationZip = 'Valid 5-digit destination ZIP required';
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Pickup date required';
    }

    if (!formData.items.some(item => item.weight && item.class)) {
      newErrors.items = 'At least one freight item with weight and class required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetRates = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Call the service to get rates from all configured carriers
      const rates = await getLTLRates({
        customerId,
        customerCarriers,
        shipmentData: formData
      });
      
      setCarrierRates(rates);
      setStep(2); // Move to results
    } catch (error) {
      console.error('Error getting rates:', error);
      setErrors({ 
        submit: 'Failed to retrieve rates. Please check your information and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (carrier, rate) => {
    navigate('/quotes/booking', {
      state: {
        carrier,
        rate,
        shipmentDetails: formData,
        quoteType: 'ground-ltl'
      }
    });
  };

  return (
    <>
      {step === 1 ? (
        <div>
          <h3 className={`text-xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            LTL Shipment Details
          </h3>

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
                    {Object.entries(errors).map(([key, error]) => (
                      <li key={key} className={isDarkMode ? 'text-red-400' : 'text-red-700'}>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Shipment Details Form */}
          <ShipmentDetails
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isDarkMode={isDarkMode}
          />

          {/* Freight Items */}
          <FreightItems
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isDarkMode={isDarkMode}
          />

          {/* Get Rates Button */}
          <div className="flex justify-end gap-4 mt-6">
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
              onClick={handleGetRates}
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-conship-orange hover:bg-orange-600'
                    : 'bg-conship-purple hover:bg-purple-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Rates...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Get LTL Rates
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <CarrierResults
          rates={carrierRates}
          formData={formData}
          onBack={() => setStep(1)}
          onBook={handleBook}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default LTLQuote;
