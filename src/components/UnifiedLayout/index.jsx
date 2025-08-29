// src/components/UnifiedLayout/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Plane, Ship, Truck, Globe,
  Clock, ChevronLeft, Menu, ArrowUpDown, Building2, Users
} from 'lucide-react';
import Navigation from './Navigation';
import TopBar from './TopBar';
import ViewToggle from './ViewToggle';

const UnifiedLayout = ({ children, shellContext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = shellContext?.isDarkMode || false;
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
        return 'agent'; // Default to agent view for admins
      default:
        return 'agent';
    }
  };
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState(getDefaultView(userRole));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Update view when role changes
  useEffect(() => {
    if (!canToggleView) {
      setViewMode(getDefaultView(userRole));
    }
  }, [userRole, canToggleView]);
  
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
        {/* Top Bar */}
        <TopBar
          viewMode={viewMode}
          canToggleView={canToggleView}
          setViewMode={setViewMode}
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
