// src/components/PartnerQuotes/QuoteHistory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Clock, CheckCircle, AlertCircle, 
  Loader2, TrendingUp, ChevronRight, Calendar
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Progress Pill Component (reusable)
const ProgressPill = ({ label, status, details }) => {
  const getStatusIcon = () => {
    switch(status) {
      case 'complete':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'in-progress':
        return <Loader2 className="h-3 w-3 text-orange-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch(status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusClass()}`}>
      {getStatusIcon()}
      <span>{label}</span>
      {details && <span className="text-[10px] opacity-75">({details})</span>}
    </div>
  );
};

const QuoteHistory = ({ shellContext }) => {
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Load quotes on mount
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with API call
      const mockQuotes = [
        {
          id: 'Q-2024-10001',
          requestNumber: 'REQ-2024-10001',
          origin: 'LAX - Los Angeles',
          destination: 'LHR - London Heathrow',
          createdAt: new Date().toISOString(),
          status: 'ready',
          totalWeight: '100 kg',
          totalPieces: 2,
          carrierResponses: 5,
          maxCarriers: 5,
          progress: {
            origin: { status: 'complete', details: 'Pickup arranged' },
            airfreight: { status: 'complete', details: '5/5 carriers' },
            destination: { status: 'pending', details: null }
          },
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'Q-2024-10002',
          requestNumber: 'REQ-2024-10002',
          origin: 'JFK - New York',
          destination: 'NRT - Tokyo Narita',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'processing',
          totalWeight: '250 kg',
          totalPieces: 5,
          carrierResponses: 3,
          maxCarriers: 8,
          progress: {
            origin: { status: 'complete', details: 'Received' },
            airfreight: { status: 'in-progress', details: '3/8 carriers' },
            destination: { status: 'pending', details: null }
          },
          validUntil: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'Q-2024-10003',
          requestNumber: 'REQ-2024-10003',
          origin: 'ORD - Chicago',
          destination: 'FRA - Frankfurt',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending',
          totalWeight: '75 kg',
          totalPieces: 1,
          carrierResponses: 0,
          maxCarriers: 8,
          progress: {
            origin: { status: 'complete', details: 'Received' },
            airfreight: { status: 'pending', details: 'Awaiting carriers' },
            destination: { status: 'pending', details: null }
          },
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setQuotes(mockQuotes);
      
      // Real API call would be:
      // const response = await axios.get(`${API_URL}/quotes/history`);
      // setQuotes(response.data.quotes);
      
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let filtered = [...quotes];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.id.toLowerCase().includes(search) ||
        quote.origin.toLowerCase().includes(search) ||
        quote.destination.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(quote => {
        const created = new Date(quote.createdAt);
        const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
        
        switch(dateFilter) {
          case 'today':
            return daysDiff < 1;
          case 'week':
            return daysDiff < 7;
          case 'month':
            return daysDiff < 30;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [quotes, searchTerm, statusFilter, dateFilter, sortBy]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'ready':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading quotes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quote History
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track and manage your freight quotes
            </p>
          </div>
          <button
            onClick={() => navigate('/quotes/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Quote
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Quotes
            </p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {quotes.length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ready to Book
            </p>
            <p className={`text-2xl font-bold text-green-600`}>
              {quotes.filter(q => q.status === 'ready').length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Processing
            </p>
            <p className={`text-2xl font-bold text-orange-600`}>
              {quotes.filter(q => q.status === 'processing').length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Pending
            </p>
            <p className={`text-2xl font-bold text-yellow-600`}>
              {quotes.filter(q => q.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-3 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
            </select>
          </div>

          <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredQuotes.length} quotes found
          </div>
        </div>

        {/* Quote List */}
        {filteredQuotes.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className={`mt-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No quotes found
            </h3>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first quote to get started'}
            </p>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carriers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredQuotes.map((quote) => (
                    <tr 
                      key={quote.id}
                      className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                      onClick={() => navigate(`/quotes/details/${quote.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {quote.id}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div className="font-medium">{quote.origin}</div>
                          <div className="text-gray-400">↓</div>
                          <div>{quote.destination}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-medium">{quote.totalWeight}</span>
                          <span className="text-gray-500 ml-1">
                            / {quote.totalPieces} pcs
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <ProgressPill {...quote.progress.origin} label="Origin" />
                          <ProgressPill {...quote.progress.airfreight} label="Air" />
                          <ProgressPill {...quote.progress.destination} label="Dest" />
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {quote.carrierResponses}/{quote.maxCarriers}
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(quote.carrierResponses / quote.maxCarriers) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(quote.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quotes/details/${quote.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteHistory;
