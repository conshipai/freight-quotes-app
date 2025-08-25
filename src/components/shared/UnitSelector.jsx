import React from 'react';

const UnitSelector = ({ value = 'imperial', onChange, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Unit System
      </h3>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="imperial"
            checked={value === 'imperial'}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="mr-2"
          />
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            Imperial (lbs/inches)
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="metric"
            checked={value === 'metric'}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="mr-2"
          />
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            Metric (kg/cm)
          </span>
        </label>
      </div>
    </div>
  );
};

export default UnitSelector;
