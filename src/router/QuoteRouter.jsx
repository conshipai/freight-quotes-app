// src/router/QuoteRouter.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UnifiedLayout from '../components/UnifiedLayout';
import UnifiedDashboard from '../components/UnifiedDashboard';

// Existing components
import CustomerQuotes from '../components/CustomerQuotes';
import PartnerQuotes from '../components/PartnerQuotes';
import BookingPage from '../components/CustomerQuotes/Booking';
import GroundQuotes from '../components/CustomerQuotes/GroundQuotes';
import ExportAir from '../components/PartnerQuotes/ExportAir';
import ExportOcean from '../components/PartnerQuotes/ExportOcean';
import ProjectQuotes from '../components/PartnerQuotes/ProjectQuotes';
import QuoteHistory from '../components/PartnerQuotes/QuoteHistory';
import QuoteDetails from '../components/PartnerQuotes/QuoteDetails';
import QuoteSuccess from '../components/PartnerQuotes/QuoteSuccess';
import BatteryDetailsForm from '../components/PartnerQuotes/BatteryDetailsForm';
import DangerousGoodsForm from '../components/PartnerQuotes/DangerousGoodsForm';
import BookingSuccess from '../components/PartnerQuotes/BookingSuccess';

const QuoteRouter = ({ userRole, shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  
  // Determine if user can toggle views
  const canToggleView = ['system_admin', 'conship_employee'].includes(userRole);
  
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
        return 'agent';
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
  
  // Determine which routes to show based on view
  const showCustomerRoutes = canToggleView ? currentView === 'customer' : 
    ['customer_master', 'customer_user', 'customer', 'business_partner'].includes(userRole);
  
  return (
    <UnifiedLayout 
      shellContext={{
        ...shellContext,
        currentView,
        setCurrentView
      }}
    >
      <Routes>
        {/* Common Routes */}
        <Route path="dashboard" element={<UnifiedDashboard viewMode={currentView} shellContext={shellContext} />} />
        <Route path="history" element={<QuoteHistory shellContext={shellContext} />} />
        <Route path="details/:quoteId" element={<QuoteDetails shellContext={shellContext} />} />
        <Route path="booking" element={<BookingPage shellContext={shellContext} />} />
        <Route path="booking-success" element={<BookingSuccess shellContext={shellContext} />} />
        <Route path="success" element={<QuoteSuccess shellContext={shellContext} />} />
        
        {/* Customer-specific Routes */}
        {showCustomerRoutes && (
          <>
            <Route path="import-air" element={<ImportAirPlaceholder shellContext={shellContext} />} />
            <Route path="import-ocean" element={<ImportOceanPlaceholder shellContext={shellContext} />} />
            <Route path="ground/*" element={<GroundQuotes shellContext={shellContext} />} />
            <Route path="project" element={<ProjectPlaceholder shellContext={shellContext} />} />
          </>
        )}
        
        {/* Agent-specific Routes */}
        {!showCustomerRoutes && (
          <>
            <Route path="projects" element={<ProjectQuotes shellContext={shellContext} />} />
            <Route path="battery-details" element={<BatteryDetailsForm shellContext={shellContext} />} />
            <Route path="dangerous-goods" element={<DangerousGoodsForm shellContext={shellContext} />} />
          </>
        )}
        
        {/* Shared Export Routes (available to both) */}
        <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
        <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </UnifiedLayout>
  );
};

// Placeholder components for unimplemented features
const ImportAirPlaceholder = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  return (
    <div className="p-6">
      <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Import Air
        </h2>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Import Air functionality coming soon!
        </p>
      </div>
    </div>
  );
};

const ImportOceanPlaceholder = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  return (
    <div className="p-6">
      <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Import Ocean
        </h2>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Import Ocean functionality coming soon!
        </p>
      </div>
    </div>
  );
};

const ProjectPlaceholder = ({ shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  return (
    <div className="p-6">
      <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Project Cargo
        </h2>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Project Cargo functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default QuoteRouter;
