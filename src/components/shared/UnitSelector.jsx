//src/components/quotes/UnitSelector.jsx
import React from 'react';
import { useQuote } from '../../contexts/QuoteContext';

export default function UnitSelector() {
  const { currentQuote, updateUnits } = useQuote();

  const handleChange = (system) => {
    updateUnits(
      system === 'imperial'
        ? { weight: 'lbs', dimensions: 'inches' }
        : { weight: 'kg', dimensions: 'cm' }
    );
  };

  return (
    <div className="flex space-x-6 mb-4">
      <label className="flex items-center space-x-2">
        <input
          type="radio"
          name="unit-system"
          checked={currentQuote.units.weight === 'lbs'}
          onChange={() => handleChange('imperial')}
        />
        <span>Imperial (lbs / in)</span>
      </label>
      <label className="flex items-center space-x-2">
        <input
          type="radio"
          name="unit-system"
          checked={currentQuote.units.weight === 'kg'}
          onChange={() => handleChange('metric')}
        />
        <span>Metric (kg / cm)</span>
      </label>
    </div>
  );
}
