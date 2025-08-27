// src/components/PartnerQuotes/QuoteSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, Clock, Loader2, Package, Plane, 
  MapPin, FileText, Shield, Battery, AlertTriangle,
  ArrowRight
} from 'lucide-react';

const QuoteSuccess = ({ shellContext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log('QuoteSuccess rendering with state:', location.state);
  
  const isDarkMode = shellContext?.isDarkMode;
  
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  
  // Extract all data from navigation state
  const quoteData = location.state || {};
  const {
    requestNumber = 'REQ-PENDING',
    quoteNumber = 'Q-PENDING',
    origin = '---',
    destination = '---',
    pieces = 0,
    weight = '0 lbs',
    incoterm = 'EXW',
    pickupZip = '',
    aircraftType = 'passenger',
    cargoType = 'general',
    insurance = { requested: false, value: 0 },
    hasBatteries = false,
    hasDG = false,
    dgInfo = null,
    batteryMode = null,
    batteryType = null
  } = quoteData;

  // Auto-redirect countdown
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/quotes/history');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  const handleViewDetails = () => {
    navigate(`/quotes/details/${quoteNumber}`, { 
      state: { fromSuccess: true } 
    });
  };

  const handleCreateAnother = () => {
    navigate('/quotes/export-air');
  };

  const handleGoToDashboard = () => {
    navigate('/quotes/dashboard');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Successfully Created!
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Request Number
              </p>
              <p className={`text-lg font-mono font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                {requestNumber}
              </p>
            </div>
            <div className={`w-px h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Quote Number
              </p>
              <p className={`text-lg font-mono font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {quoteNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quote Status
            </h2>
            <span className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quote Submitted
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your request has been received and saved
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Fetching Carrier Rates
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Contacting multiple carriers for best rates (this may take a few minutes)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Notification
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  You'll receive an email once all rates are ready
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Route */}
            <div className="flex items-start gap-3">
              <Plane className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Route
                </p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {origin} → {destination}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {incoterm} {pickupZip && `• Pickup: ${pickupZip}`}
                </p>
              </div>
            </div>

            {/* Cargo */}
            <div className="flex items-start gap-3">
              <Package className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cargo
                </p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {pieces} {pieces === 1 ? 'piece' : 'pieces'} • {weight}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {cargoType === 'general' ? 'General Cargo' : 
                   cargoType === 'batteries' ? 'Battery Shipment' : 
                   'Dangerous Goods'}
                </p>
              </div>
            </div>

            {/* Aircraft Type */}
            <div className="flex items-start gap-3">
              <FileText className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aircraft Type
                </p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {aircraftType === 'cargo-only' ? 'Cargo Aircraft Only' : 'Passenger Aircraft Permitted'}
                </p>
              </div>
            </div>

            {/* Insurance */}
            {insurance.requested && (
              <div className="flex items-start gap-3">
                <Shield className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Insurance
                  </p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${insurance.value?.toLocaleString() || '0'} USD
                  </p>
                </div>
              </div>
            )}

            {/* Special Handling */}
            {(hasBatteries || hasDG) && (
              <div className="flex items-start gap-3 md:col-span-2">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Special Handling
                  </p>
                  {hasDG && dgInfo && (
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      DG: {dgInfo.unNumber} - {dgInfo.properName}
                    </p>
                  )}
                  {hasBatteries && batteryType && (
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Battery: {batteryMode === 'nonrestricted' ? 'Non-Restricted' : 'DG'} - {batteryType}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={handleViewDetails}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            View Quote Details
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleCreateAnother}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Create Another Quote
          </button>
          
          <button
            onClick={handleGoToDashboard}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Redirecting to Quote History in <span className="font-bold">{countdown}</span> seconds...
          </p>
          <button
            onClick={() => navigate('/quotes/history')}
            className={`text-sm mt-2 underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
          >
            Go now
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteSuccess;
