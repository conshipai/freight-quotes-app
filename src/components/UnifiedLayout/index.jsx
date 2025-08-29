// src/components/UnifiedLayout/index.jsx - Updated
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Plane, Ship, Truck, Globe,
  Clock, ArrowUpDown
} from 'lucide-react';
import Navigation from './Navigation';
import TopBar from './TopBar';

const UnifiedLayout = ({ 
  children, 
  shellContext, 
  viewMode, 
  onViewModeChange, 
  canToggleView 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = shellContext?.isDarkMode || false;
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Navigation items based on view
  const navigationItems = viewMode === 'customer' ? [
    { path: '/quotes/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quotes/import-air', label: 'Import Air', icon: Globe },
    { path: '/quotes/import-ocean', label: 'Import Ocean', icon: Ship },
    { path: '/quotes/export-air', label: 'Export Air', icon: ArrowUpDown },
    { path: '/quotes/export-ocean', label: 'Export Ocean', icon: Ship },
    { path: '/quotes/ground', label: 'Ground', icon: Truck },
    { path: '/quotes/project', label: 'Project Cargo', icon: Package },
    { path: '/quotes/history', label: 'History', icon: Clock },
  ] : [
    { path: '/quotes/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quotes/export-air', label: 'Export Air', icon: Plane },
    { path: '/quotes/export-ocean', label: 'Export Ocean', icon: Ship },
    { path: '/quotes/projects', label: 'Project Quotes', icon: Package },
    { path: '/quotes/history', label: 'History', icon: Clock },
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

      {/* Sidebar Navigation */}
      <Navigation
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        navigationItems={navigationItems}
        shellContext={shellContext}
        viewMode={viewMode}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Toggle */}
        <TopBar
          viewMode={viewMode}
          canToggleView={canToggleView}
          setViewMode={onViewModeChange}
          shellContext={shellContext}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UnifiedLayout;
