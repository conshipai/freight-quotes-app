// src/components/quotes/QuoteGenerator/ServiceOptions.jsx
import React from 'react';
import { useQuote } from '../../../contexts/QuoteContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Truck, Home, Calendar, Star } from 'lucide-react';

const ServiceOptions = () => {
  const { currentQuote, updateServices } = useQuote();
  const { isDarkMode } = useTheme();

  const availableServices = [
    {
      id: 'liftgate',
      name: 'Liftgate Service',
      description: 'Hydraulic lift for pickup location',
      icon: Truck
    },
    {
      id: 'residential',
      name: 'Residential Pickup, Construction, Hotel or School',
      description: 'Limited Access Locations',
      icon: Home
    },
    {
      id: 'appointment',
      name: 'Appointment Needed',
      description: 'Schedule specific pickup time',
      icon: Calendar
    },
    {
      id: 'special',
      name: 'Special Pickup',
      description: '2 Hour window',
      icon: Star
    }
  ];

  const handleServiceToggle = (serviceId) => {
    if (!availableServices.find((service) => service.id === serviceId)) {
      console.error(`Invalid service ID: ${serviceId}`);
      return;
    }
    const currentServices = currentQuote.services || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((s) => s !== serviceId)
      : [...currentServices, serviceId];

    updateServices(newServices);
  };

  const isServiceSelected = (serviceId) => {
    return (currentQuote.services || []).includes(serviceId);
  };

  return (
    <div className={`shadow rounded-lg p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h2 className={`text-lg font-medium mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Additional Services
      </h2>
      <p className={`text-sm mb-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Select any additional services required for pickup
      </p>

      <div className="space-y-3">
        {availableServices.map((service) => {
          const Icon = service.icon;
          const isSelected = isServiceSelected(service.id);
          
          return (
            <label
              key={service.id}
              className={`
                relative flex items-start p-4 border rounded-lg cursor-pointer
                transition-all duration-200
                ${isSelected 
                  ? isDarkMode
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-blue-500 bg-blue-50'
                  : isDarkMode
                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={() => handleServiceToggle(service.id)}
                aria-describedby={`${service.id}-description`}
              />
              
              <div className="flex items-center h-5">
                <div
                  className={`
                    h-4 w-4 rounded border flex items-center justify-center
                    ${isSelected 
                      ? 'bg-blue-600 border-blue-600' 
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-500'
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 mr-2 ${
                    isSelected 
                      ? 'text-blue-600' 
                      : isDarkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isSelected 
                      ? isDarkMode
                        ? 'text-blue-300'
                        : 'text-blue-900'
                      : isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'
                  }`}>
                    {service.name}
                  </span>
                </div>
                <p id={`${service.id}-description`} className={`text-sm ${
                  isSelected 
                    ? isDarkMode
                      ? 'text-blue-400'
                      : 'text-blue-700'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`}>
                  {service.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {currentQuote.services && currentQuote.services.length > 0 && (
        <div className={`mt-4 p-3 rounded-md ${
          isDarkMode 
            ? 'bg-amber-900/20' 
            : 'bg-amber-50'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-amber-400' : 'text-amber-800'
          }`}>
            <strong>Note:</strong> Additional services may incur extra charges. 
            Airport drop-off fees are automatically included in the quote.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceOptions;
