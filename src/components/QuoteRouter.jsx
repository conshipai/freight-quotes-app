// src/components/QuoteRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserType } from '../utils/serviceAccess';

// Customer Components
import CustomerDashboard from './CustomerQuotes/Dashboard/CustomerDashboard';
import BookingPage from './CustomerQuotes/Booking';

// Partner Components  
import QuoteDashboard from './PartnerQuotes/QuoteDashboard';
import QuoteHistory from './PartnerQuotes/QuoteHistory';
import ProjectQuotes from './PartnerQuotes/ProjectQuotes';
import PendingQuotes from './PartnerQuotes/PendingQuotes';
import BookingSuccess from './PartnerQuotes/BookingSuccess';

// Shared Components
import ExportAirQuoteGenerator from './shared/ExportAirQuoteGenerator';
import QuoteSuccess from './shared/QuoteSuccess';
import DangerousGoodsForm from './shared/DangerousGoodsForm';
import BatteryDetailsForm from './shared/BatteryDetailsForm';

// Future components (placeholders)
const ImportAirQuote = () => <div>Import Air Quote - Coming Soon</div>;
const ImportOceanQuote = () => <div>Import Ocean Quote - Coming Soon</div>;
const ExportOceanQuote = () => <div>Export Ocean Quote - Coming Soon</div>;
const GroundQuote = () => <div>Ground Quote - Coming Soon</div>;

const QuoteRouter = () => {
  const { user } = useAuth();
  const userType = getUserType(user);
  
  // Common routes for both user types
  const commonRoutes = (
    <>
      {/* Export Air - Available to both */}
      <Route path="export-air" element={
        <ExportAirQuoteGenerator 
          user={user} 
          isDarkMode={false} // Get from theme context if available
        />
      } />
      
      {/* Special cargo forms */}
      <Route path="dg-details" element={<DangerousGoodsForm />} />
      <Route path="battery-details" element={<BatteryDetailsForm />} />
      
      {/* Success page */}
      <Route path="success" element={<QuoteSuccess />} />
      <Route path="booking-success" element={<BookingSuccess />} />
    </>
  );
  
  if (userType === 'customer') {
    return (
      <Routes>
        <Route index element={<CustomerDashboard />} />
        
        {/* Customer-specific routes */}
        <Route path="import-air" element={<ImportAirQuote />} />
        <Route path="import-ocean" element={<ImportOceanQuote />} />
        <Route path="export-ocean" element={<ExportOceanQuote />} />
        <Route path="ground" element={<GroundQuote />} />
        <Route path="book/:quoteId" element={<BookingPage />} />
        
        {/* Common routes */}
        {commonRoutes}
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/quotes" replace />} />
      </Routes>
    );
  }
  
  // Foreign agent routes
  return (
    <Routes>
      <Route index element={<QuoteDashboard />} />
      
      {/* Partner-specific routes */}
      <Route path="history" element={<QuoteHistory />} />
      <Route path="projects" element={<ProjectQuotes />} />
      <Route path="pending" element={<PendingQuotes />} />
      <Route path="export-ocean" element={<ExportOceanQuote />} />
      
      {/* Common routes */}
      {commonRoutes}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/quotes" replace />} />
    </Routes>
  );
};

export default QuoteRouter;
