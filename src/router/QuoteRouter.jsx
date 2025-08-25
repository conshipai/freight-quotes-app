import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerQuotes from '../components/CustomerQuotes';
import PartnerQuotes from '../components/PartnerQuotes';

const QuoteRouter = ({ userRole, shellContext }) => {
  // Check if user is a foreign partner
  const isForeignPartner = userRole === 'foreign_partner';

  return (
    <Routes>
      {isForeignPartner ? (
        <>
          {/* Foreign Partner Routes */}
          <Route path="/*" element={<PartnerQuotes shellContext={shellContext} />} />
        </>
      ) : (
        <>
          {/* Customer Routes */}
          <Route path="/*" element={<CustomerQuotes shellContext={shellContext} />} />
        </>
      )}
      
      {/* Default redirect - changed from /dashboard to root */}
      <Route path="/" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default QuoteRouter;
