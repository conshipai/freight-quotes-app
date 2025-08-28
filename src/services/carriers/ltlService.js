// src/services/ltlService.js - Updated version
import axios from 'axios';
import { CarrierTypes } from './carrierConfig';
import getSTGRates from './carriers/stgService';
import getSEFLRates from './carriers/seflService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getLTLRates = async ({ customerId, customerCarriers, shipmentData }) => {
  console.log('Getting LTL rates for customer:', customerId);
  console.log('Customer carriers:', customerCarriers);
  
  const enabledCarriers = Object.entries(customerCarriers || {})
    .filter(([_, config]) => config.enabled);
  
  if (enabledCarriers.length === 0) {
    return {
      rates: [],
      errors: [{
        carrier: 'System',
        message: 'No carriers configured for this account. Please contact your administrator.'
      }]
    };
  }
  
  const ratePromises = enabledCarriers.map(async ([carrierType, config]) => {
    try {
      console.log(`Fetching rates from ${carrierType}...`);
      
      switch (carrierType) {
        case CarrierTypes.STG_LOGISTICS:
          return {
            success: true,
            rates: await getSTGRates(config, shipmentData)
          };
          
        case CarrierTypes.SOUTHEASTERN:
          return {
            success: true,
            rates: await getSEFLRates(config, shipmentData)
          };
          
        case CarrierTypes.FEDEX_FREIGHT:
          // Placeholder for FedEx integration
          throw new Error('FedEx Freight integration coming soon');
          
        default:
          throw new Error(`Unknown carrier type: ${carrierType}`);
      }
    } catch (error) {
      console.error(`Error getting rates from ${carrierType}:`, error);
      return {
        success: false,
        carrier: carrierType,
        error: error.message || 'Failed to get rates'
      };
    }
  });

  const results = await Promise.allSettled(ratePromises);
  
  const successfulRates = [];
  const errors = [];
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.success) {
      successfulRates.push(...result.value.rates);
    } else if (result.status === 'fulfilled' && !result.value.success) {
      errors.push({
        carrier: result.value.carrier,
        message: result.value.error
      });
    } else if (result.status === 'rejected') {
      errors.push({
        carrier: 'Unknown',
        message: result.reason?.message || 'Failed to get rates'
      });
    }
  });
  
  // Sort rates by total cost
  successfulRates.sort((a, b) => a.rate.total - b.rate.total);
  
  return {
    rates: successfulRates,
    errors: errors
  };
};
