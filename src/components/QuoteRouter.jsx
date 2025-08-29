// src/components/QuoteRouter.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UnifiedLayout from './UnifiedLayout';
import UnifiedDashboard from './UnifiedDashboard';

// Customer Components
import CustomerDashboard from './CustomerQuotes/Dashboard/CustomerDashboard';
import GroundQuotes from './CustomerQuotes/GroundQuotes';
import BookingPage from './CustomerQuotes/Booking';

// Agent Components  
import ExportAir from './PartnerQuotes/ExportAir';
import ExportOcean from './PartnerQuotes/ExportOcean';
import ProjectQuotes from './PartnerQuotes/ProjectQuotes';
import BatteryDetailsForm from './PartnerQuotes/BatteryDetailsForm';
import DangerousGoodsForm from './PartnerQuotes/DangerousGoodsForm';
import QuoteSuccess from './PartnerQuotes/QuoteSuccess';
import QuoteHistory from './PartnerQuotes/QuoteHistory';
import QuoteDetails from './PartnerQuotes/QuoteDetails';
import BookingSuccess from './PartnerQuotes/BookingSuccess';

const QuoteRouter = ({ shellContext }) => {
  const userRole = shellContext?.user?.role || 'agent';
  
  // Determine if user can toggle views
  const canToggleView = ['system_admin', 'conship_employee'].includes(userRole);
  
  // Get default view based on role
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
        return localStorage.getItem('preferredView') || 'agent';
      default:
        return 'agent';
    }
  };
  
  const [viewMode, setViewMode] = useState(getDefaultView(userRole));
  
  // Update view mode and save preference for admins
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (canToggleView) {
      localStorage.setItem('preferredView', mode);
    }
  };
  
  // Update view when role changes (for non-admins)
  useEffect(() => {
    if (!canToggleView) {
      setViewMode(getDefaultView(userRole));
    }
  }, [userRole, canToggleView]);

  return (
    <UnifiedLayout 
      shellContext={shellContext}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      canToggleView={canToggleView}
    >
      <Routes>
        {viewMode === 'customer' ? (
          <>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerDashboard shellContext={shellContext} />} />
            <Route path="dashboard" element={<CustomerDashboard shellContext={shellContext} />} />
            <Route path="import-air" element={<ComingSoon title="Import Air" isDarkMode={shellContext?.isDarkMode} />} />
            <Route path="import-ocean" element={<ComingSoon title="Import Ocean" isDarkMode={shellContext?.isDarkMode} />} />
            <Route path="export-air" element={<ComingSoon title="Export Air" isDarkMode={shellContext?.isDarkMode} />} />
            <Route path="export-ocean" element={<ComingSoon title="Export Ocean" isDarkMode={shellContext?.isDarkMode} />} />
            <Route path="ground/*" element={<GroundQuotes shellContext={shellContext} />} />
            <Route path="project" element={<ComingSoon title="Project Cargo" isDarkMode={shellContext?.isDarkMode} />} />
            <Route path="history" element={<QuoteHistory shellContext={shellContext} viewMode="customer" />} />
            <Route path="booking" element={<BookingPage shellContext={shellContext} />} />
            <Route path="*" element={<Navigate to="/quotes/dashboard" replace />} />
          </>
        ) : (
          <>
            {/* Agent Routes */}
            <Route path="/" element={<UnifiedDashboard viewMode="agent" shellContext={shellContext} />} />
            <Route path="dashboard" element={<UnifiedDashboard viewMode="agent" shellContext={shellContext} />} />
            <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
            <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
            <Route path="projects" element={<ProjectQuotes shellContext={shellContext} />} />
            
            {/* Special Forms */}
            <Route path="battery-details" element={<BatteryDetailsForm shellContext={shellContext} />} />
            <Route path="dangerous-goods" element={<DangerousGoodsForm shellContext={shellContext} />} />
            
            {/* Quote Flow */}
            <Route path="success" element={<QuoteSuccess shellContext={shellContext} />} />
            <Route path="history" element={<QuoteHistory shellContext={shellContext} viewMode="agent" />} />
            <Route path="details/:quoteId" element={<QuoteDetails shellContext={shellContext} />} />
            <Route path="booking-success" element={<BookingSuccess shellContext={shellContext} />} />
            <Route path="*" element={<Navigate to="/quotes/dashboard" replace />} />
          </>
        )}
      </Routes>
    </UnifiedLayout>
  );
};

// Placeholder component
const ComingSoon = ({ title, isDarkMode }) => (
  <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </h2>
    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
      Coming soon!
    </p>
  </div>
);

export default QuoteRouter;
