// src/router/QuoteRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerQuotes from '../components/CustomerQuotes';
import PartnerQuotes from '../components/PartnerQuotes';

const QuoteRouter = ({ userRole, shellContext }) => {
  console.log('QuoteRouter - userRole:', userRole, 'type:', typeof userRole);
  
  // Check for foreign_partner or customer roles
  if (userRole === 'foreign_partner') {
    console.log('Rendering PartnerQuotes for foreign_partner');
    return (
      <Routes>
        <Route path="/*" element={<PartnerQuotes shellContext={shellContext} />} />
      </Routes>
    );
  } else if (userRole === 'customer' || userRole === 'business_partner') {
    console.log('Rendering CustomerQuotes for customer/business_partner');
    return (
      <Routes>
        <Route path="/*" element={<CustomerQuotes shellContext={shellContext} />} />
      </Routes>
    );
  } else {
    // Default for other roles (admin, conship_employee, etc.)
    console.log('Rendering PartnerQuotes for role:', userRole);
    return (
      <Routes>
        <Route path="/*" element={<PartnerQuotes shellContext={shellContext} />} />
      </Routes>
    );
  }
};

export default QuoteRouter;
