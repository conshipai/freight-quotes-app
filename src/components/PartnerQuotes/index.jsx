import React from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Plane, Ship, Briefcase, Plus } from 'lucide-react';
import ExportAir from './ExportAir';
import ExportOcean from './ExportOcean';
import ProjectQuotes from './ProjectQuotes';

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
            <NavLink
              to="export-air"
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? isDarkMode
                      ? 'border-conship-orange text-conship-orange'
                      : 'border-conship-purple text-conship-purple'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Plane className="w-4 h-4" />
              Air Export
            </NavLink>
            
            <NavLink
              to="export-ocean"
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? isDarkMode
                      ? 'border-conship-orange text-conship-orange'
                      : 'border-conship-purple text-conship-purple'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Ship className="w-4 h-4" />
              Ocean Export
            </NavLink>
            
            <NavLink
              to="projects"
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? isDarkMode
                      ? 'border-conship-orange text-conship-orange'
                      : 'border-conship-purple text-conship-purple'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Briefcase className="w-4 h-4" />
              Project Quotes
            </NavLink>
          </nav>
          
          <button
            onClick={() => navigate('export-air')}
            className={`absolute right-4 top-3 px-4 py-2 rounded-lg flex items-center gap-2 text-white ${
              isDarkMode 
                ? 'bg-conship-orange hover:bg-orange-600' 
                : 'bg-conship-purple hover:bg-purple-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Quote
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="export-air" element={<ExportAir shellContext={shellContext} />} />
          <Route path="export-ocean" element={<ExportOcean shellContext={shellContext} />} />
          <Route path="projects" element={<ProjectQuotes shellContext={shellContext} />} />
          <Route index element={<Navigate to="export-air" replace />} />
          <Route path="*" element={<Navigate to="export-air" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default PartnerQuotes;
