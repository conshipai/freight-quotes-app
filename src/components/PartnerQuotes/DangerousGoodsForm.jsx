// src/components/PartnerQuotes/DangerousGoodsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Upload, X, FileText } from 'lucide-react';
import axios from 'axios';
import { generateQuoteNumbers } from '../../services/sequentialNumbers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DangerousGoodsForm = ({ shellContext }) => {
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
  
  // DG form state
  const [dgData, setDgData] = useState(() => {
    // Try to recover from localStorage if user navigated away and back
    const saved = localStorage.getItem('tempDGData');
    if (saved) return JSON.parse(saved);
    
    return {
      unNumber: '',
      properName: '',
      classDivision: '',
      packingGroup: '',
      quantity: '',
      technicalName: '',
      packingInstruction: '',
      authorization: '',
      notes: '',
      sdsFile: null
    };
  });

  // Save DG data to localStorage on changes
  useEffect(() => {
    localStorage.setItem('tempDGData', JSON.stringify(dgData));
  }, [dgData]);

  const handleInputChange = (field, value) => {
    setDgData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 20MB' });
      return;
    }

    if (!/pdf|png|jpe?g/i.test(file.type)) {
      setErrors({ file: 'Only PDF, PNG, or JPG files are allowed' });
      return;
    }

    // Store file metadata (actual upload happens on submit)
    setDgData(prev => ({
      ...prev,
      sdsFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file // Keep reference for upload
      }
    }));
    
    // Clear file errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.file;
      delete newErrors.sds;
      return newErrors;
    });
  };

  const removeFile = () => {
    setDgData(prev => ({ ...prev, sdsFile: null }));
    const fileInput = document.getElementById('sds');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!dgData.unNumber) {
      newErrors.unNumber = 'UN Number is required';
    }
    
    if (!dgData.properName) {
      newErrors.properName = 'Proper Shipping Name is required';
    }
    
    if (!dgData.classDivision) {
      newErrors.classDivision = 'Class/Division is required';
    }
    
    if (!dgData.packingGroup) {
      newErrors.packingGroup = 'Packing Group is required';
    }
    
    if (!dgData.sdsFile) {
      newErrors.sds = 'Safety Data Sheet (SDS) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    // STEP 1: Get IDs from SERVER (not client-side)
    const initRes = await axios.post(`${API_URL}/quotes/init`, { 
      quoteType: 'export-air' 
    });
    
    if (!initRes.data?.success) {
      throw new Error('Failed to initialize quote');
    }

    const { requestId, quoteId, costId } = initRes.data;

    // STEP 2: Upload SDS to R2 with server-issued requestId
    let sdsFileUrl = null;
    if (dgData.sdsFile?.file) {
      const formData = new FormData();
      formData.append('file', dgData.sdsFile.file);
      formData.append('requestId', requestId);  // Server-issued ID
      formData.append('documentType', 'dg-sds');

      const uploadResponse = await axios.post(`${API_URL}/storage/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      sdsFileUrl = uploadResponse.data.fileUrl;
    }

    // STEP 3: Submit the complete quote
    const completeQuoteData = {
      ...mainQuoteData,
      dangerousGoods: {
        ...dgData,
        sdsFileUrl,
        sdsFileName: dgData.sdsFile?.name || ''
      },
      ids: { requestId, quoteId, costId }
    };

    const response = await axios.post(`${API_URL}/quotes/create`, {
      ...completeQuoteData,
      quoteType: 'export-air',
      userRole: 'foreign_partner',
      hasDangerousGoods: true
    });

    if (response.data.success) {
      localStorage.removeItem('tempQuoteData');
      localStorage.removeItem('tempDGData');

      navigate('/quotes/pending', {
        state: {
          requestId,
          quoteId,
          origin: mainQuoteData.originAirport,
          destination: mainQuoteData.destinationAirport
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
    // Save current state before going back
    localStorage.setItem('tempDGData', JSON.stringify(dgData));
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          Dangerous Goods Details
        </h2>

        {/* Show quote summary */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Route:</strong> {mainQuoteData.originAirport} → {mainQuoteData.destinationAirport}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Aircraft Type:</strong> {mainQuoteData.aircraftType === 'cargo-only' ? 'Cargo Aircraft Only' : 'Passenger Aircraft Permitted'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Total Pieces:</strong> {mainQuoteData.cargo?.pieces?.reduce((sum, p) => sum + Number(p.quantity || 0), 0) || 0}
          </p>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
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

        {/* UN Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              UN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dgData.unNumber}
              onChange={(e) => handleInputChange('unNumber', e.target.value.toUpperCase())}
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
              Class/Division <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dgData.classDivision}
              onChange={(e) => handleInputChange('classDivision', e.target.value)}
              placeholder="e.g., 9"
              className={`w-full px-3 py-2 rounded-md border ${
                errors.classDivision ? 'border-red-300' :
                isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Packing Group <span className="text-red-500">*</span>
            </label>
            <select
              value={dgData.packingGroup}
              onChange={(e) => handleInputChange('packingGroup', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                errors.packingGroup ? 'border-red-300' :
                isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
              }`}
            >
              <option value="">Select...</option>
              <option value="I">I - Great danger</option>
              <option value="II">II - Medium danger</option>
              <option value="III">III - Minor danger</option>
            </select>
          </div>
        </div>

        {/* Proper Shipping Name */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Proper Shipping Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={dgData.properName}
            onChange={(e) => handleInputChange('properName', e.target.value)}
            placeholder="e.g., Lithium ion batteries"
            className={`w-full px-3 py-2 rounded-md border ${
              errors.properName ? 'border-red-300' :
              isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Technical Name (if applicable) */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Technical Name (if required)
          </label>
          <input
            type="text"
            value={dgData.technicalName}
            onChange={(e) => handleInputChange('technicalName', e.target.value)}
            placeholder="Chemical or technical name"
            className={`w-full px-3 py-2 rounded-md border ${
              isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Quantity
            </label>
            <input
              type="text"
              value={dgData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="e.g., 2 packages"
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Packing Instruction
            </label>
            <input
              type="text"
              value={dgData.packingInstruction}
              onChange={(e) => handleInputChange('packingInstruction', e.target.value)}
              placeholder="e.g., PI965"
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Authorization (if applicable)
            </label>
            <input
              type="text"
              value={dgData.authorization}
              onChange={(e) => handleInputChange('authorization', e.target.value)}
              placeholder="Special permit number"
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* SDS Upload */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Safety Data Sheet (SDS) <span className="text-red-500">*</span>
          </label>
          {!dgData.sdsFile ? (
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
              <span className="flex-1 text-sm truncate">{dgData.sdsFile.name}</span>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          )}
          {errors.file && (
            <p className="text-red-500 text-xs mt-1">{errors.file}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Additional Notes / Special Instructions
          </label>
          <textarea
            value={dgData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows="3"
            placeholder="Any special handling requirements or additional information"
            className={`w-full px-3 py-2 rounded-md border ${
              isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-between">
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

export default DangerousGoodsForm;
