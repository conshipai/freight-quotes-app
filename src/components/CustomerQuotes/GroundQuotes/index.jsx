// src/components/CustomerQuotes/GroundQuotes/index.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Package, Truck, Zap, Settings } from 'lucide-react';
import LTLQuote from './LTLQuote';
import { getCustomerCarrierConfig } from '../../../services/carrierConfig';

const GroundQuotes = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [selectedService, setSelectedService] = useState('ltl');
  const [customerCarriers, setCustomerCarriers] = useState({});
  
  // Get customer ID from shellContext
  const customerId = shellContext?.user?.partnerId || shellContext?.user?.companyId;
  
  useEffect(() => {
    if (customerId) {
      const configs = getCustomerCarrierConfig(customerId);
      setCustomerCarriers(configs);
    }
  }, [customerId]);
  
  const groundServices = [
    {
      id: 'ltl',
      label: 'LTL',
      fullName: 'Less Than Truckload',
      icon: Package,
      description: 'For shipments that don\'t require a full truck (150-20,000 lbs)',
      available: true
    },
    {
      id: 'truckload',
      label: 'FTL',
      fullName: 'Full Truckload',
      icon: Truck,
      description: 'Dedicated truck for large shipments',
      available: false // Coming soon
    },
    {
      id: 'expedited',
      label: 'Expedited',
      fullName: 'Time-Critical Expedited',
      icon: Zap,
      description: 'Same-day and next-day critical shipments',
      available: false // Coming soon
    }
  ];

  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Service Type Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ground Transportation
          </h2>
          
          {/* Carrier Config Status */}
          {Object.keys(customerCarriers).length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {Object.keys(customerCarriers).filter(c => customerCarriers[c].enabled).length} carriers configured
              </span>
            </div>
          )}
        </div>
        
        {/* Service Tabs */}
        <div className="flex gap-2 mb-6">
          {groundServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => service.available && setSelectedService(service.id)}
                disabled={!service.available}
                className={`
                  flex-1 p-4 rounded-lg border-2 transition-all
                  ${!service.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${selectedService === service.id
                    ? isDarkMode 
                      ? 'border-conship-orange bg-orange-900/20' 
                      : 'border-conship-purple bg-purple-50'
                    : isDarkMode
                      ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  selectedService === service.id
                    ? isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                    : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {service.label}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.fullName}
                </div>
                {!service.available && (
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'
                  }`}>
                    Coming Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content based on selection */}
        {selectedService === 'ltl' && (
          <LTLQuote 
            shellContext={shellContext} 
            customerCarriers={customerCarriers}
            customerId={customerId}
          />
        )}
        
        {selectedService === 'truckload' && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Full Truckload quotes coming soon!</p>
          </div>
        )}
        
        {selectedService === 'expedited' && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Expedited service coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundQuotes;
