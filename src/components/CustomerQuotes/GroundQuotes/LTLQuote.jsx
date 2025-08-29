// src/components/CustomerQuotes/GroundQuotes/LTLQuote.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import ShipmentDetails from './components/ShipmentDetails';
import FreightItems from './components/FreightItems';
import CarrierResults from './components/CarrierResults';
import { createQuoteRequest, getQuoteStatus } from '../../../services/mockQuoteService';

const LTLQuote = ({ shellContext, customerCarriers, customerId }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [step, setStep] = useState(1); // 1: Details, 2: Processing, 3: Results
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [carrierRates, setCarrierRates] = useState([]);
  const [requestId, setRequestId] = useState(null);
  const [quoteStatus, setQuoteStatus] = useState(null);
  const [carrierResponses, setCarrierResponses] = useState([]);
  const pollingInterval = useRef(null);
  
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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

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

  const startPolling = (requestId) => {
    pollingInterval.current = setInterval(async () => {
      try {
        const data = await getQuoteStatus(requestId);
        
        setQuoteStatus(data);
        setCarrierResponses(data.responses || []);

        // Stop polling when all carriers have responded or on error
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          
          if (data.status === 'completed') {
            setCarrierRates(data.responses || []);
            setStep(3); // Move to results
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        setErrors({ submit: 'Error checking quote status' });
        setStep(1);
      }
    }, 5000); // Poll every 5 seconds for testing
  };

  const handleSubmitQuote = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setStep(2); // Move to processing view
    
    try {
      // Use mock service instead of direct API call
      const { requestId, status } = await createQuoteRequest({
        type: 'ground-ltl',
        customerId,
        shipmentData: formData
      });
      
      setRequestId(requestId);
      setQuoteStatus({ status, message: 'Request submitted' });
      
      // Start polling for updates
      startPolling(requestId);
      
      // Check immediately
      setTimeout(async () => {
        try {
          const statusData = await getQuoteStatus(requestId);
          setQuoteStatus(statusData);
          setCarrierResponses(statusData.responses || []);
        } catch (error) {
          console.error('Status check error:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ 
        submit: 'Failed to submit quote request. Please try again.' 
      });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

const handleBook = (carrier, rate) => {
  console.log('handleBook called with:', { carrier, rate, requestId, formData });
  
  const bookingState = {
    requestId,
    carrier,
    rate,
    shipmentDetails: formData,
    quoteType: 'ground-ltl'
  };
  
  console.log('Navigating to /quotes/booking with state:', bookingState);
  
  navigate('/quotes/booking', {
    state: bookingState
  });
};
  const renderProcessingView = () => {
    const totalCarriers = carrierResponses.length;
    const completedCarriers = carrierResponses.filter(r => r.timestamp).length;

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className={`rounded-full p-6 mb-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <Loader2 className="w-12 h-12 animate-spin text-conship-orange" />
        </div>
        
        <h3 className={`text-xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Processing Your Quote Request
        </h3>
        
        <p className={`text-center mb-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Getting rates from {totalCarriers} carrier{totalCarriers !== 1 ? 's' : ''}...
        </p>

        {/* Progress */}
        {totalCarriers > 0 && (
          <div className="w-full max-w-md mb-6">
            <div className={`h-2 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-conship-orange transition-all duration-500"
                style={{ width: `${(completedCarriers / totalCarriers) * 100}%` }}
              />
            </div>
            <p className={`text-center text-sm mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {completedCarriers} of {totalCarriers} carrier{totalCarriers !== 1 ? 's' : ''} responded
            </p>
          </div>
        )}

        {/* Carrier Status List */}
        {carrierResponses.length > 0 && (
          <div className="w-full max-w-md space-y-2">
            {carrierResponses.map((response, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {response.timestamp ? (
                    response.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  )}
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {response.carrier}
                  </span>
                </div>
                {response.timestamp && (
                  <span className={`text-sm ${
                    response.success
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {response.success ? 'Rates received' : 'Failed'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Request ID */}
        {requestId && (
          <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Request ID: {requestId}
          </p>
        )}
      </div>
    );
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
              onClick={handleSubmitQuote}
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
      ) : step === 2 ? (
        renderProcessingView()
      ) : (
        <CarrierResults
          rates={carrierRates}
          formData={formData}
          requestId={requestId}
          onBack={() => setStep(1)}
          onBook={handleBook}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default LTLQuote;
