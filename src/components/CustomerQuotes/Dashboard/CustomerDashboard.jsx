// src/components/CustomerQuotes/Dashboard/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Package, Truck, Anchor,
  TrendingUp, Clock, DollarSign, BarChart3,
  ArrowRight, Plus, MapPin, Star
} from 'lucide-react';

// Import widgets
import QuoteStatsWidget from './widgets/QuoteStatsWidget';
import RecentQuotesWidget from './widgets/RecentQuotesWidget';
import SavedRoutesWidget from './widgets/SavedRoutesWidget';
import SpendAnalyticsWidget from './widgets/SpendAnalyticsWidget';

const CustomerDashboard = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - will be replaced with API calls
  const [stats, setStats] = useState({
    activeQuotes: 24,
    monthlyQuotes: 156,
    avgSavings: '12.5%',
    projectQuotes: 4,
    totalSpend: 125420,
    savedRoutes: 8
  });

  const mainServices = [
    {
      id: 'exports',
      title: 'Export Shipments',
      description: 'International outbound shipping via air and ocean',
      icon: Globe,
      color: 'blue',
      count: 12,
      subServices: [
        { name: 'Air Export', path: 'export-air' },
        { name: 'Ocean Export', path: 'export-ocean' },
        { name: 'Project Export', path: 'export-project' }
      ]
    },
    {
      id: 'imports', 
      title: 'Import Shipments',
      description: 'International inbound shipping with customs clearance',
      icon: Package,
      color: 'purple',
      count: 8,
      subServices: [
        { name: 'Air Import', path: 'import-air' },
        { name: 'Ocean Import', path: 'import-ocean' },
        { name: 'Project Import', path: 'import-project' }
      ]
    },
    {
      id: 'ground',
      title: 'Ground Transport',
      description: 'Domestic trucking services - LTL, FTL, and expedited',
      icon: Truck,
      color: 'green',
      count: 24,
      subServices: [
        { name: 'LTL', path: 'ground', state: { service: 'ltl' } },
        { name: 'FTL', path: 'ground', state: { service: 'ftl' } },
        { name: 'Expedited', path: 'ground', state: { service: 'expedited' } }
      ]
    },
    {
      id: 'project',
      title: 'Project Cargo',
      description: 'Oversized, heavy-lift, and complex multi-modal shipments',
      icon: Anchor,
      color: 'orange',
      count: 4,
      badge: 'Specialized',
      subServices: [
        { name: 'Export Project', path: 'project-export' },
        { name: 'Import Project', path: 'project-import' },
        { name: 'Domestic Project', path: 'project-domestic' },
        { name: 'Multimodal', path: 'project-multimodal' }
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Freight Quote Portal
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome back, {shellContext?.user?.name || 'Customer'}
              </p>
            </div>
            <button
              onClick={() => navigate('saved-addresses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <MapPin className="w-4 h-4" />
              Saved Addresses
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Analytics Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuoteStatsWidget 
            stats={stats} 
            isDarkMode={isDarkMode}
          />
          <SpendAnalyticsWidget 
            spend={stats.totalSpend}
            savings={stats.avgSavings}
            isDarkMode={isDarkMode}
          />
          <SavedRoutesWidget
            count={stats.savedRoutes}
            isDarkMode={isDarkMode}
            onViewAll={() => navigate('saved-routes')}
          />
          <RecentQuotesWidget
            isDarkMode={isDarkMode}
            onViewAll={() => navigate('history')}
          />
        </div>

        {/* Service Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mainServices.map((service) => {
            const Icon = service.icon;
            const bgColor = {
              blue: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
              purple: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50', 
              green: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
              orange: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
            }[service.color];

            const iconColor = {
              blue: 'text-blue-500',
              purple: 'text-purple-500',
              green: 'text-green-500', 
              orange: 'text-orange-500'
            }[service.color];

            return (
              <div
                key={service.id}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } hover:shadow-lg transition-all`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${bgColor}`}>
                      <Icon className={`h-8 w-8 ${iconColor}`} />
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {service.count}
                      </span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Active quotes
                      </p>
                    </div>
                  </div>

                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {service.description}
                  </p>

                  {service.badge && (
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mb-4 ${
                      isDarkMode 
                        ? 'bg-orange-900/30 text-orange-400'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {service.badge}
                    </span>
                  )}

                  <div className="space-y-2">
                    {service.subServices.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => navigate(sub.path, { state: sub.state })}
                        className={`w-full flex items-center justify-between p-2 rounded-lg ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        } transition-colors`}
                      >
                        <span className="text-sm font-medium">{sub.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(service.id)}
                    className={`w-full mt-4 px-4 py-2 rounded-lg font-medium ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } transition-colors`}
                  >
                    View All {service.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('saved-routes')}
              className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <Star className={`w-6 h-6 mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Saved Routes
              </p>
            </button>
            <button
              onClick={() => navigate('templates')}
              className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <Package className={`w-6 h-6 mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quote Templates
              </p>
            </button>
            <button
              onClick={() => navigate('analytics')}
              className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <BarChart3 className={`w-6 h-6 mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Analytics
              </p>
            </button>
            <button
              onClick={() => navigate('invoices')}
              className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <DollarSign className={`w-6 h-6 mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Invoices
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
