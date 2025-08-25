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
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default QuoteRouter;
