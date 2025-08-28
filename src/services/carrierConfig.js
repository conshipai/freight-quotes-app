// src/services/carrierConfig.js
// This manages carrier configurations per customer

const CARRIER_CONFIG_KEY = 'carrier_configs';

export const CarrierTypes = {
  STG_LOGISTICS: 'stg_logistics',
  SOUTHEASTERN: 'southeastern',
  FEDEX_FREIGHT: 'fedex_freight',
  XPO: 'xpo',
  ESTES: 'estes',
  CUSTOM_API: 'custom_api'
};

export const getCustomerCarrierConfig = (customerId) => {
  // In production, this would come from your backend
  // For now, let's use localStorage for demo
  const configs = JSON.parse(localStorage.getItem(CARRIER_CONFIG_KEY) || '{}');
  return configs[customerId] || {};
};

export const saveCustomerCarrierConfig = (customerId, carrierType, config) => {
  const configs = JSON.parse(localStorage.getItem(CARRIER_CONFIG_KEY) || '{}');
  
  if (!configs[customerId]) {
    configs[customerId] = {};
  }
  
  configs[customerId][carrierType] = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(CARRIER_CONFIG_KEY, JSON.stringify(configs));
  return configs[customerId];
};

// Example configuration structure:
const exampleConfig = {
  'customer_123': {
    'fedex_freight': {
      enabled: true,
      accountNumber: 'XXXXX',
      apiKey: 'encrypted_key',
      apiSecret: 'encrypted_secret',
      useCustomerRates: true,
      markup: 0, // percentage markup (0 means show actual rates)
      updatedAt: '2024-01-01T00:00:00Z'
    },
    'stg_logistics': {
      enabled: true,
      accountNumber: 'YYYYY',
      apiEndpoint: 'https://api.stglogistics.com/v1',
      apiKey: 'encrypted_key',
      useCustomerRates: false, // Use your master account
      markup: 15, // 15% markup on your rates
      updatedAt: '2024-01-01T00:00:00Z'
    }
  }
};
