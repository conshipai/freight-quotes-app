// src/services/carriers/stgService.js
import axios from 'axios';

const STG_API_BASE = process.env.REACT_APP_STG_API_URL || 'https://api.freightforce.com';

// Cache for auth tokens per customer
const tokenCache = new Map();

export const getSTGRates = async (config, shipmentData) => {
  try {
    // Get or refresh auth token
    const token = await getSTGAuthToken(config);
    
    // Calculate total weight from items
    const totalWeight = shipmentData.items.reduce((sum, item) => 
      sum + (parseFloat(item.weight) * parseInt(item.quantity)), 0
    );

    // Build STG rate request
    const rateRequest = {
      rateType: "N", // Nationwide Linehaul for LTL
      origin: shipmentData.originZip,
      originType: "Z", // Zipcode
      destination: shipmentData.destinationZip,
      destinationType: "Z", // Zipcode
      weight: totalWeight,
      
      // Map dimensions if provided
      dimensions: shipmentData.items.map(item => ({
        qty: parseInt(item.quantity),
        weight: parseInt(item.weight),
        length: item.length ? parseInt(item.length) : 48, // Default pallet length
        width: item.width ? parseInt(item.width) : 40, // Default pallet width
        height: item.height ? parseInt(item.height) : 48, // Default pallet height
        description: item.description || `Class ${item.class} Freight`
      })),
      
      // Map pickup accessorials
      pickupAccessorials: mapAccessorialsToSTG(
        shipmentData.originAccessorials, 
        'pickup'
      ),
      
      // Map delivery accessorials
      deliveryAccessorials: mapAccessorialsToSTG(
        shipmentData.destinationAccessorials, 
        'delivery'
      )
    };

    // Make rate request
    const response = await axios.post(
      `${STG_API_BASE}/api/Quote`,
      rateRequest,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse and format STG response
    return parseSTGResponse(response.data, config);
    
  } catch (error) {
    console.error('STG API Error:', error.response?.data || error.message);
    throw new Error(`STG rate request failed: ${error.response?.data?.message || error.message}`);
  }
};

// Get or refresh auth token
const getSTGAuthToken = async (config) => {
  const cacheKey = `${config.accountId}_${config.username}`;
  const cached = tokenCache.get(cacheKey);
  
  // Check if token exists and is still valid (tokens typically expire after 24h)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }
  
  // Get new token
  const authRequest = {
    username: config.username,
    password: config.password,
    contactEmail: config.contactEmail || ''
  };
  
  const response = await axios.post(
    `${STG_API_BASE}/api/Auth/token`,
    authRequest
  );
  
  const token = response.data.token || response.data.access_token;
  const expiresIn = response.data.expires_in || 86400; // Default 24 hours
  
  // Cache the token
  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + (expiresIn * 1000)
  });
  
  return token;
};

// Map accessorials to STG format
const mapAccessorialsToSTG = (accessorials, type) => {
  const stgAccessorials = [];
  
  const mapping = {
    pickup: {
      liftgate: 'LIFTPU',
      insidePickup: 'INSIDE_PU',
      residential: 'RES_PU',
      limitedAccess: 'LIMITED_PU',
      constructionSite: 'CONSTRUCTION_PU'
    },
    delivery: {
      liftgate: 'LIFTDEL',
      insideDelivery: 'INSIDE_DEL',
      residential: 'RES_DEL',
      limitedAccess: 'LIMITED_DEL',
      notifyBeforeDelivery: 'NOTIFY_DEL',
      constructionSite: 'CONSTRUCTION_DEL'
    }
  };
  
  const typeMapping = mapping[type] || {};
  
  Object.entries(accessorials).forEach(([key, value]) => {
    if (value && typeMapping[key]) {
      stgAccessorials.push({
        code: typeMapping[key],
        description: key.replace(/([A-Z])/g, ' $1').trim()
      });
    }
  });
  
  return stgAccessorials;
};

// Parse STG response into standard format
const parseSTGResponse = (data, config) => {
  if (!data || !data.rates || data.rates.length === 0) {
    throw new Error('No rates returned from STG');
  }
  
  const rates = [];
  
  data.rates.forEach(rate => {
    // Apply markup if configured
    const markup = config.markup || 0;
    const applyMarkup = (amount) => parseFloat((amount * (1 + markup / 100)).toFixed(2));
    
    rates.push({
      carrier: 'STG Logistics',
      carrierCode: 'STG',
      carrierLogo: '/carriers/stg-logo.png',
      service: rate.serviceName || 'Standard LTL',
      serviceCode: rate.serviceCode || 'STD',
      transitDays: rate.transitDays || rate.estimatedTransitDays,
      
      rate: {
        base: applyMarkup(rate.baseRate || rate.freightCharges),
        fuel: applyMarkup(rate.fuelSurcharge || 0),
        accessorials: applyMarkup(rate.accessorialCharges || 0),
        discount: rate.discount || 0,
        total: applyMarkup(rate.totalRate || rate.totalCharges)
      },
      
      guaranteed: rate.guaranteed || false,
      guaranteedBy: rate.guaranteedDeliveryDate,
      quoteId: rate.quoteNumber || generateQuoteId('STG'),
      expirationDate: rate.expirationDate || getExpirationDate(7), // 7 days default
      
      details: {
        pickupTerminal: rate.originTerminal,
        deliveryTerminal: rate.destinationTerminal,
        notes: rate.notes || [],
        disclaimers: rate.disclaimers || []
      }
    });
  });
  
  return rates;
};

// Helper to generate quote ID if not provided
const generateQuoteId = (carrier) => {
  return `${carrier}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to get expiration date
const getExpirationDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Get list of accessorials for a terminal
export const getSTGAccessorials = async (config, terminalOrZip) => {
  try {
    const token = await getSTGAuthToken(config);
    
    const response = await axios.get(
      `${STG_API_BASE}/api/Accessorials/${terminalOrZip}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching STG accessorials:', error);
    return [];
  }
};

export default getSTGRates;
