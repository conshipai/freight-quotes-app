// src/components/CustomerQuotes/Dashboard/widgets/SpendAnalyticsWidget.jsx
import React from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';

const SpendAnalyticsWidget = ({ spend, savings, isDarkMode }) => {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Spend & Savings
        </h4>
        <DollarSign className="w-5 h-5 text-blue-500" />
      </div>
      
      <div className="space-y-3">
        <div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${(spend / 1000).toFixed(1)}k
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            MTD spend
          </p>
        </div>
        
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
        }`}>
          <TrendingDown className="w-4 h-4 text-green-500" />
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
              {savings} saved
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-green-600'}`}>
              vs. market rates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendAnalyticsWidget;
