// src/services/mockQuoteService.js
const mockQuotes = new Map();

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create quote request
export const createQuoteRequest = async (data) => {
  await delay(500);
  
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const quoteRequest = {
    requestId,
    status: 'processing',
    createdAt: new Date().toISOString(),
    shipmentData: data.shipmentData,
    customerId: data.customerId,
    responses: [],
    totalCarriers: 3,
    message: 'Request submitted'
  };
  
  mockQuotes.set(requestId, quoteRequest);
  
  // Start simulating carrier responses
  simulateCarrierResponses(requestId);
  
  return { requestId, status: 'processing' };
};

// Get quote status
export const getQuoteStatus = async (requestId) => {
  await delay(300);
  
  const quote = mockQuotes.get(requestId);
  if (!quote) {
    throw new Error('Quote request not found');
  }
  
  const completedCount = quote.responses.filter(r => r.completed).length;
  
  return {
    ...quote,
    status: completedCount === quote.totalCarriers ? 'completed' : 'processing',
    responses: quote.responses.filter(r => r.completed)
  };
};

// Simulate carrier responses coming in over time
const simulateCarrierResponses = (requestId) => {
  const carriers = [
    { name: 'STG Logistics', delay: 3000 },
    { name: 'Southeastern Freight Lines', delay: 7000 },
    { name: 'FedEx Freight', delay: 10000 }
  ];
  
  carriers.forEach((carrier, index) => {
    setTimeout(() => {
      const quote = mockQuotes.get(requestId);
      if (!quote) return;
      
      const success = Math.random() > 0.2; // 80% success rate
      
      const response = {
        carrier: carrier.name,
        success,
        completed: true,
        ...(success ? {
          service: 'Standard LTL',
          guaranteed: Math.random() > 0.7,
          transitDays: Math.floor(Math.random() * 3) + 2,
          rate: {
            base: Math.floor(Math.random() * 500) + 400,
            fuel: Math.floor(Math.random() * 100) + 50,
            accessorials: Math.floor(Math.random() * 50) + 25,
            total: 0
          },
          quoteId: `Q${Date.now()}-${index}`,
          details: {
            notes: ['Rate includes fuel surcharge', 'Subject to standard terms']
          }
        } : {
          error: 'Unable to provide rate for this lane'
        })
      };
      
      // Calculate total if successful
      if (success) {
        response.rate.total = response.rate.base + response.rate.fuel + response.rate.accessorials;
      }
      
      // Add response to quote
      quote.responses.push(response);
      mockQuotes.set(requestId, quote);
      
    }, carrier.delay);
  });
};
