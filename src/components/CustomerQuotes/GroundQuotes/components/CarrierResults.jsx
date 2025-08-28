// src/components/CustomerQuotes/GroundQuotes/components/CarrierResults.jsx
import React, { useState } from 'react';
import { 
  Truck, Clock, DollarSign, Shield, AlertTriangle, 
  ChevronDown, ChevronUp, Check, Info, Star 
} from 'lucide-react';

const CarrierResults = ({ rates, formData, onBack, onBook, isDarkMode }) => {
  const [expandedRate, setExpandedRate] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);

  // Group rates by carrier
  const groupedRates = rates.rates.reduce((acc, rate) => {
    if (!acc[rate.carrier]) {
      acc[rate.carrier] = [];
    }
    acc[rate.carrier].push(rate);
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectRate = (rate) => {
    setSelectedRate(rate);
    onBook(rate.carrier, rate);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Available Rates
        </h3>
        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          ← Back to Edit
        </button>
      </div>

      {/* Summary */}
      <div className={`mb-6 p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Route:</span>
            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formData.originZip} → {formData.destinationZip}
            </span>
          </div>
          <div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Pickup Date:</span>
            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(formData.pickupDate)}
            </span>
          </div>
          <div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Weight:</span>
            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formData.items.reduce((sum, item) => sum + (parseFloat(item.weight || 0) * parseInt(item.quantity || 1)), 0)} lbs
            </span>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {rates.errors && rates.errors.length > 0 && (
        <div className={`mb-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                Some carriers couldn't provide rates:
              </h4>
              <ul className="mt-2 space-y-1">
                {rates.errors.map((error, idx) => (
                  <li key={idx} className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {error.carrier}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Rates Display */}
      {rates.rates.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No rates available for this route.</p>
          <p className="text-sm mt-2">Please check your shipment details and try again.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedRates).map(([carrier, carrierRates]) => (
            <div key={carrier} className={`rounded-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {/* Carrier Header */}
              <div className={`px-4 py-3 border-b ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {carrierRates[0].carrierLogo && (
                      <img 
                        src={carrierRates[0].carrierLogo} 
                        alt={carrier}
                        className="h-8 w-auto"
                      />
                    )}
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {carrier}
                    </h4>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {carrierRates.length} option{carrierRates.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Carrier Rates */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {carrierRates.map((rate, idx) => (
                  <div key={`${carrier}-${idx}`} className={`p-4 ${
                    selectedRate === rate ? isDarkMode ? 'bg-green-900/20' : 'bg-green-50' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Service Type and Transit Time */}
                        <div className="flex items-center gap-4 mb-2">
                          <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {rate.service}
                            {rate.guaranteed && (
                              <Shield className="inline-block w-4 h-4 ml-2 text-green-600" />
                            )}
                          </h5>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {rate.transitDays} transit day{rate.transitDays !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {rate.guaranteedBy && (
                            <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Guaranteed by {rate.guaranteedBy}
                            </span>
                          )}
                        </div>

                        {/* Price Breakdown Toggle */}
                        <button
                          onClick={() => setExpandedRate(expandedRate === rate ? null : rate)}
                          className={`text-sm flex items-center gap-1 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {expandedRate === rate ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide breakdown
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show breakdown
                            </>
                          )}
                        </button>

                        {/* Expanded Price Breakdown */}
                        {expandedRate === rate && (
                          <div className={`mt-3 pt-3 border-t ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                          }`}>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  Base Rate:
                                </span>
                                <span>{formatCurrency(rate.rate.base)}</span>
                              </div>
                              {rate.rate.fuel > 0 && (
                                <div className="flex justify-between">
                                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Fuel Surcharge:
                                  </span>
                                  <span>{formatCurrency(rate.rate.fuel)}</span>
                                </div>
                              )}
                              {rate.rate.accessorials > 0 && (
                                <div className="flex justify-between">
                                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Accessorials:
                                  </span>
                                  <span>{formatCurrency(rate.rate.accessorials)}</span>
                                </div>
                              )}
                              {rate.rate.guaranteedCharge > 0 && (
                                <div className="flex justify-between">
                                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Guaranteed Service:
                                  </span>
                                  <span>{formatCurrency(rate.rate.guaranteedCharge)}</span>
                                </div>
                              )}
                              {rate.rate.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount:</span>
                                  <span>-{formatCurrency(rate.rate.discount)}</span>
                                </div>
                              )}
                              <div className={`flex justify-between pt-2 border-t font-medium ${
                                isDarkMode ? 'border-gray-700' : 'border-gray-200'
                              }`}>
                                <span>Total:</span>
                                <span>{formatCurrency(rate.rate.total)}</span>
                              </div>
                            </div>

                            {/* Additional Details */}
                            {rate.details?.notes?.length > 0 && (
                              <div className="mt-3">
                                <span className={`text-xs font-medium ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Notes:</span>
                                <ul className="mt-1 text-xs space-y-0.5">
                                  {rate.details.notes.map((note, i) => (
                                    <li key={i} className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                                      • {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {rate.quoteId && (
                              <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Quote ID: {rate.quoteId}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price and Select Button */}
                      <div className="ml-4 text-right">
                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(rate.rate.total)}
                        </div>
                        <button
                          onClick={() => handleSelectRate(rate)}
                          className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedRate === rate
                              ? 'bg-green-600 text-white'
                              : isDarkMode
                                ? 'bg-conship-orange text-white hover:bg-orange-600'
                                : 'bg-conship-purple text-white hover:bg-purple-800'
                          }`}
                        >
                          {selectedRate === rate ? (
                            <>
                              <Check className="inline w-4 h-4 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select Rate'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarrierResults;
