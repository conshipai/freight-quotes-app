import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerQuotes from '../components/CustomerQuotes';
import PartnerQuotes from '../components/PartnerQuotes';

const QuoteRouter = ({ userRole, shellContext }) => {
  // Debug logging
  console.log('QuoteRouter - userRole:', userRole, 'type:', typeof userRole);
  
  // Explicitly check for foreign_partner role
  if (userRole === 'foreign_partner') {
    console.log('Rendering PartnerQuotes for foreign_partner');
    return (
      <Routes>
        <Route path="/*" element={<PartnerQuotes shellContext={shellContext} />} />
      </Routes>
    );
  } else {
    console.log('Rendering CustomerQuotes for role:', userRole);
    return (
      <Routes>
        <Route path="/*" element={<CustomerQuotes shellContext={shellContext} />} />
      </Routes>
    );
  }
};

export default QuoteRouter;
