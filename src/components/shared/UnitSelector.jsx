// src/components/shared/UnitSelector.jsx
import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const UnitSelector = ({ value = 'imperial', onChange, isDarkMode }) => {
  const isImperial = value === 'imperial';

  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Measurement Units
        </h3>
        
        <div className="flex items-center gap-4">
          <span className={`text-sm ${
            isImperial 
              ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Imperial (lbs/in)
          </span>
          
          <button
            type="button"
            onClick={() => onChange(isImperial ? 'metric' : 'imperial')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isImperial
                ? isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                : isDarkMode ? 'bg-conship-orange' : 'bg-conship-purple'
            }`}
            aria-label="Toggle unit system"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isImperial ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
          
          <span className={`text-sm ${
            !isImperial 
              ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Metric (kg/cm)
          </span>
        </div>
      </div>
      
      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {isImperial 
          ? 'Using pounds for weight and inches for dimensions'
          : 'Using kilograms for weight and centimeters for dimensions'
        }
      </p>
    </div>
  );
};

export default UnitSelector;
