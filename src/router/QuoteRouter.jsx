import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerQuotes from '../components/CustomerQuotes';
import PartnerQuotes from '../components/PartnerQuotes';

const QuoteRouter = ({ userRole, shellContext }) => {
  // Check if user is a foreign partner
  const isForeignPartner = userRole === 'foreign_partner';

  return (
    <Routes>
      {/* Route everything to the appropriate component based on role */}
      <Route path="/*" element={
        isForeignPartner ? 
          <PartnerQuotes shellContext={shellContext} /> : 
          <CustomerQuotes shellContext={shellContext} />
      } />
    </Routes>
  );
};

export default QuoteRouter;
