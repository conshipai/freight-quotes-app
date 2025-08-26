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
      localStorage.removeItem('tempQuoteData');
      localStorage.removeItem('tempBatteryData');

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
    localStorage.setItem('tempBatteryData', JSON.stringify(batteryData));
    navigate(-1);
  };

  // ... JSX stays unchanged below ...
};

export default BatteryDetailsForm;
