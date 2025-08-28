// src/components/Admin/CarrierConfiguration/index.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Eye, EyeOff, Save, TestTube } from 'lucide-react';
import { CarrierTypes, getCustomerCarrierConfig, saveCustomerCarrierConfig } from '../../../services/carrierConfig';

const CarrierConfiguration = ({ customerId, customerName, isDarkMode }) => {
  const [configs, setConfigs] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [testingCarrier, setTestingCarrier] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});

  const carrierOptions = [
    { 
      type: CarrierTypes.STG_LOGISTICS, 
      name: 'STG Logistics',
      fields: ['accountId', 'username', 'password', 'contactEmail', 'testMode']
    },
    { 
      type: CarrierTypes.SOUTHEASTERN, 
      name: 'Southeastern Freight Lines (SEFL)',
      fields: ['accountNumber', 'username', 'password', 'testMode']
    },
    { 
      type: CarrierTypes.FEDEX_FREIGHT, 
      name: 'FedEx Freight',
      fields: ['accountNumber', 'meterNumber', 'key', 'password']
    }
  ];

  useEffect(() => {
    // Load existing configurations
    const existingConfigs = getCustomerCarrierConfig(customerId);
    setConfigs(existingConfigs);
  }, [customerId]);

  const handleAddCarrier = (carrierType) => {
    setConfigs({
      ...configs,
      [carrierType]: {
        enabled: true,
        useCustomerRates: true,
        markup: 0,
        testMode: false
      }
    });
    setUnsavedChanges({ ...unsavedChanges, [carrierType]: true });
  };

  const handleUpdateConfig = (carrierType, field, value) => {
    setConfigs({
      ...configs,
      [carrierType]: {
        ...configs[carrierType],
        [field]: value
      }
    });
    setUnsavedChanges({ ...unsavedChanges, [carrierType]: true });
  };

  const handleSaveConfig = (carrierType) => {
    saveCustomerCarrierConfig(customerId, carrierType, configs[carrierType]);
    setUnsavedChanges({ ...unsavedChanges, [carrierType]: false });
  };

  const handleRemoveCarrier = (carrierType) => {
    const newConfigs = { ...configs };
    delete newConfigs[carrierType];
    setConfigs(newConfigs);
    saveCustomerCarrierConfig(customerId, carrierType, null);
  };

  const handleTestConnection = async (carrierType) => {
    setTestingCarrier(carrierType);
    try {
      // Call your backend to test the carrier connection
      const response = await fetch('/api/carriers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierType,
          config: configs[carrierType]
        })
      });
      
      const result = await response.json();
      setTestResults({
        ...testResults,
        [carrierType]: {
          success: result.success,
          message: result.message
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        [carrierType]: {
          success: false,
          message: error.message
        }
      });
    } finally {
      setTestingCarrier(null);
    }
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Carrier Configuration - {customerName}
      </h2>

      {/* Add Carrier Dropdown */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Add Carrier Integration
        </label>
        <div className="flex gap-2">
          <select
            className={`flex-1 px-3 py-2 rounded-md border ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white'
            }`}
            onChange={(e) => e.target.value && handleAddCarrier(e.target.value)}
            value=""
          >
            <option value="">Select a carrier to add...</option>
            {carrierOptions
              .filter(opt => !configs[opt.type])
              .map(opt => (
                <option key={opt.type} value={opt.type}>
                  {opt.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Configured Carriers */}
      <div className="space-y-4">
        {Object.entries(configs).map(([carrierType, config]) => {
          const carrierInfo = carrierOptions.find(opt => opt.type === carrierType);
          if (!carrierInfo) return null;

          return (
            <div
              key={carrierType}
              className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {carrierInfo.name}
                </h3>
                <div className="flex items-center gap-2">
                  {unsavedChanges[carrierType] && (
                    <span className="text-sm text-yellow-600">Unsaved changes</span>
                  )}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => handleUpdateConfig(carrierType, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enabled
                    </span>
                  </label>
                  <button
                    onClick={() => handleRemoveCarrier(carrierType)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dynamic Fields Based on Carrier */}
                {carrierType === CarrierTypes.STG_LOGISTICS && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Account ID
                      </label>
                      <input
                        type="text"
                        value={config.accountId || ''}
                        onChange={(e) => handleUpdateConfig(carrierType, 'accountId', e.target.value)}
                        placeholder="TEST for testing"
                        className={`w-full px-3 py-2 rounded-md border ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={config.username || ''}
                        onChange={(e) => handleUpdateConfig(carrierType, 'username', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords[carrierType] ? 'text' : 'password'}
                          value={config.password || ''}
                          onChange={(e) => handleUpdateConfig(carrierType, 'password', e.target.value)}
                          className={`w-full px-3 py-2 rounded-md border ${
                            isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            [carrierType]: !showPasswords[carrierType]
                          })}
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showPasswords[carrierType] ? 
                            <EyeOff className="w-5 h-5" /> : 
                            <Eye className="w-5 h-5" />
                          }
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={config.contactEmail || ''}
                        onChange={(e) => handleUpdateConfig(carrierType, 'contactEmail', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* Rate Configuration */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Rate Type
                  </label>
                  <select
                    value={config.useCustomerRates ? 'customer' : 'master'}
                    onChange={(e) => handleUpdateConfig(carrierType, 'useCustomerRates', e.target.value === 'customer')}
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="customer">Customer's Negotiated Rates</option>
                    <option value="master">Your Master Account Rates</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Markup (%)
                  </label>
                  <input
                    type="number"
                    value={config.markup || 0}
                    onChange={(e) => handleUpdateConfig(carrierType, 'markup', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Test Mode Toggle */}
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.testMode || false}
                    onChange={(e) => handleUpdateConfig(carrierType, 'testMode', e.target.checked)}
                    className="rounded"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Test Mode
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection(carrierType)}
                    disabled={testingCarrier === carrierType}
                    className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${
                      testingCarrier === carrierType
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <TestTube className="w-4 h-4" />
                    {testingCarrier === carrierType ? 'Testing...' : 'Test Connection'}
                  </button>

                  <button
                    onClick={() => handleSaveConfig(carrierType)}
                    disabled={!unsavedChanges[carrierType]}
                    className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${
                      unsavedChanges[carrierType]
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Test Results */}
              {testResults[carrierType] && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  testResults[carrierType].success
                    ? isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'
                    : isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
                }`}>
                  {testResults[carrierType].message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CarrierConfiguration;
