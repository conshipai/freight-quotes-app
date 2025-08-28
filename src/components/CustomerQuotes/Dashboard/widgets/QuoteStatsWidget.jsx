// src/components/CustomerQuotes/Dashboard/widgets/QuoteStatsWidget.jsx
import React from 'react';
import { TrendingUp, Package, Anchor } from 'lucide-react';

const QuoteStatsWidget = ({ stats, isDarkMode }) => {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Quote Activity
        </h4>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      
      <div className="space-y-3">
        <div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.activeQuotes}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Active quotes
          </p>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.monthlyQuotes}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This month
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Anchor className="w-3 h-3 text-orange-500" />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.projectQuotes}
              </p>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Project cargo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteStatsWidget;
