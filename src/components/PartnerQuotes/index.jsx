// src/components/PartnerQuotes/index.jsx - Updated with new routes
import React from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Plane, Ship, Briefcase, Plus } from 'lucide-react';
import ExportAir from './ExportAir';
import ExportOcean from './ExportOcean';
import ProjectQuotes from './ProjectQuotes';
import BatteryDetailsForm from './BatteryDetailsForm';
import DangerousGoodsForm from './DangerousGoodsForm';
import PendingQuotes from './PendingQuotes';

const PartnerQuotes = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation Tabs - Keep as is */}
      <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* ... existing navigation code ... */}
      </div>

      {/* Content - Updated Routes */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
          <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
          <Route path="projects" element={<ProjectQuotes shellContext={shellContext} />} />
          
          {/* Add these new routes */}
          <Route path="battery-details" element={<BatteryDetailsForm shellContext={shellContext} />} />
          <Route path="dangerous-goods" element={<DangerousGoodsForm shellContext={shellContext} />} />
          <Route path="pending" element={<PendingQuotes shellContext={shellContext} />} />
          
          <Route index element={<Navigate to="export-air" replace />} />
          <Route path="*" element={<Navigate to="export-air" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default PartnerQuotes;
