// src/components/UnifiedDashboard/index.jsx
import React from 'react';
import { 
  TrendingUp, Package, Clock, DollarSign, 
  Users, Target, BarChart3, Bell,
  Globe, Truck, Shield, Calendar
} from 'lucide-react';

const UnifiedDashboard = ({ viewMode, shellContext }) => {
  const isDarkMode = shellContext?.isDarkMode || false;
  
  // Simple placeholder widget component
  const Widget = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      green: isDarkMode ? 'text-green-400' : 'text-green-600',
      purple: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      orange: isDarkMode ? 'text-orange-400' : 'text-orange-600',
      red: isDarkMode ? 'text-red-400' : 'text-red-600',
    };
    
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
        </div>
      </div>
    );
  };
  
  // Customer widgets
  const customerWidgets = [
    { icon: Package, title: 'Active Quotes', value: '24', subtitle: '3 pending', color: 'blue' },
    { icon: Clock, title: 'Recent Quotes', value: '156', subtitle: 'This month', color: 'purple' },
    { icon: Globe, title: 'Saved Routes', value: '12', subtitle: '5 international', color: 'green' },
    { icon: DollarSign, title: 'Total Spend', value: '$45.2K', subtitle: 'MTD', color: 'orange' },
    { icon: Truck, title: 'Shipments', value: '89', subtitle: 'This quarter', color: 'blue' },
    { icon: Shield, title: 'Insurance Claims', value: '2', subtitle: '1 pending', color: 'red' },
  ];
  
  // Agent widgets
  const agentWidgets = [
    { icon: TrendingUp, title: 'Quote Pipeline', value: '45', subtitle: '12 new today', color: 'blue' },
    { icon: DollarSign, title: 'Revenue', value: '$125K', subtitle: 'This month', color: 'green' },
    { icon: Users, title: 'Active Customers', value: '38', subtitle: '5 new', color: 'purple' },
    { icon: Target, title: 'Conversion Rate', value: '68%', subtitle: '+5% vs last month', color: 'orange' },
    { icon: BarChart3, title: 'Avg Quote Value', value: '$3,450', subtitle: 'Per shipment', color: 'blue' },
    { icon: Bell, title: 'Pending Tasks', value: '7', subtitle: '3 urgent', color: 'red' },
  ];
  
  const widgets = viewMode === 'customer' ? customerWidgets : agentWidgets;
  
  return (
    <div className="p-6">
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Dashboard Overview
      </h2>
      
      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {widgets.map((widget, index) => (
          <Widget key={index} {...widget} />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {viewMode === 'customer' ? (
            <>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <Package className="h-6 w-6 mb-2 mx-auto text-blue-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  New Quote
                </p>
              </button>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <Clock className="h-6 w-6 mb-2 mx-auto text-purple-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Track Shipment
                </p>
              </button>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <Globe className="h-6 w-6 mb-2 mx-auto text-green-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Saved Routes
                </p>
              </button>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <Calendar className="h-6 w-6 mb-2 mx-auto text-orange-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Schedule Pickup
                </p>
              </button>
            </>
          ) : (
            <>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <Package className="h-6 w-6 mb-2 mx-auto text-blue-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Quote
                </p>
              </button>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <Users className="h-6 w-6 mb-2 mx-auto text-purple-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  View Pipeline
                </p>
              </button>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <BarChart3 className="h-6 w-6 mb-2 mx-auto text-green-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analytics
                </p>
              </button>
              <button className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <DollarSign className="h-6 w-6 mb-2 mx-auto text-orange-600" />
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Commission
                </p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
