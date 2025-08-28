// src/components/CustomerQuotes/GroundQuotes/components/ShipmentDetails.jsx
import React from 'react';
import { MapPin, Calendar, Building2, Home } from 'lucide-react';

const ShipmentDetails = ({ formData, updateFormData, errors, isDarkMode }) => {
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleZipChange = async (type, zip) => {
    updateFormData({ [`${type}Zip`]: zip });
    
    // Auto-populate city/state from ZIP if 5 digits entered
    if (zip.length === 5) {
      try {
        // You'll implement this API endpoint
        const response = await fetch(`/api/location/zip/${zip}`);
        if (response.ok) {
          const data = await response.json();
          updateFormData({
            [`${type}City`]: data.city,
            [`${type}State`]: data.state
          });
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }
  };

  const accessorialOptions = {
    origin: [
      { key: 'liftgate', label: 'Liftgate at Pickup' },
      { key: 'insidePickup', label: 'Inside Pickup' },
      { key: 'residential', label: 'Residential Pickup' },
      { key: 'limitedAccess', label: 'Limited Access' },
      { key: 'constructionSite', label: 'Construction Site' }
    ],
    destination: [
      { key: 'liftgate', label: 'Liftgate at Delivery' },
      { key: 'insideDelivery', label: 'Inside Delivery' },
      { key: 'residential', label: 'Residential Delivery' },
      { key: 'limitedAccess', label: 'Limited Access' },
      { key: 'notifyBeforeDelivery', label: 'Appointment Required' },
      { key: 'constructionSite', label: 'Construction Site' }
    ]
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Project Reference */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Project/Reference Number (Optional)
        </label>
        <input
          type="text"
          value={formData.projectReference}
          onChange={(e) => updateFormData({ projectReference: e.target.value })}
          placeholder="Enter reference number"
          className={`w-full px-3 py-2 rounded-md border ${
            isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      {/* Pickup Date */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Calendar className="inline w-4 h-4 mr-1" />
          Pickup Date
        </label>
        <input
          type="date"
          value={formData.pickupDate}
          onChange={(e) => updateFormData({ pickupDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-3 py-2 rounded-md border ${
            errors.pickupDate
              ? 'border-red-500'
              : isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500`}
        />
        {errors.pickupDate && (
          <p className="mt-1 text-sm text-red-500">{errors.pickupDate}</p>
        )}
      </div>

      {/* Origin Section */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <h4 className={`font-medium mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <MapPin className="w-4 h-4" />
          Origin Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.originZip}
              onChange={(e) => handleZipChange('origin', e.target.value)}
              maxLength="5"
              placeholder="12345"
              className={`w-full px-3 py-2 rounded-md border ${
                errors.originZip
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            />
            {errors.originZip && (
              <p className="mt-1 text-sm text-red-500">{errors.originZip}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              City
            </label>
            <input
              type="text"
              value={formData.originCity}
              onChange={(e) => updateFormData({ originCity: e.target.value })}
              placeholder="City name"
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              State
            </label>
            <select
              value={formData.originState}
              onChange={(e) => updateFormData({ originState: e.target.value })}
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select state</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Location Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="business"
                checked={formData.originType === 'business'}
                onChange={(e) => updateFormData({ originType: e.target.value })}
                className="mr-2"
              />
              <Building2 className="w-4 h-4 mr-1" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Business
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="residential"
                checked={formData.originType === 'residential'}
                onChange={(e) => {
                  updateFormData({ 
                    originType: e.target.value,
                    originAccessorials: {
                      ...formData.originAccessorials,
                      residential: true
                    }
                  });
                }}
                className="mr-2"
              />
              <Home className="w-4 h-4 mr-1" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Residential
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Accessorials
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accessorialOptions.origin.map(option => (
              <label key={option.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.originAccessorials[option.key]}
                  onChange={(e) => updateFormData({
                    originAccessorials: {
                      ...formData.originAccessorials,
                      [option.key]: e.target.checked
                    }
                  })}
                  disabled={option.key === 'residential' && formData.originType === 'residential'}
                  className="mr-2"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Section */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <h4 className={`font-medium mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <MapPin className="w-4 h-4" />
          Destination Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.destinationZip}
              onChange={(e) => handleZipChange('destination', e.target.value)}
              maxLength="5"
              placeholder="12345"
              className={`w-full px-3 py-2 rounded-md border ${
                errors.destinationZip
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            />
            {errors.destinationZip && (
              <p className="mt-1 text-sm text-red-500">{errors.destinationZip}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              City
            </label>
            <input
              type="text"
              value={formData.destinationCity}
              onChange={(e) => updateFormData({ destinationCity: e.target.value })}
              placeholder="City name"
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              State
            </label>
            <select
              value={formData.destinationState}
              onChange={(e) => updateFormData({ destinationState: e.target.value })}
              className={`w-full px-3 py-2 rounded-md border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select state</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Location Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="business"
                checked={formData.destinationType === 'business'}
                onChange={(e) => updateFormData({ destinationType: e.target.value })}
                className="mr-2"
              />
              <Building2 className="w-4 h-4 mr-1" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Business
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="residential"
                checked={formData.destinationType === 'residential'}
                onChange={(e) => {
                  updateFormData({ 
                    destinationType: e.target.value,
                    destinationAccessorials: {
                      ...formData.destinationAccessorials,
                      residential: true
                    }
                  });
                }}
                className="mr-2"
              />
              <Home className="w-4 h-4 mr-1" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Residential
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Accessorials
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accessorialOptions.destination.map(option => (
              <label key={option.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.destinationAccessorials[option.key]}
                  onChange={(e) => updateFormData({
                    destinationAccessorials: {
                      ...formData.destinationAccessorials,
                      [option.key]: e.target.checked
                    }
                  })}
                  disabled={option.key === 'residential' && formData.destinationType === 'residential'}
                  className="mr-2"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
