// src/router/QuoteRouter.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerQuotes from '../components/CustomerQuotes';
import PartnerQuotes from '../components/PartnerQuotes';
import ViewToggle from '../components/ViewToggle';

const QuoteRouter = ({ userRole, shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  
  // Determine if user can toggle views
  const canToggleView = userRole === 'system_admin' || userRole === 'conship_employee';
  
  // Determine default view based on role
  const getDefaultView = (role) => {
    switch(role) {
      case 'customer_master':
      case 'customer_user':
      case 'customer':
      case 'business_partner':
        return 'customer';
      case 'partner_master':
      case 'partner_user':
      case 'foreign_partner':
        return 'agent';
      case 'system_admin':
      case 'conship_employee':
        return 'agent'; // Default to agent view for admins
      default:
        return 'agent';
    }
  };
  
  const [currentView, setCurrentView] = useState(getDefaultView(userRole));
  
  // Update view when role changes
  useEffect(() => {
    if (!canToggleView) {
      setCurrentView(getDefaultView(userRole));
    }
  }, [userRole, canToggleView]);
  
  console.log('QuoteRouter - userRole:', userRole, 'currentView:', currentView, 'canToggle:', canToggleView);
  
  const handleViewToggle = (view) => {
    setCurrentView(view);
  };
  
  // Determine which component to show
  const showCustomerView = canToggleView ? currentView === 'customer' : 
    ['customer_master', 'customer_user', 'customer', 'business_partner'].includes(userRole);
  
  return (
    <div className="relative">
      {/* View Toggle - Only show for admin and employee */}
      {canToggleView && (
        <div className="absolute top-4 right-4 z-10">
          <ViewToggle 
            currentView={currentView}
            onToggle={handleViewToggle}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
      
      {/* Routes */}
      <Routes>
        <Route 
          path="/*" 
          element={
            showCustomerView ? 
              <CustomerQuotes shellContext={shellContext} /> : 
              <PartnerQuotes shellContext={shellContext} />
          } 
        />
      </Routes>
    </div>
  );
};

export default QuoteRouter;
