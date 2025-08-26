// src/components/PartnerQuotes/ExportAir.jsx - Updated sections

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plane } from 'lucide-react';
import axios from 'axios';

import IncotermSelector from './IncotermSelector';
import OriginSection from './OriginSection';
import DestinationSection from './DestinationSection';
import CargoSection from '../shared/CargoSection';
import UnitSelector from '../shared/UnitSelector';
import CargoTypeSelector from './CargoTypeSelector';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 🔹 helper to convert dimensions
const convertDimensions = (cargo, units) => {
  return cargo.pieces.map(piece => ({
    ...piece,
    weightKg: units === 'metric'
      ? Number(piece.weight || 0)
      : Number(piece.weight || 0) * 0.453592,
    lengthCm: units === 'metric'
      ? Number(piece.length || 0)
      : Number(piece.length || 0) * 2.54,
    widthCm: units === 'metric'
      ? Number(piece.width || 0)
      : Number(piece.width || 0) * 2.54,
    heightCm: units === 'metric'
      ? Number(piece.height || 0)
      : Number(piece.height || 0) * 2.54
  }));
};

const ExportAir = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [selectedAirports, setSelectedAirports] = useState({
    origin: null,
    destination: null
  });

  const [formData, setFormData] = useState({
    pickupZip: '',
    originAirport: '',
    destinationAirport: '',
    incoterm: 'EXW',
    carriers: ['freightforce', 'pelicargo'],
    units: 'imperial',
    cargoType: 'general',
    aircraftType: 'passenger',
    cargo: {
      pieces: [{
        id: 1,
        quantity: 1,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        commodity: '',
        stackable: true
      }]
    },
    insurance: {
      requested: false,
      value: 0
    }
  });

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // ... keep all validation and airport logic

  // 🔹 wrapper for submitting general cargo quotes
  const submitQuote = async (quoteData) => {
    try {
      setLoading(true);
      setErrors({});

      const response = await axios.post(`${API_URL}/quotes/create`, {
        quoteType: 'export-air',
        userRole: 'foreign_partner',
        ...quoteData
      });

      if (response.data.success) {
        const requestNumber = response.data.data.requestNumber;
        alert(`Quote request ${requestNumber} submitted successfully!\n\nThe system is fetching rates from carriers.`);

        // reset form
        setFormData({
          pickupZip: '',
          originAirport: '',
          destinationAirport: '',
          incoterm: 'EXW',
          carriers: ['freightforce', 'pelicargo'],
          units: 'imperial',
          cargoType: 'general',
          aircraftType: 'passenger',
          cargo: {
            pieces: [{
              id: 1,
              quantity: 1,
              weight: 0,
              length: 0,
              width: 0,
              height: 0,
              commodity: '',
              stackable: true
            }]
          },
          insurance: {
            requested: false,
            value: 0
          }
        });
        setSelectedAirports({ origin: null, destination: null });
      } else {
        throw new Error(response.data.error || 'Failed to create quote');
      }
    } catch (err) {
      console.error('Quote submission error:', err);
      setErrors({
        submit: err.response?.data?.error || err.message || 'Failed to create quote.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UPDATED handleSubmit
  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    // convert dims with both units
    const convertedCargo = {
      ...formData.cargo,
      pieces: convertDimensions(formData.cargo, formData.units)
    };

    // cargo type routing
    if (formData.cargoType === 'batteries') {
      localStorage.setItem('tempQuoteData', JSON.stringify({
        ...formData,
        cargo: convertedCargo,
        aircraftType: formData.aircraftType
      }));
      navigate('/quotes/battery-details', {
        state: {
          quoteData: { ...formData, cargo: convertedCargo },
          aircraftType: formData.aircraftType
        }
      });
      return;
    }

    if (formData.cargoType === 'dangerous_goods') {
      localStorage.setItem('tempQuoteData', JSON.stringify({
        ...formData,
        cargo: convertedCargo,
        aircraftType: formData.aircraftType
      }));
      navigate('/quotes/dangerous-goods', {
        state: {
          quoteData: { ...formData, cargo: convertedCargo },
          aircraftType: formData.aircraftType
        }
      });
      return;
    }

    // general cargo submit
    await submitQuote({
      ...formData,
      cargo: convertedCargo
    });
  };

  return (
    <div className="space-y-6">
      {/* ... keep your JSX exactly the same */}
      {/* replace only the submit button’s onClick with handleSubmit */}
    </div>
  );
};

export default ExportAir;
