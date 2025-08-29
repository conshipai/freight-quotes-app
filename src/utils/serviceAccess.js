// src/utils/serviceAccess.js

export const getAvailableServices = (userType) => {
  const services = {
    customer: ['import-air', 'import-ocean', 'export-air', 'export-ocean', 'ground', 'project'],
    foreign_agent: ['export-air', 'export-ocean', 'project']
  };
  return services[userType] || [];
};

export const getAvailableIncoterms = (userType, mode) => {
  const incoterms = {
    customer: {
      air: ['CPT', 'CIP', 'DAP', 'DDP'],
      ocean: ['CFR', 'CIF', 'DAP', 'DDP']
    },
    foreign_agent: {
      air: ['EXW', 'FCA'],
      ocean: ['EXW', 'FCA', 'FOB']
    }
  };
  return incoterms[userType]?.[mode] || [];
};

export const INCOTERM_DETAILS = {
  // Air Incoterms
  EXW: {
    code: 'EXW',
    name: 'Ex Works',
    description: 'Buyer arranges pickup from seller\'s premises. Minimal seller obligation.',
    requiresInsurance: false,
    requiresDestinationHandling: false
  },
  FCA: {
    code: 'FCA',
    name: 'Free Carrier',
    description: 'Seller delivers to carrier at named place. Risk transfers at handover.',
    requiresInsurance: false,
    requiresDestinationHandling: false
  },
  CPT: {
    code: 'CPT',
    name: 'Carriage Paid To',
    description: 'Seller pays for carriage to destination airport. Risk transfers at origin.',
    requiresInsurance: false,
    requiresDestinationHandling: false
  },
  CIP: {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    description: 'Same as CPT but seller provides minimum insurance. Risk transfers at origin.',
    requiresInsurance: true,
    requiresDestinationHandling: false
  },
  DAP: {
    code: 'DAP',
    name: 'Delivered at Place',
    description: 'Seller delivers to buyer\'s door (duties/taxes not included).',
    requiresInsurance: false,
    requiresDestinationHandling: true
  },
  DDP: {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    description: 'Seller assumes all costs including customs duties/taxes.',
    requiresInsurance: false,
    requiresDestinationHandling: true,
    requiresDDPInfo: true
  },
  // Ocean Incoterms
  FOB: {
    code: 'FOB',
    name: 'Free on Board',
    description: 'Seller loads goods on vessel. Risk transfers when goods pass ship\'s rail.',
    requiresInsurance: false,
    requiresDestinationHandling: false
  },
  CFR: {
    code: 'CFR',
    name: 'Cost and Freight',
    description: 'Seller pays costs and freight to destination port. Risk transfers at origin port.',
    requiresInsurance: false,
    requiresDestinationHandling: false
  },
  CIF: {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    description: 'Same as CFR but seller provides minimum insurance. Risk transfers at origin port.',
    requiresInsurance: true,
    requiresDestinationHandling: false
  }
};

// Helper to check if user has access to a specific service
export const hasServiceAccess = (userType, service) => {
  const availableServices = getAvailableServices(userType);
  return availableServices.includes(service);
};

// Get user type from context or auth
export const getUserType = (user) => {
  // Logic to determine user type from user object
  // This might come from role, region, or other fields
  if (user?.role === 'partner' || user?.role === 'partner_master') {
    return 'foreign_agent';
  }
  return 'customer';
};
