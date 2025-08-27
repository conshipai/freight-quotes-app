// src/components/PartnerQuotes/BookingSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, Clock, Download, Mail, Package, 
  Plane, MapPin, Calendar, DollarSign, FileText,
  ArrowRight, Truck, AlertTriangle
} from 'lucide-react';
import { generateBookingNumber } from '../../services/bookingNumbers';
import { generateQuotePDF, generateBookingPDF } from '../../services/pdfGenerator';

const BookingSuccess = ({ shellContext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = shellContext?.isDarkMode;
  
  const [countdown, setCountdown] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [bookingNumber] = useState(generateBookingNumber());
  
  // Extract booking data from navigation state
  const bookingData = location.state || {};
  const {
    quote,
    selectedCarrier,
    rateType = 'general',
    specialInstructions = '',
    pickupDate,
    deliveryDate
  } = bookingData;

  // Auto-redirect countdown
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/bookings/list');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  const handleDownloadBookingPDF = () => {
    generateBookingPDF({
      bookingNumber,
      quote,
      selectedCarrier,
      rateType,
      pickupDate,
      deliveryDate,
      specialInstructions
    });
  };

  const handleDownloadQuotePDF = () => {
    generateQuotePDF(quote);
  };

  const handleEmailBooking = () => {
    console.log('Emailing booking confirmation...');
    // TODO: Implement email functionality
  };

  const handleViewBooking = () => {
    navigate(`/bookings/details/${bookingNumber}`, {
      state: { bookingData: { ...bookingData, bookingNumber } }
    });
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
            Booking Confirmed!
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Booking Number
              </p>
              <p className={`text-xl font-mono font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {bookingNumber}
              </p>
            </div>
            <div className={`w-px h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Quote Reference
              </p>
              <p className={`text-lg font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {quote?.quoteNumber || 'Q-2024-000000'}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Status Timeline */}
        <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Booking Status
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Booking Confirmed
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your shipment has been booked with {selectedCarrier?.carrier}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Confirmation Email Sent
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Booking details sent to your registered email
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Awaiting Pickup
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Scheduled for {pickupDate ? new Date(pickupDate).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Booking Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route */}
            <div>
              <div className="flex items-start gap-3">
                <Plane className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Route
                  </p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote?.origin?.airport} → {quote?.destination?.airport}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedCarrier?.routing}
                  </p>
                </div>
              </div>
            </div>

            {/* Carrier */}
            <div>
              <div className="flex items-start gap-3">
                <Truck className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Carrier
                  </p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCarrier?.carrier}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {rateType === 'express' ? 'Express Service' : 'General Service'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <div className="flex items-start gap-3">
                <Calendar className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Schedule
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Pickup: {pickupDate ? new Date(pickupDate).toLocaleDateString() : 'TBD'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Delivery: {deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost */}
            <div>
              <div className="flex items-start gap-3">
                <DollarSign className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Cost
                  </p>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${selectedCarrier?.rate?.total?.toLocaleString() || '0'} USD
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Transit: {selectedCarrier?.transitTime?.[rateType] || 0} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Handling Alert (if applicable) */}
          {(quote?.hasBatteries || quote?.hasDG) && (
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  Special Handling Required
                </p>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                {quote?.hasBatteries && 'Battery Shipment'}
                {quote?.hasBatteries && quote?.hasDG && ' • '}
                {quote?.hasDG && 'Dangerous Goods'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={handleViewBooking}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            View Booking Details
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleDownloadBookingPDF}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Download className="w-5 h-5" />
            Download Booking PDF
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
            Back to Dashboard
          </button>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Quick Actions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleEmailBooking}
              className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Confirmation
            </button>
            <button
              onClick={handleDownloadQuotePDF}
              className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Download Quote PDF
            </button>
            <button
              onClick={() => navigate('/quotes/export-air')}
              className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              New Quote
            </button>
          </div>
        </div>

        {/* Auto-redirect Notice */}
        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Redirecting to Bookings List in <span className="font-bold">{countdown}</span> seconds...
          </p>
          <button
            onClick={() => navigate('/bookings/list')}
            className={`text-sm mt-2 underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
          >
            Go now
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
