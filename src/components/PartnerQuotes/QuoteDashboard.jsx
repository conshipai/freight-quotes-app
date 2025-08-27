// src/components/PartnerQuotes/QuoteDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, Ship, Briefcase, Plus, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Package 
} from 'lucide-react';

const QuoteDashboard = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [stats, setStats] = useState({
    activeQuotes: 0,
    pendingQuotes: 0,
    completedToday: 0,
    monthlyVolume: 0
  });

  // Mock data for now
  useEffect(() => {
    // Simulate loading recent quotes
    setRecentQuotes([
      {
        id: '10001',  // Changed to just the number part
        origin: 'LAX',
        destination: 'LHR',
        status: 'pending',
        createdAt: new Date().toISOString(),
        carrierCount: 3
      },
      {
        id: '10002',  // Changed to just the number part
        origin: 'JFK',
        destination: 'NRT',
        status: 'ready',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        carrierCount: 5
      }
    ]);

    setStats({
      activeQuotes: 12,
      pendingQuotes: 3,
      completedToday: 5,
      monthlyVolume: 48
    });
  }, []);

  const quoteTypes = [
    {
      id: 'air',
      title: 'Air Freight',
      description: 'Fast international shipping by air',
      icon: Plane,
      color: isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      route: 'export-air'  // Changed to relative path
    },
    {
      id: 'ocean',
      title: 'Ocean Freight',
      description: 'Cost-effective sea shipping',
      icon: Ship,
      color: isDarkMode ? 'bg-cyan-900/20 border-cyan-700' : 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600',
      route: 'export-ocean'  // Changed to relative path
    },
    {
      id: 'project',
      title: 'Project Cargo',
      description: 'Special handling for complex shipments',
      icon: Briefcase,
      color: isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      route: 'projects'  // Changed to relative path
    }
  ];

  const handleQuoteTypeClick = (route) => {
    console.log('Navigating to:', route);
    navigate(`../${route}`, { relative: 'path' });
  };

  const handleViewAllClick = () => {
    console.log('Navigating to history');
    navigate('../history', { relative: 'path' });
  };

  const handleQuoteClick = (quoteId) => {
    console.log('Navigating to quote details:', quoteId);
    navigate(`../details/${quoteId}`, { relative: 'path' });
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Dashboard
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage your freight quotes
          </p>
        </div>

        {/* Test Button - TEMPORARY FOR DEBUGGING */}
        <div className="mb-4">
          <button
            onClick={() => {
              console.log('TEST: Navigating directly to success page');
              navigate('/quotes/success', {
                state: {
                  requestNumber: 'TEST-REQ-001',
                  quoteNumber: 'TEST-Q-001',
                  origin: 'LAX',
                  destination: 'JFK',
                  pieces: 5,
                  weight: '100 lbs',
                  cargoType: 'general'
                }
              });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            TEST: Go to Success Page
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Active Quotes
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeQuotes}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pending
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingQuotes}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Completed Today
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.completedToday}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Monthly Volume
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.monthlyVolume}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quote Type Selection */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Quote
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quoteTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleQuoteTypeClick(type.route)}
                  className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${type.color}`}
                >
                  <Icon className={`h-12 w-12 mb-4 ${type.iconColor}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {type.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Quotes
              </h2>
              <button
                onClick={handleViewAllClick}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentQuotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => handleQuoteClick(quote.id)}
                className={`px-6 py-4 cursor-pointer ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Q-2024-{quote.id}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {quote.origin} → {quote.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      quote.status === 'ready' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quote.status === 'ready' ? 'Ready' : 'Processing'}
                    </span>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {quote.carrierCount} carriers
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDashboard;
