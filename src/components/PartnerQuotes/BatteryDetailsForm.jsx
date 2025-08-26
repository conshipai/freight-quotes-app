// src/components/PartnerQuotes/BatteryDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Battery, Upload, X, FileText } from 'lucide-react';
import axios from 'axios';
import { generateQuoteNumbers } from '../../services/sequentialNumbers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const NON_RESTRICTED_OPTIONS = [
  { value: 'UN3481_PI967_SecII', label: 'Li-ion: UN3481 | PI967 | Sec II (in equipment)' },
  { value: 'UN3481_PI966_SecII', label: 'Li-ion: UN3481 | PI966 | Sec II (with equipment)' },
  { value: 'UN3091_PI969_SecII', label: 'Li metal: UN3091 | PI969 | Sec II (in equipment)' },
  { value: 'UN3091_PI970_SecII', label: 'Li metal: UN3091 | PI970 | Sec II (with equipment)' },
];

const BatteryDetailsForm = ({ shellContext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = shellContext?.isDarkMode;
  
  // Recover quote data from navigation state or localStorage
  const [mainQuoteData] = useState(() => {
    return location.state?.quoteData || 
           JSON.parse(localStorage.getItem('tempQuoteData') || '{}');
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Battery form state
  const [batteryData, setBatteryData] = useState(() => {
    // Try to recover from localStorage if user navigated away and back
    const saved = localStorage.getItem('tempBatteryData');
    if (saved) return JSON.parse(saved);
    
    return {
      mode: 'nonrestricted',
      nonRestrictedCode: NON_RESTRICTED_OPTIONS[0].value,
      dgDetails: {
        unNumber: '',
        properName: '',
        classDivision: '9',
        packingGroup: 'II',
        quantity: '',
        notes: ''
      },
      sdsFile: null
    };
  });

  // Save battery data to localStorage on changes
  useEffect(() => {
    localStorage.setItem('tempBatteryData', JSON.stringify(batteryData));
  }, [batteryData]);

  const handleModeChange = (mode) => {
    setBatteryData(prev => ({ ...prev, mode }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?>[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 20MB' });
      return;
    }

    // Store file metadata (actual upload happens on submit)
    setBatteryData(prev => ({
      ...prev,
      sdsFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file // Keep reference for upload
      }
    }));
  };

  const removeFile = () => {
    setBatteryData(prev => ({ ...prev, sdsFile: null }));
    const fileInput = document.getElementById('sds');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (batteryData.mode === 'dg') {
      if (!batteryData.dgDetails.unNumber) {
        newErrors.unNumber = 'UN Number is required';
      }
      if (!batteryData.dgDetails.properName) {
        newErrors.properName = 'Proper Shipping Name is required';
      }
      if (!batteryData.sdsFile) {
        newErrors.sds = 'SDS document is required for DG batteries';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Generate sequential numbers
      const { requestId, quoteId, costId } = await generateQuoteNumbers();

      // Combine all data
      const completeQuoteData = {
        ...mainQuoteData,
        batteryDetails: batteryData,
        ids: {
          requestId,
          quoteId,
          costId
        }
      };

      // Submit the quote
      const response = await axios.post(`${API_URL}/quotes/create`, {
        ...completeQuoteData,
        quoteType: 'export-air',
        userRole: 'foreign_partner',
        hasBatteries: true
      });

      if (response.data.success) {
        // Clear temp storage
        localStorage.removeItem('tempQuoteData');
        localStorage.removeItem('tempBatteryData');

        // Navigate to pending results page
        navigate('/quotes/pending', {
          state: {
            requestId,
            quoteId,
            origin: mainQuoteData.originAirport,
            destination: mainQuoteData.destinationAirport
          }
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit quote' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Save current state before going back
    localStorage.setItem('tempBatteryData', JSON.stringify(batteryData));
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <Battery className="w-6 h-6 text-yellow-500" />
          Battery Shipment Details
        </h2>

        {/* Show quote summary */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Route:</strong> {mainQuoteData.originAirport} → {mainQuoteData.destinationAirport}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Aircraft Type:</strong> {mainQuoteData.aircraftType === 'cargo-only' ? 'Cargo Aircraft Only' : 'Passenger Aircraft Permitted'}
          </p>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <ul className="text-sm list-disc pl-5">
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

        {/* Battery Type Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Battery Classification
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
              batteryData.mode === 'nonrestricted'
                ? isDarkMode
                  ? 'border-conship-orange bg-orange-900/20'
                  : 'border-conship-purple bg-purple-50'
                : isDarkMode
                  ? 'border-gray-600'
                  : 'border-gray-200'
            }`}>
              <input
                type="radio"
                checked={batteryData.mode === 'nonrestricted'}
                onChange={() => handleModeChange('nonrestricted')}
                className="mt-1"
              />
              <div className="ml-3">
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Non-Restricted (Section II)
                </div>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Small batteries meeting Section II requirements
                </p>
              </div>
            </label>

            <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
              batteryData.mode === 'dg'
                ? isDarkMode
                  ? 'border-conship-orange bg-orange-900/20'
                  : 'border-conship-purple bg-purple-50'
                : isDarkMode
                  ? 'border-gray-600'
                  : 'border-gray-200'
            }`}>
              <input
                type="radio"
                checked={batteryData.mode === 'dg'}
                onChange={() => handleModeChange('dg')}
                className="mt-1"
              />
              <div className="ml-3">
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dangerous Goods Batteries
                </div>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Full DG declaration required, SDS needed
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Non-Restricted Options */}
        {batteryData.mode === 'nonrestricted' && (
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Packaging Instruction
            </label>
            <select
              value={batteryData.nonRestrictedCode}
              onChange={(e) => setBatteryData(prev => ({ 
                ...prev, 
                nonRestrictedCode: e.target.value 
              }))}
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {NON_RESTRICTED_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DG Details */}
        {batteryData.mode === 'dg' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  UN Number
                </label>
                <input
                  type="text"
                  value={batteryData.dgDetails.unNumber}
                  onChange={(e) => setBatteryData(prev => ({
                    ...prev,
                    dgDetails: { ...prev.dgDetails, unNumber: e.target.value }
                  }))}
                  placeholder="e.g., UN3480"
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.unNumber ? 'border-red-300' : 
                    isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Class
                </label>
                <input
                  type="text"
                  value={batteryData.dgDetails.classDivision}
                  onChange={(e) => setBatteryData(prev => ({
                    ...prev,
                    dgDetails: { ...prev.dgDetails, classDivision: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Packing Group
                </label>
                <select
                  value={batteryData.dgDetails.packingGroup}
                  onChange={(e) => setBatteryData(prev => ({
                    ...prev,
                    dgDetails: { ...prev.dgDetails, packingGroup: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Proper Shipping Name
              </label>
              <input
                type="text"
                value={batteryData.dgDetails.properName}
                onChange={(e) => setBatteryData(prev => ({
                  ...prev,
                  dgDetails: { ...prev.dgDetails, properName: e.target.value }
                }))}
                placeholder="e.g., Lithium ion batteries"
                className={`w-full px-3 py-2 rounded-md border ${
                  errors.properName ? 'border-red-300' :
                  isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                SDS Upload (Required) <span className="text-red-500">*</span>
              </label>
              {!batteryData.sdsFile ? (
                <div className="relative">
                  <input
                    id="sds"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className={`w-full px-3 py-2 rounded-md border ${
                      errors.sds ? 'border-red-300' :
                      isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
                    }`}
                  />
                  <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <div className={`flex items-center gap-2 p-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'
                }`}>
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="flex-1 text-sm truncate">{batteryData.sdsFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            className={`px-6 py-2 rounded-lg border ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Back
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
            {loading ? 'Submitting...' : 'Submit Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatteryDetailsForm;
