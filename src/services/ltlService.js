// src/services/ltlService.js
import axios from 'axios';
import { CarrierTypes } from './carrierConfig';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getLTLRates = async ({ customerId, customerCarriers, shipmentData }) => {
  const enabledCarriers = Object.entries(customerCarriers)
    .filter(([_, config]) => config.enabled);
  
  const ratePromises = enabledCarriers.map(async ([carrierType, config]) => {
    try {
      switch (carrierType) {
        case CarrierTypes.STG_LOGISTICS:
          return await getSTGRates(config, shipmentData);
          
        case CarrierTypes.SOUTHEASTERN:
          return await getSoutheasternRates(config, shipmentData);
          
        case CarrierTypes.FEDEX_FREIGHT:
          return await getFedExRates(config, shipmentData);
          
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error getting rates from ${carrierType}:`, error);
      return null;
    }
  });

  const results = await Promise.all(ratePromises);
  return results.filter(Boolean).flat(); // Remove nulls and flatten
};

// STG Logistics Rate Function
const getSTGRates = async (config, shipmentData) => {
  const payload = {
    origin_zip: shipmentData.originZip,
    destination_zip: shipmentData.destinationZip,
    pickup_date: shipmentData.pickupDate,
    items: shipmentData.items.map(item => ({
      weight: item.weight,
      length: item.length,
      width: item.width,
      height: item.height,
      class: item.class,
      quantity: item.quantity,
      packaging_type: item.packagingType
    })),
    accessorials: {
      origin: shipmentData.originAccessorials,
      destination: shipmentData.destinationAccessorials
    }
  };

  const response = await axios.post(`${API_URL}/ltl/stg/rates`, {
    ...payload,
    account_config: {
      account_number: config.accountNumber,
      use_customer_rates: config.useCustomerRates,
      markup: config.markup
    }
  });

  return response.data.rates.map(rate => ({
    carrier: 'STG Logistics',
    carrierLogo: '/carriers/stg-logo.png',
    service: rate.service_type,
    transitDays: rate.transit_days,
    rate: {
      base: rate.base_rate,
      fuel: rate.fuel_surcharge,
