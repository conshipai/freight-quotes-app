// src/components/PartnerQuotes/QuoteDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Mail, Copy, CheckCircle, Circle, Loader2,
  Plane, Package, Calendar, MapPin, DollarSign, Clock, AlertTriangle,
  Battery, Shield, ChevronDown, ChevronUp, Star, Zap, Truck
} from 'lucide-react';

// Progress Pill Component
const ProgressPill = ({ label, status, details }) => {
  const getStatusIcon = () => {
    switch(status) {
      case 'complete':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'in-progress':
        return <Loader2 className="h-3 w-3 text-orange-600 animate-spin" />;
      case 'pending':
        return <Circle className="h-3 w-3 text-gray-400" />;
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
    <div className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusClass()}`}>
      {getStatusIcon()}
      <span>{label}</span>
      {details && <span className="text-xs opacity-75">({details})</span>}
    </div>
  );
};

const QuoteDetails = ({ shellContext }) => {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const isDarkMode = shellContext?.isDarkMode;
  
  const [loading, setLoading] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [rateType, setRateType] = useState('general'); // 'general' or 'express'
  const [expandedSections, setExpandedSections] = useState({
    cargo: true,
    rates: true,
    special: false,
    documents: false
  });
  const [expandedRate, setExpandedRate] = useState(null); // For showing rate breakdown

  // Mock quote data with both General and Express rates
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const loadQuoteDetails = async () => {
      setLoading(true);
      
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockQuote = {
          id: quoteId,
          quoteNumber: `Q-2024-${quoteId}`,
          requestNumber: `REQ-2024-${quoteId}`,
          status: 'ready',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          
          // Customer
          customer: {
            name: 'John Smith',
            email: 'john.smith@company.com',
            phone: '+1 (555) 123-4567',
            company: 'ABC Trading Co.'
          },
          
          // Route
          origin: {
            airport: 'LAX',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            pickupZip: '90045'
          },
          destination: {
            airport: 'NRT',
            city: 'Tokyo',
            country: 'Japan'
          },
          
          // Service
          incoterm: 'EXW',
          serviceType: 'export-air',
          aircraftType: 'passenger',
          
          // Cargo
          cargo: {
            totalPieces: 5,
            totalWeight: 250,
            totalVolume: 2.5,
            pieces: [
              {
                id: 1,
                description: 'Electronic Components',
                quantity: 3,
                weight: 50,
                length: 48,
                width: 40,
                height: 36,
                stackable: true
              },
              {
                id: 2,
                description: 'Industrial Equipment',
                quantity: 2,
                weight: 100,
                length: 60,
                width: 48,
                height: 48,
                stackable: false
              }
            ]
          },
          
          // Progress
          progress: {
            origin: { status: 'complete', details: 'Pickup arranged' },
            airfreight: { status: 'in-progress', details: '5/8 carriers' },
            destination: { status: 'pending', details: null },
            customs: { status: 'pending', details: null }
          },
          
          // Carrier quotes with General and Express rates
          carrierQuotes: [
            {
              id: 1,
              carrier: 'American Airlines',
              logo: '🛩️',
              routing: 'LAX → DFW → NRT',
              transitTime: { general: 3, express: 2 },
              space: 'Confirmed',
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              rates: {
                general: {
                  ground: 450,
                  air: 2850,
                  fees: 125,
                  total: 3425,
                  features: ['Standard Service', 'Economy Routing']
                },
                express: {
                  ground: 550,
                  air: 3650,
                  fees: 175,
                  total: 4375,
                  features: ['Priority Service', 'Direct Flight', 'Guaranteed Space']
                }
              }
            },
            {
              id: 2,
              carrier: 'United Airlines',
              logo: '✈️',
              routing: 'LAX → SFO → NRT',
              transitTime: { general: 4, express: 2 },
              space: 'Confirmed',
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              rates: {
                general: {
                  ground: 425,
                  air: 2750,
                  fees: 115,
                  total: 3290,
                  features: ['Standard Service']
                },
                express: {
                  ground: 525,
                  air: 3450,
                  fees: 165,
                  total: 4140,
                  features: ['Express Service', 'Priority Handling']
                }
              }
            },
            {
              id: 3,
              carrier: 'Delta Airlines',
              logo: '🛫',
              routing: 'LAX → SEA → NRT',
              transitTime: { general: 3, express: 2 },
              space: 'Waitlisted',
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              rates: {
                general: {
                  ground: 475,
                  air: 2950,
                  fees: 135,
                  total: 3560,
                  features: ['Standard Service', 'Flexible Booking']
                },
                express: {
                  ground: 575,
                  air: 3750,
                  fees: 185,
                  total: 4510,
                  features: ['Priority Service', 'Guaranteed Space', 'First Available']
                }
              }
            }
          ],
          
          // Insurance
          insurance: {
            requested: true,
            value: 25000,
            commodity: 'Electronic Components'
          },
          
          // Special handling
          hasBatteries: true,
          batteryDetails: {
            type: 'Lithium Ion',
            packingInstruction: 'PI967',
            unNumber: 'UN3481',
            class: '9',
            section: 'II'
          }
        };
        
        setQuote(mockQuote);
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading quote:', error);
        setLoading(false);
      }
    };

    if (quoteId) {
      loadQuoteDetails();
    }
  }, [quoteId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleRateBreakdown = (carrierId) => {
    setExpandedRate(expandedRate === carrierId ? null : carrierId);
  };

  const handleSelectCarrier = (carrier) => {
    setSelectedCarrier({
      ...carrier,
      selectedRate: rateType,
      rate: carrier.rates[rateType]
    });
  };

const handleBookNow = () => {
  if (selectedCarrier && quote) {
    navigate('/quotes/booking-success', {
      state: {
        quote: quote,
        selectedCarrier: selectedCarrier,
        rateType: rateType,
        pickupDate: '2025-01-20',  // You can make these dynamic later
        deliveryDate: '2025-01-25'  // You can make these dynamic later
      }
    });
  }
};

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Quote not found</p>
          <button
            onClick={() => navigate('/quotes/history')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/quotes/history')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quote.quoteNumber}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Request #{quote.requestNumber} • Created {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => console.log('Email')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <Mail className="h-5 w-5" />
              </button>
              <button
                onClick={() => console.log('Download')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/quotes/export-air', { state: { duplicateFrom: quote }})}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={handleBookNow}
                disabled={!selectedCarrier}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedCarrier
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Book Now
              </button>
            </div>
          </div>
          
          {/* Progress Pills */}
          <div className="mt-4 flex gap-2">
            <ProgressPill {...quote.progress.origin} label="Origin" />
            <ProgressPill {...quote.progress.airfreight} label="Airfreight" />
            <ProgressPill {...quote.progress.destination} label="Destination" />
            <ProgressPill {...quote.progress.customs} label="Customs" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quote Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Summary */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Route Information
                </h2>
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Origin
                  </p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.origin.airport} - {quote.origin.city}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quote.origin.state}, {quote.origin.country}
                  </p>
                  {quote.origin.pickupZip && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Pickup ZIP: {quote.origin.pickupZip}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Destination
                  </p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.destination.airport} - {quote.destination.city}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quote.destination.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Carrier Rates Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-3" />
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Carrier Rates ({quote.carrierQuotes.length} responses)
                    </h2>
                  </div>
                  
                  {/* General/Express Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setRateType('general')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        rateType === 'general'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Truck className="inline h-4 w-4 mr-1" />
                      General
                    </button>
                    <button
                      onClick={() => setRateType('express')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        rateType === 'express'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Zap className="inline h-4 w-4 mr-1" />
                      Express
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6 pt-4">
                <div className="space-y-3">
                  {quote.carrierQuotes.map((carrier) => (
                    <div
                      key={carrier.id}
                      className={`rounded-lg border-2 transition-all ${
                        selectedCarrier?.id === carrier.id && selectedCarrier?.selectedRate === rateType
                          ? 'border-blue-500 bg-blue-50'
                          : isDarkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Main Carrier Row */}
                      <div
                        onClick={() => handleSelectCarrier(carrier)}
                        className="p-4 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{carrier.logo}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {carrier.carrier}
                                </p>
                                {rateType === 'express' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                    <Zap className="h-3 w-3 mr-0.5" />
                                    Express
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {carrier.routing}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Clock className="inline h-4 w-4 mr-1" />
                                  {carrier.transitTime[rateType]} days
                                </span>
                                <span className={`text-sm ${
                                  carrier.space === 'Confirmed' ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {carrier.space}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                {carrier.rates[rateType].features.map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      isDarkMode
                                        ? 'bg-gray-700 text-gray-300'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${
                              selectedCarrier?.id === carrier.id && selectedCarrier?.selectedRate === rateType
                                ? 'text-blue-600'
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              ${carrier.rates[rateType].total.toLocaleString()}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRateBreakdown(carrier.id);
                              }}
                              className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                            >
                              {expandedRate === carrier.id ? 'Hide' : 'Show'} breakdown
                              {expandedRate === carrier.id ? <ChevronUp className="inline h-3 w-3 ml-1" /> : <ChevronDown className="inline h-3 w-3 ml-1" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Rate Breakdown */}
                      {expandedRate === carrier.id && (
                        <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="pt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Ground Transportation:
                              </span>
                              <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${carrier.rates[rateType].ground.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Air Freight:
                              </span>
                              <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${carrier.rates[rateType].air.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Fees & Surcharges:
                              </span>
                              <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${carrier.rates[rateType].fees.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Total {rateType === 'express' ? 'Express' : 'General'} Rate:
                              </span>
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${carrier.rates[rateType].total.toLocaleString()} USD
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cargo Details */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <button
                onClick={() => toggleSection('cargo')}
                className={`w-full px-6 py-4 flex items-center justify-between ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-3" />
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Cargo Details
                  </h2>
                </div>
                {expandedSections.cargo ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {expandedSections.cargo && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Pieces
                      </p>
                      <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {quote.cargo.totalPieces}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Weight
                      </p>
                      <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {quote.cargo.totalWeight} kg
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Volume
                      </p>
                      <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {quote.cargo.totalVolume} m³
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {quote.cargo.pieces.map((piece, idx) => (
                      <div
                        key={piece.id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Piece {idx + 1}: {piece.description}
                          </p>
                          {piece.stackable && (
                            <span className="text-green-600 text-sm">✓ Stackable</span>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Qty:</span>
                            <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {piece.quantity}
                            </span>
                          </div>
                          <div>
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Weight:</span>
                            <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {piece.weight} kg
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Dims:</span>
                            <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {piece.length}×{piece.width}×{piece.height} cm
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Special Handling (if applicable) */}
            {quote.hasBatteries && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                <button
                  onClick={() => toggleSection('special')}
                  className={`w-full px-6 py-4 flex items-center justify-between ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Special Handling Requirements
                    </h2>
                  </div>
                  {expandedSections.special ? <ChevronUp /> : <ChevronDown />}
                </button>
                
                {expandedSections.special && (
                  <div className="px-6 pb-6">
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                    } border`}>
                      <div className="flex items-center mb-3">
                        <Battery className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className={`font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          Lithium Battery Shipment
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Battery Type:</span>
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quote.batteryDetails.type}
                          </span>
                        </div>
                        <div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Packing Instruction:</span>
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quote.batteryDetails.packingInstruction}
                          </span>
                        </div>
                        <div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>UN Number:</span>
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quote.batteryDetails.unNumber}
                          </span>
                        </div>
                        <div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Class:</span>
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quote.batteryDetails.class} / Section {quote.batteryDetails.section}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Company</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.customer.company}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Contact</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.customer.name}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.customer.email}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Service Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Service Type</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Export Air
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Incoterm</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.incoterm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Aircraft Type</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.aircraftType === 'cargo-only' ? 'Cargo Only' : 'Passenger'}
                  </span>
                </div>
                {quote.insurance.requested && (
                  <>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Insurance</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${quote.insurance.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Commodity</span>
                      <span className={`font-medium text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {quote.insurance.commodity}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Valid Until</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Rate Summary */}
            {selectedCarrier && (
              <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-lg border-2 p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Selected Rate
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Carrier</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCarrier.carrier}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Service Level</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {rateType === 'express' ? 'Express Service' : 'General Service'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Total Rate</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedCarrier.rate.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Ground:</span>
                      <span>${selectedCarrier.rate.ground.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Air:</span>
                      <span>${selectedCarrier.rate.air.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Fees:</span>
                      <span>${selectedCarrier.rate.fees.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  disabled={!selectedCarrier}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedCarrier
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedCarrier ? `Book ${selectedCarrier.carrier} - ${rateType === 'express' ? 'Express' : 'General'}` : 'Select a Carrier'}
                </button>
                <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  <Download className="inline h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Quote
                </button>
                <button 
                  onClick={() => navigate('/quotes/export-air', { state: { duplicateFrom: quote }})}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  <Copy className="inline h-4 w-4 mr-2" />
                  Duplicate Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetails;
