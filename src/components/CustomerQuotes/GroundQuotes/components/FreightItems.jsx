// src/components/CustomerQuotes/GroundQuotes/components/FreightItems.jsx
import React from 'react';
import { Plus, Trash2, Package, AlertCircle } from 'lucide-react';

// Add this function after the imports
const estimateFreightClass = (density) => {
  if (!density || density <= 0) return null;
  
  // Standard NMFC density-based classifications
  if (density >= 50) return '50';
  if (density >= 35) return '55';
  if (density >= 30) return '60';
  if (density >= 22.5) return '65';
  if (density >= 15) return '70';
  if (density >= 13.5) return '77.5';
  if (density >= 12) return '85';
  if (density >= 10.5) return '92.5';
  if (density >= 9) return '100';
  if (density >= 8) return '110';
  if (density >= 7) return '125';
  if (density >= 6) return '150';
  if (density >= 5) return '175';
  if (density >= 4) return '200';
  if (density >= 3) return '250';
  if (density >= 2) return '300';
  if (density >= 1) return '400';
  return '500';
};

const FreightItems = ({ formData, updateFormData, errors, isDarkMode }) => {
  const freightClasses = [
    { value: '50', label: 'Class 50 - Clean Freight' },
    { value: '55', label: 'Class 55' },
    { value: '60', label: 'Class 60' },
    { value: '65', label: 'Class 65' },
    { value: '70', label: 'Class 70' },
    { value: '77.5', label: 'Class 77.5' },
    { value: '85', label: 'Class 85' },
    { value: '92.5', label: 'Class 92.5' },
    { value: '100', label: 'Class 100' },
    { value: '110', label: 'Class 110' },
    { value: '125', label: 'Class 125' },
    { value: '150', label: 'Class 150' },
    { value: '175', label: 'Class 175' },
    { value: '200', label: 'Class 200' },
    { value: '250', label: 'Class 250' },
    { value: '300', label: 'Class 300' },
    { value: '400', label: 'Class 400' },
    { value: '500', label: 'Class 500 - Low Density/High Value' }
  ];

  const packagingTypes = [
    { value: 'pallets', label: 'Pallets' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'crates', label: 'Crates' },
    { value: 'drums', label: 'Drums' },
    { value: 'bundles', label: 'Bundles' },
    { value: 'bags', label: 'Bags' },
    { value: 'rolls', label: 'Rolls' },
    { value: 'other', label: 'Other' }
  ];

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      class: '50',
      weight: '',
      length: '',
      width: '',
      height: '',
      quantity: 1,
      packagingType: 'pallets',
      description: '',
      nmfc: '',
      hazmat: false,
      stackable: true
    };
    
    updateFormData({
      items: [...formData.items, newItem]
    });
  };

  const removeItem = (id) => {
    updateFormData({
      items: formData.items.filter(item => item.id !== id)
    });
  };

  const updateItem = (id, field, value) => {
    updateFormData({
      items: formData.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const calculateTotalWeight = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.weight || 0) * parseInt(item.quantity || 1));
    }, 0);
  };

  // Update the calculateDensity function to also return estimated class
  const calculateDensityAndClass = (item) => {
    if (!item.weight || !item.length || !item.width || !item.height || 
        item.weight === '0' || item.length === '0' || item.width === '0' || item.height === '0') {
      return { density: 0, estimatedClass: null };
    }
    
    const cubicFeet = (parseFloat(item.length) * parseFloat(item.width) * parseFloat(item.height)) / 1728;
    const density = parseFloat(item.weight) / cubicFeet;
    const estimatedClass = estimateFreightClass(density);
    
    return {
      density: density.toFixed(2),
      estimatedClass,
      cubicFeet: cubicFeet.toFixed(2)
    };
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Freight Details
        </h3>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Total Weight: <span className="font-semibold">{calculateTotalWeight()} lbs</span>
        </div>
      </div>

      {errors.items && (
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
          isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
        }`}>
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{errors.items}</span>
        </div>
      )}

      <div className="space-y-4">
        {formData.items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Package className="w-4 h-4" />
                Item {index + 1}
                {item.hazmat && (
                  <span className="text-xs px-2 py-1 bg-red-600 text-white rounded">
                    HAZMAT
                  </span>
                )}
              </h4>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className={`p-1 rounded hover:bg-gray-200 ${
                    isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Class */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Freight Class
                </label>
                <select
                  value={item.class}
                  onChange={(e) => updateItem(item.id, 'class', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-blue-500`}
                >
                  {freightClasses.map(fc => (
                    <option key={fc.value} value={fc.value}>{fc.label}</option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  min="1"
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Packaging Type */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Packaging
                </label>
                <select
                  value={item.packagingType}
                  onChange={(e) => updateItem(item.id, 'packagingType', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-blue-500`}
                >
                  {packagingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Dimensions */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Length (in)
                </label>
                <input
                  type="number"
                  value={item.length}
                  onChange={(e) => updateItem(item.id, 'length', e.target.value)}
                  placeholder="48"
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
                  Width (in)
                </label>
                <input
                  type="number"
                  value={item.width}
                  onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                  placeholder="40"
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
                  Height (in)
                </label>
                <input
                  type="number"
                  value={item.height}
                  onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                  placeholder="48"
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="General freight, machinery, etc."
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Item Options */}
            <div className="mt-3 flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.hazmat}
                  onChange={(e) => updateItem(item.id, 'hazmat', e.target.checked)}
                  className="mr-2"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Hazardous Material
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.stackable}
                  onChange={(e) => updateItem(item.id, 'stackable', e.target.checked)}
                  className="mr-2"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Stackable
                </span>
              </label>
            </div>

            {/* Density and Class Calculation Display */}
            {item.length && item.width && item.height && item.weight && (
              <div className={`text-sm mt-3 p-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {(() => {
                  const { density, estimatedClass, cubicFeet } = calculateDensityAndClass(item);
                  return (
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Density: 
                        </span>
                        <span className={`ml-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {density} lbs/ft³
                        </span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Volume: 
                        </span>
                        <span className={`ml-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cubicFeet} ft³
                        </span>
                      </div>
                      {estimatedClass && (
                        <div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Suggested Class: 
                          </span>
                          <span className={`ml-1 font-medium ${
                            item.class !== estimatedClass 
                              ? 'text-orange-500' 
                              : isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            {estimatedClass}
                            {item.class !== estimatedClass && (
                              <button
                                type="button"
                                onClick={() => updateItem(item.id, 'class', estimatedClass)}
                                className="ml-2 text-xs underline hover:no-underline"
                              >
                                Use this class
                              </button>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className={`mt-4 w-full py-2 px-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
          isDarkMode
            ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
            : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
        }`}
      >
        <Plus className="w-5 h-5" />
        Add Another Item
      </button>

      {/* Insurance Option */}
      <div className="mt-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.insurance.requested}
            onChange={(e) => updateFormData({
              insurance: {
                ...formData.insurance,
                requested: e.target.checked
              }
            })}
            className="mr-3"
          />
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add Cargo Insurance
          </span>
        </label>
        
        {formData.insurance.requested && (
          <div className="mt-3 ml-6">
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Declared Value ($)
            </label>
            <input
              type="number"
              value={formData.insurance.value}
              onChange={(e) => updateFormData({
                insurance: {
                  ...formData.insurance,
                  value: e.target.value
                }
              })}
              placeholder="0.00"
              className={`w-64 px-3 py-2 rounded-md border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}
      </div>

      {/* Special Instructions */}
      <div className="mt-6">
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Special Instructions (Optional)
        </label>
        <textarea
          value={formData.specialInstructions}
          onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
          rows={3}
          placeholder="Any special handling requirements, delivery instructions, etc."
          className={`w-full px-3 py-2 rounded-md border ${
            isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500`}
        />
      </div>
    </div>
  );
};

export default FreightItems;
