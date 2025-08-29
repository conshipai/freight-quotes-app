// src/components/quotes/QuoteGenerator/SuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuote } from '../../../contexts/QuoteContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { CheckCircle, Plane, Mail, Loader2, ArrowRight } from 'lucide-react';

const QuoteSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteResults } = useQuote();
  const { isDarkMode } = useTheme();
  const [countdown, setCountdown] = useState(60);
  const [isPaused, setIsPaused] = useState(false);

  // Extract data from navigation state with fallbacks
  const quoteData = {
    quoteId: 
      location.state?.quoteId ||
      quoteResults?._id ||
      quoteResults?.quoteNumber ||
      localStorage.getItem('lastQuoteId') ||
      'PENDING',
    origin:
      location.state?.origin ||
      quoteResults?.origin?.airport ||
      localStorage.getItem('lastOrigin') ||
      '---',
    destination:
      location.state?.destination ||
      quoteResults?.destination?.airport ||
      localStorage.getItem('lastDestination') ||
      '---',
    quoteType: location.state?.quoteType || 'standard',
    hasBatteries: location.state?.hasBatteries || false,
    hasDG: location.state?.hasDG || false,
    uploadPending: location.state?.uploadPending || false
  };

  // Auto-redirect countdown
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clean up localStorage before redirect
          localStorage.removeItem('lastQuoteId');
          localStorage.removeItem('lastOrigin');
          localStorage.removeItem('lastDestination');
          navigate('/quotes');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  const handleViewQuotes = () => {
    // Clean up and navigate immediately
    localStorage.removeItem('lastQuoteId');
    localStorage.removeItem('lastOrigin');
    localStorage.removeItem('lastDestination');
    navigate('/quotes');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 animate-[scale-in_0.3s_ease-out]" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Created Successfully
          </h1>
          <div className={`text-4xl font-mono font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Quote #{quoteData.quoteId}
          </div>
        </div>

        {/* Progress Steps */}
        <div className={`rounded-lg p-8 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="space-y-6">
            {/* Step 1: Quote Submitted */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quote Submitted
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your request has been received and saved
                </p>
              </div>
            </div>

            {/* Step 2: Processing Rates with Airplane Animation */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Processing Rates
                </p>
                
                {/* Airplane Animation */}
                <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="relative h-8 flex items-center">
                    <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {quoteData.origin}
                    </span>
                    <div className="flex-1 mx-3 relative">
                      <div className={`h-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full flex">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className="flex-1 text-center">
                                <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                  ~
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="absolute -top-3 animate-[fly_3s_ease-in-out_infinite]">
                        <Plane className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {quoteData.destination}
                    </span>
                  </div>
                </div>

                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fetching rates from multiple carriers
                </p>
              </div>
            </div>

            {/* Step 3: Email Confirmation */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700 border-2 border-gray-600' : 'bg-gray-200'
                }`}>
                  <Mail className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Email Confirmation
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  You'll receive an email when all rates are ready
                </p>
              </div>
            </div>
          </div>

          {/* Special Indicators */}
          {(quoteData.hasBatteries || quoteData.hasDG) && (
            <div className={`mt-6 p-3 rounded-lg ${
              isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                <span className="font-medium">Special Handling:</span>
                {quoteData.hasDG && ' Dangerous Goods'}
                {quoteData.hasBatteries && quoteData.hasDG && ' • '}
                {quoteData.hasBatteries && ' Battery Shipment'}
                {quoteData.uploadPending && ' (SDS pending upload)'}
              </p>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className={`rounded-lg p-6 mb-8 text-center ${
          isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
            First rates typically appear within 5 minutes
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-blue-400/80' : 'text-blue-700'}`}>
            Additional carriers will respond over the next few hours. 
            We'll send you an email once all rates have been received.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleViewQuotes}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Quote Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/quotes/new')}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Create Another Quote
          </button>
        </div>

        {/* Countdown */}
        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Auto-redirecting to quote list in{' '}
            <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
          <button
            onClick={handleViewQuotes}
            className={`text-sm mt-2 underline ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Go now
          </button>
        </div>
      </div>

      {/* Custom CSS for airplane animation */}
      <style jsx>{`
        @keyframes fly {
          0% { left: 10%; }
          50% { left: 80%; }
          100% { left: 10%; }
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QuoteSuccessPage;
