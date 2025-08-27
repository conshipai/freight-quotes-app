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

  useEffect(() => {
    localStorage.setItem('tempBatteryData', JSON.stringify(batteryData));
  }, [batteryData]);

  const handleModeChange = (mode) => {
    setBatteryData(prev => ({ ...prev, mode }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 20MB' });
      return;
    }

    setBatteryData(prev => ({
      ...prev,
      sdsFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
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
      // STEP 1: Get IDs from SERVER
      const initRes = await axios.post(`${API_URL}/quotes/init`, { 
        quoteType: 'export-air' 
      });
      
      if (!initRes.data?.success) {
        throw new Error('Failed to initialize quote');
      }

      const { requestId, quoteId, costId } = initRes.data;

      // STEP 2: Upload SDS if DG mode
      let sdsFileUrl = null;
      if (batteryData.mode === 'dg' && batteryData.sdsFile?.file) {
        const formData = new FormData();
        formData.append('file', batteryData.sdsFile.file);
        formData.append('requestId', requestId);  // Server-issued ID
        formData.append('documentType', 'battery-sds');

        const uploadResponse = await axios.post(`${API_URL}/storage/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        sdsFileUrl = uploadResponse.data.fileUrl;
      }

      // STEP 3: Submit the complete quote
      const completeQuoteData = {
        ...mainQuoteData,
        batteryDetails: {
          ...batteryData,
          sdsFileUrl,
          sdsFileName: batteryData.sdsFile?.name || ''
        },
        ids: { requestId, quoteId, costId }
      };

      const response = await axios.post(`${API_URL}/quotes/create`, {
        ...completeQuoteData,
        quoteType: 'export-air',
        userRole: 'foreign_partner',
        hasBatteries: true
      });

      if (response.data.success) {
        // Clear temporary storage
        localStorage.removeItem('tempQuoteData');
        localStorage.removeItem('tempBatteryData');

        // Navigate to success page with quote details
        navigate('/quotes/success', {
          state: {
            requestId,
            quoteId,
            costId,
            origin: mainQuoteData.originAirport,
            destination: mainQuoteData.destinationAirport,
            quoteType: 'export-air',
            hasBatteries: true,
            batteryMode: batteryData.mode
          }
        });
      } else {
        throw new Error(response.data?.message || 'Quote creation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ 
        submit: error.response?.data?.message || error.message || 'Failed to submit quote' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.setItem('tempBatteryData', JSON.stringify(batteryData));
    navigate(-1);
  };

  // Return the JSX
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center mb-6">
            <Battery className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Battery Details
            </h2>
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Battery Classification
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleModeChange('nonrestricted')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  batteryData.mode === 'nonrestricted'
                    ? 'border-blue-500 bg-blue-50'
                    : isDarkMode
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-left">
                  <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Non-Restricted Battery
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Standard lithium batteries within safe limits
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('dg')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  batteryData.mode === 'dg'
                    ? 'border-orange-500 bg-orange-50'
                    : isDarkMode
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-left">
                  <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    DG Battery
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Dangerous goods requiring special handling
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Non-Restricted Options */}
          {batteryData.mode === 'nonrestricted' && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Battery Type
              </label>
              <select
                value={batteryData.nonRestrictedCode}
                onChange={(e) => setBatteryData(prev => ({ ...prev, nonRestrictedCode: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {NON_RESTRICTED_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* DG Details Form */}
          {batteryData.mode === 'dg' && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    UN Number *
                  </label>
                  <input
                    type="text"
                    value={batteryData.dgDetails.unNumber}
                    onChange={(e) => setBatteryData(prev => ({
                      ...prev,
                      dgDetails: { ...prev.dgDetails, unNumber: e.target.value }
                    }))}
                    placeholder="e.g., UN3480"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.unNumber ? 'border-red-500' : ''
                    } ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  {errors.unNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.unNumber}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Class/Division
                  </label>
                  <input
                    type="text"
                    value={batteryData.dgDetails.classDivision}
                    onChange={(e) => setBatteryData(prev => ({
                      ...prev,
                      dgDetails: { ...prev.dgDetails, classDivision: e.target.value }
                    }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Proper Shipping Name *
                </label>
                <input
                  type="text"
                  value={batteryData.dgDetails.properName}
                  onChange={(e) => setBatteryData(prev => ({
                    ...prev,
                    dgDetails: { ...prev.dgDetails, properName: e.target.value }
                  }))}
                  placeholder="e.g., Lithium ion batteries"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.properName ? 'border-red-500' : ''
                  } ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                {errors.properName && (
                  <p className="text-red-500 text-sm mt-1">{errors.properName}</p>
                )}
              </div>

              {/* SDS Upload */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Safety Data Sheet (SDS) *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {batteryData.sdsFile ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {batteryData.sdsFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click to upload or drag and drop
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        PDF, DOC, DOCX (Max 20MB)
                      </p>
                      <input
                        id="sds"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('sds').click()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Select File
                      </button>
                    </>
                  )}
                </div>
                {errors.sds && (
                  <p className="text-red-500 text-sm mt-1">{errors.sds}</p>
                )}
              </div>
            </>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
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
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'cursor-wait' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDetailsForm;
