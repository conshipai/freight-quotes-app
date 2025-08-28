// src/components/CustomerQuotes/Booking/index.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, Truck, Calendar, MapPin, DollarSign, 
  User, Phone, Mail, Building2, AlertCircle,
  CheckCircle, Loader2, FileText, CreditCard
} from 'lucide-react';

const BookingPage = ({ shellContext }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  
  const { state } = location;
  const { requestId, carrier, rate, shipmentDetails, quoteType } = state || {};
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    // Contact Information
    contactName: '',
    contactPhone: '',
    contactEmail: shellContext?.user?.email || '',
    
    // Pickup Details
    pickupCompany: '',
    pickupContactName: '',
    pickupPhone: '',
    pickupHours: 'business', // business, appointment, 24/7
    pickupReadyTime: '08:00',
    pickupCloseTime: '17:00',
    pickupInstructions: '',
    
    // Delivery Details  
    deliveryCompany: '',
    deliveryContactName: '',
    deliveryPhone: '',
    deliveryHours: 'business',
    deliveryAppointmentRequired: false,
    deliveryInstructions: '',
    
    // Payment
    paymentMethod: 'account', // account, credit
    poNumber: '',
    costCenter: '',
    
    // Additional Services
    trackingEmails: [shellContext?.user?.email || ''],
    insuranceRequested: shipmentDetails?.insurance?.requested || false,
    insuranceValue: shipmentDetails?.insurance?.value || 0,
    
    // Terms
    acceptTerms: false
  });

  const updateBookingData = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateBooking = () => {
    const newErrors = {};
    
    // Contact validation
    if (!bookingData.contactName.trim()) newErrors.contactName = 'Contact name required';
    if (!bookingData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone required';
    if (!bookingData.contactEmail.trim()) newErrors.contactEmail = 'Contact email required';
    
    // Pickup validation
    if (!bookingData.pickupCompany.trim()) newErrors.pickupCompany = 'Pickup company required';
    if (!bookingData.pickupContactName.trim()) newErrors.pickupContactName = 'Pickup contact required';
    if (!bookingData.pickupPhone.trim()) newErrors.pickupPhone = 'Pickup phone required';
    
    // Delivery validation
    if (!bookingData.deliveryCompany.trim()) newErrors.deliveryCompany = 'Delivery company required';
    if (!bookingData.deliveryContactName.trim()) newErrors.deliveryContactName = 'Delivery contact required';
    if (!bookingData.deliveryPhone.trim()) newErrors.deliveryPhone = 'Delivery phone required';
    
    // Payment validation
    if (!bookingData.poNumber.trim() && bookingData.paymentMethod === 'account') {
      newErrors.poNumber = 'PO number required';
    }
    
    // Terms
    if (!bookingData.acceptTerms) newErrors.acceptTerms = 'You must accept terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateBooking()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-field');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate booking reference
      const ref = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setBookingReference(ref);
      setBookingComplete(true);
      
    } catch (error) {
      setErrors({ submit: 'Failed to complete booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // If no state, redirect back
  if (!state || !rate) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No Quote Selected
        </h2>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Please select a quote before proceeding to booking.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Success screen
  if (bookingComplete) {
    return (
      <div className={`max-w-2xl mx-auto p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Booking Confirmed!
          </h1>
          <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Reference: <span className="font-mono font-bold">{bookingReference}</span>
          </p>
          
          <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A confirmation email has been sent to:
            </p>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {bookingData.contactEmail}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/quotes')}
              className={`px-6 py-2 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New Quote
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Complete Your Booking
      </h1>

      {/* Quote Summary */}
      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Selected Quote
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Carrier:</span>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {carrier}
            </p>
          </div>
          <div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Service:</span>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {rate.service}
            </p>
          </div>
          <div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Transit:</span>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900
