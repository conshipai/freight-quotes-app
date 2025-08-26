// src/components/PartnerQuotes/CargoTypeSelector.jsx
import React from 'react';
import { Package, AlertTriangle, Battery } from 'lucide-react';

const CargoTypeSelector = ({ value, onChange, isDarkMode }) => {
  const cargoTypes = [
    {
      value: 'general',
      label: 'General Cargo',
      icon: Package,
      description: 'Standard goods, no special handling required'
    },
    {
      value: 'batteries',
      label: 'Batteries',
      icon: Battery,
      description: 'Lithium batteries or battery-powered equipment'
    },
    {
      value: 'dangerous_goods',
      label: 'Dangerous Goods',
      icon: AlertTriangle,
      description: 'Hazardous materials requiring special documentation'
    }
  ];

  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Cargo Type
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cargoTypes.map((type) => {
          const Icon = type.icon;
          return (
            <label
              key={type.value}
              className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                value === type.value
                  ? isDarkMode
                    ? 'border-conship-orange bg-orange-900/20'
                    : 'border-conship-purple bg-purple-50'
                  : isDarkMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="cargoType"
                value={type.value}
                checked={value === type.value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <Icon className={`w-8 h-8 mb-2 ${
                value === type.value
                  ? isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {type.label}
              </span>
              <span className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {type.description}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CargoTypeSelector;
