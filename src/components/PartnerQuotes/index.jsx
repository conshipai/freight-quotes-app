import React from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Plane, Ship, Briefcase, Plus } from 'lucide-react';
import ExportAir from './ExportAir';
import ExportOcean from './ExportOcean';
import ProjectQuotes from './ProjectQuotes';
import BatteryDetailsForm from './BatteryDetailsForm';
import DangerousGoodsForm from './DangerousGoodsForm';

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
            <NavLink to="export-air" className={({ isActive }) => `...`}>
              <Plane className="w-4 h-4" />
              Air Export
            </NavLink>
            {/* ... other nav links ... */}
          </nav>
          {/* ... New Quote button ... */}
        </div>
      </div>

      {/* Content - ADD THE NEW ROUTES HERE */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
          <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
          <Route path="projects" element={<ProjectQuotes shellContext={shellContext} />} />
          
          {/* ADD THESE NEW ROUTES */}
          <Route path="battery-details" element={<BatteryDetailsForm shellContext={shellContext} />} />
          <Route path="dangerous-goods" element={<DangerousGoodsForm shellContext={shellContext} />} />
          
          <Route index element={<Navigate to="export-air" replace />} />
          <Route path="*" element={<Navigate to="export-air" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default PartnerQuotes;
