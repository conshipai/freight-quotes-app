// src/components/PartnerQuotes/index.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Plane, Ship, Briefcase, 
  Clock, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

import ExportAir from './ExportAir';
import ExportOcean from './ExportOcean';
import ProjectQuotes from './ProjectQuotes';
import BatteryDetailsForm from './BatteryDetailsForm';
import DangerousGoodsForm from './DangerousGoodsForm';
import QuoteSuccess from './QuoteSuccess';
import QuoteDashboard from './QuoteDashboard';
import QuoteHistory from './QuoteHistory';
import QuoteDetails from './QuoteDetails';
import PendingQuotes from './PendingQuotes';
import BookingSuccess from './BookingSuccess';

const PartnerQuotes = ({ shellContext }) => {
  const location = useLocation();
  console.log('PartnerQuotes rendering, current path:', location.pathname);
  const isDarkMode = shellContext?.isDarkMode;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    {
      path: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      path: 'export-air',
      label: 'Air Export Quote',
      icon: Plane,
      color: 'text-cyan-600'
    },
    {
      path: 'export-ocean',
      label: 'Ocean Export Quote',
      icon: Ship,
      color: 'text-teal-600'
    },
    {
      path: 'projects',
      label: 'Project Quote',
      icon: Briefcase,
      color: 'text-purple-600'
    },
    {
      path: 'history',
      label: 'History',
      icon: Clock,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } shadow-lg`}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative
          h-full
          transition-all duration-300 ease-in-out
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          shadow-xl
          z-40
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`
              ${sidebarCollapsed ? 'hidden' : 'block'}
              text-xl font-bold
              ${isDarkMode ? 'text-white' : 'text-gray-900'}
            `}>
              Quotes
            </h2>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                hidden lg:block
                p-1.5 rounded-md transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path) || 
                           (item.path === 'dashboard' && location.pathname === '/quotes/');
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive
                    ? isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-blue-50 text-blue-700'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? item.color : ''}`} />
                <span className={`
                  ${sidebarCollapsed ? 'hidden' : 'block'}
                  font-medium
                `}>
                  {item.label}
                </span>
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-8 bg-blue-600 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer - User Info or Stats */}
        {!sidebarCollapsed && (
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="font-medium mb-1">Active Quotes</p>
              <div className="flex justify-between">
                <span>This Week:</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-orange-500">3</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">
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
            <Route path="success" element={
              (() => {
                console.log('Success route matched!');
                return <QuoteSuccess shellContext={shellContext} />;
              })()
            } />
            <Route path="pending/:requestId?" element={<PendingQuotes shellContext={shellContext} />} />
            <Route path="history" element={<QuoteHistory shellContext={shellContext} />} />
            <Route path="details/:quoteId" element={<QuoteDetails shellContext={shellContext} />} />
            <Route path="booking-success" element={<BookingSuccess shellContext={shellContext} />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default PartnerQuotes;
