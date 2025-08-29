// src/components/quotes/QuoteGenerator/InsuranceSection.jsx
import React from 'react';
import { useQuote } from '../../../contexts/QuoteContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Shield, DollarSign, Package } from 'lucide-react';

const InsuranceSection = ({ error }) => {
  const { currentQuote, updateInsurance } = useQuote();
  const { isDarkMode } = useTheme();

  const handleToggleInsurance = () => {
    if (currentQuote.insurance.requested) {
      // Turning off - reset all insurance fields
      updateInsurance({
        requested: false,
        commodity: '',
        insuredValue: 0
      });
    } else {
      // Turning on - enable with defaults
      updateInsurance({
        requested: true,
        commodity: currentQuote.insurance.commodity || '',
        insuredValue: currentQuote.insurance.insuredValue || 0
      });
    }
  };

  const handleCommodityChange = (e) => {
    updateInsurance({
      ...currentQuote.insurance,
      commodity: e.target.value
    });
  };

  const handleInsuredValueChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(value) || 0;

    updateInsurance({
      ...currentQuote.insurance,
      insuredValue: numValue
    });
  };

  return (
    <div className={`shadow rounded-lg p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            All Risk Insurance
          </h2>
          <p className={`text-sm mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Protect your shipment with comprehensive coverage
          </p>
        </div>
        <Shield className={`h-6 w-6 ${currentQuote.insurance.requested ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>

      {/* Insurance toggle */}
      <label className="flex items-center cursor-pointer mb-6">
        <input
          type="checkbox"
          checked={currentQuote.insurance.requested}
          onChange={handleToggleInsurance}
          className="sr-only"
        />
        <div
          className={`
            relative w-11 h-6 rounded-full transition-colors duration-200
            ${currentQuote.insurance.requested ? 'bg-blue-600' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200
              ${currentQuote.insurance.requested ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
        <span className={`ml-3 text-sm font-medium ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Add All Risk Insurance
        </span>
        {currentQuote.cargo.type === 'valuable' && (
          <span className="ml-2 text-xs text-amber-600">(Recommended for valuable cargo)</span>
        )}
      </label>

      {/* Insurance fields - only show when insurance is requested */}
      {currentQuote.insurance.requested && (
        <div className="space-y-4">
          
          {/* Commodity Description */}
          <div>
            <label htmlFor="commodity" className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Commodity Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className={`h-5 w-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                id="commodity"
                value={currentQuote.insurance.commodity || ''}
                onChange={handleCommodityChange}
                placeholder="e.g., Electronics, Machinery, Textiles"
                className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  error && !currentQuote.insurance.commodity 
                    ? 'border-red-300' 
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900'
                }`}
                aria-describedby="commodity-help"
              />
            </div>
            <p id="commodity-help" className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Describe what you're shipping for insurance documentation
            </p>
          </div>

          {/* Insured Value */}
          <div>
            <label htmlFor="insured-value" className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Value to Insure (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className={`h-5 w-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                id="insured-value"
                value={currentQuote.insurance.insuredValue || ''}
                onChange={handleInsuredValueChange}
                placeholder="Enter value in USD"
                className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  error && (!currentQuote.insurance.insuredValue || currentQuote.insurance.insuredValue <= 0)
                    ? 'border-red-300'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900'
                }`}
                aria-describedby="value-help"
              />
            </div>
            <p id="value-help" className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Enter the total value of goods to be insured
            </p>
          </div>

          {/* Display formatted value for clarity */}
          {currentQuote.insurance.insuredValue > 0 && (
            <div className={`mt-4 p-4 rounded-md ${
              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Commodity:
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentQuote.insurance.commodity || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Insured Value:
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${parseFloat(currentQuote.insurance.insuredValue).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
              <p className={`text-xs italic mt-3 pt-3 border-t ${
                isDarkMode 
                  ? 'text-gray-400 border-blue-800' 
                  : 'text-gray-600 border-blue-100'
              }`}>
                * Insurance premium will be calculated based on the selected route and transportation cost
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && typeof error === 'string' && currentQuote.insurance.requested && (
        <div className={`mt-4 p-3 rounded-md ${
          isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-red-400' : 'text-red-700'
          }`}>
            {error}
          </p>
        </div>
      )}

      {/* Info box */}
      <div className={`mt-6 p-4 rounded-md ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h4 className={`text-sm font-medium mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          All Risk Insurance Coverage
        </h4>
        <ul className={`text-xs space-y-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <li>• Covers physical loss or damage during transit</li>
          <li>• Protection against theft, accidents, and natural disasters</li>
          <li>• Premium calculated at time of booking based on route</li>
          <li>• Claims processed within 30 days</li>
        </ul>
      </div>
    </div>
  );
};

export default InsuranceSection;
