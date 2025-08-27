// src/components/PartnerQuotes/index.jsx
import React from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Plane, Ship, Briefcase, Plus } from 'lucide-react';

import ExportAir from './ExportAir';
import ExportOcean from './ExportOcean';
import ProjectQuotes from './ProjectQuotes';
import BatteryDetailsForm from './BatteryDetailsForm';
import DangerousGoodsForm from './DangerousGoodsForm';

// ✅ New pages
import QuoteSuccess from './QuoteSuccess';
import QuoteDashboard from './QuoteDashboard';
import QuoteHistory from './QuoteHistory';
import QuoteDetails from './QuoteDetails';
import PendingQuotes from './PendingQuotes';

const PartnerQuotes = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;

  console.log('RENDERING: PartnerQuotes component');

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation Tabs */}
      <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {/* Keep existing nav links */}
            <NavLink
              to="export-air"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium ${
                  isActive
                    ? isDarkMode
                      ? 'border-blue-400 text-blue-300'
                      : 'border-blue-600 text-blue-700'
                    : isDarkMode
                    ? 'border-transparent text-gray-300 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <Plane className="w-4 h-4" />
              Air Export
            </NavLink>

            <NavLink
              to="export-ocean"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium ${
                  isActive
                    ? isDarkMode
                      ? 'border-blue-400 text-blue-300'
                      : 'border-blue-600 text-blue-700'
                    : isDarkMode
                    ? 'border-transparent text-gray-300 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <Ship className="w-4 h-4" />
              Ocean Export
            </NavLink>

            <NavLink
              to="projects"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium ${
                  isActive
                    ? isDarkMode
                      ? 'border-blue-400 text-blue-300'
                      : 'border-blue-600 text-blue-700'
                    : isDarkMode
                    ? 'border-transparent text-gray-300 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <Briefcase className="w-4 h-4" />
              Projects
            </NavLink>

            {/* You can add optional tabs for Dashboard/History/Pending if desired */}
          </nav>

          {/* New Quote button (kept placeholder comment in your snippet) */}
          {/* ... New Quote button ... */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          {/* Main Dashboard - Default Route */}
          <Route index element={<QuoteDashboard shellContext={shellContext} />} />
          <Route path="dashboard" element={<QuoteDashboard shellContext={shellContext} />} />

          {/* Quote Creation Routes */}
          <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
          <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
          <Route path="projects" element={<ProjectQuotes shellContext={shellContext} />} />

          {/* Special Cargo Forms */}
          <Route path="battery-details" element={<BatteryDetailsForm shellContext={shellContext} />} />
          <Route path="dangerous-goods" element={<DangerousGoodsForm shellContext={shellContext} />} />

          {/* Quote Flow Pages */}
          <Route path="success" element={<QuoteSuccess shellContext={shellContext} />} />
          <Route path="pending/:requestId?" element={<PendingQuotes shellContext={shellContext} />} />
          <Route path="history" element={<QuoteHistory shellContext={shellContext} />} />
          <Route path="details/:quoteId" element={<QuoteDetails shellContext={shellContext} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default PartnerQuotes;
