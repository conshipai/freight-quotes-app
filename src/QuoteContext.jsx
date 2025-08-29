// src/contexts/QuoteContext.jsx
import React, { createContext, useContext, useState } from 'react';

const QuoteContext = createContext();

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};

export const QuoteProvider = ({ children }) => {
  const [quoteData, setQuoteData] = useState({
    units: 'imperial',
    cargo: {
      pieces: []
    }
  });

  const updateQuoteData = (updates) => {
    setQuoteData(prev => ({ ...prev, ...updates }));
  };

  const value = {
    quoteData,
    updateQuoteData,
    setQuoteData
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};

export default QuoteContext;
