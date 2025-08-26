import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';

const CargoSection = ({ cargo, onChange, isDarkMode, error, units = 'imperial' }) => {
  const isMetric = units === 'metric';
  
  // Labels based on unit system
  const weightLabel = isMetric ? 'Weight (kg)' : 'Weight (lbs)';
  const lengthLabel = isMetric ? 'Length (cm)' : 'Length (in)';
  const widthLabel = isMetric ? 'Width (cm)' : 'Width (in)';
  const heightLabel = isMetric ? 'Height (cm)' : 'Height (in)';

  // Conversion functions for display
  const convertWeight = (value, toMetric) => {
    if (!value || value === 0) return 0;
    return toMetric ? value * 0.453592 : value / 0.453592;
  };

  const convertDimension = (value, toMetric) => {
    if (!value || value === 0) return 0;
    return toMetric ? value * 2.54 : value / 2.54;
  };

  // Calculate totals based on current unit system
  const calculateTotals = () => {
    const totals = cargo.pieces.reduce((acc, piece) => {
      const quantity = Number(piece.quantity) || 0;
      const weight = Number(piece.weight) || 0;
      
      acc.pieces += quantity;
      acc.weight += weight * quantity;
      
      return acc;
    }, { pieces: 0, weight: 0 });

    // If in metric, also show imperial conversion
    if (isMetric) {
      const weightInLbs = convertWeight(totals.weight, false);
      return {
        ...totals,
        weightDisplay: `${totals.weight.toFixed(2)} kg (≈ ${weightInLbs.toFixed(2)} lbs)`,
      };
    } else {
      const weightInKg = convertWeight(totals.weight, true);
      return {
        ...totals,
        weightDisplay: `${totals.weight.toFixed(2)} lbs (≈ ${weightInKg.toFixed(2)} kg)`,
      };
    }
  };

  const totals = calculateTotals();

  const addPiece = () => {
    const newPiece = {
      id: Date.now(),
      quantity: 1,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      commodity: '',
      stackable: true
    };
    onChange({
      ...cargo,
      pieces: [...cargo.pieces, newPiece]
    });
  };

  const removePiece = (id) => {
    onChange({
      ...cargo,
      pieces: cargo.pieces.filter(p => p.id !== id)
    });
  };

  const updatePiece = (id, field, value) => {
    onChange({
      ...cargo,
      pieces: cargo.pieces.map(piece =>
        piece.id === id ? { ...piece, [field]: value } : piece
      )
    });
  };

  const toggleAllStackable = (checked) => {
    onChange({
      ...cargo,
      pieces: cargo.pieces.map(piece => ({ ...piece, stackable: checked }))
    });
  };

  const allStackable = cargo.pieces.every(p => p.stackable);

  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-conship-purple'}`} />
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cargo Details
          </h3>
        </div>
        <button
          onClick={addPiece}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
            isDarkMode
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-conship-purple text-white hover:bg-purple-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Piece
        </button>
      </div>

      {error && (
        <div className={`mb-4 p-2 rounded ${
          isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
        }`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* All Stackable Checkbox */}
      <div className="mb-4">
        <label className={`flex items-center gap-2 cursor-pointer ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <input
            type="checkbox"
            checked={allStackable}
            onChange={(e) => toggleAllStackable(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">All cargo is stackable</span>
        </label>
      </div>

      {/* Pieces */}
      <div className="space-y-4">
        {cargo.pieces.map((piece, index) => (
          <div
            key={piece.id}
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Piece {index + 1}
              </h4>
              {cargo.pieces.length > 1 && (
                <button
                  onClick={() => removePiece(piece.id)}
                  className={`p-1 rounded hover:bg-red-100 ${
                    isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Quantity */}
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={piece.quantity}
                  onChange={(e) => updatePiece(piece.id, 'quantity', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              {/* Weight */}
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {weightLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={piece.weight}
                  onChange={(e) => updatePiece(piece.id, 'weight', e.target.value)}
                  placeholder={isMetric ? "0.00 kg" : "0.00 lbs"}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                {piece.weight > 0 && (
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ≈ {isMetric 
                      ? `${convertWeight(piece.weight, false).toFixed(2)} lbs`
                      : `${convertWeight(piece.weight, true).toFixed(2)} kg`
                    }
                  </p>
                )}
              </div>

              {/* Length */}
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {lengthLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={piece.length}
                  onChange={(e) => updatePiece(piece.id, 'length', e.target.value)}
                  placeholder={isMetric ? "0.00 cm" : "0.00 in"}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              {/* Width */}
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {widthLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={piece.width}
                  onChange={(e) => updatePiece(piece.id, 'width', e.target.value)}
                  placeholder={isMetric ? "0.00 cm" : "0.00 in"}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              {/* Height */}
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {heightLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={piece.height}
                  onChange={(e) => updatePiece(piece.id, 'height', e.target.value)}
                  placeholder={isMetric ? "0.00 cm" : "0.00 in"}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              {/* Cargo Type */}
              <div>
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Cargo Type
                </label>
                <select
                  value={piece.cargoType || 'General'}
                  onChange={(e) => updatePiece(piece.id, 'cargoType', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <option value="General">General</option>
                  <option value="Dangerous Goods">Dangerous Goods</option>
                  <option value="Perishable">Perishable</option>
                  <option value="Valuable">Valuable</option>
                  <option value="Live Animals">Live Animals</option>
                </select>
              </div>

              {/* Commodity */}
              <div className="md:col-span-3">
                <label className={`block text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Commodity
                </label>
                <select
                  value={piece.commodity}
                  onChange={(e) => updatePiece(piece.id, 'commodity', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <option value="">Select commodity...</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="machinery">Machinery</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="food">Food Products</option>
                  <option value="pharmaceuticals">Pharmaceuticals</option>
                  <option value="automotive">Automotive Parts</option>
                  <option value="raw-materials">Raw Materials</option>
                  <option value="consumer-goods">Consumer Goods</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Volume display for this piece */}
            {piece.length > 0 && piece.width > 0 && piece.height > 0 && (
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Volume: {isMetric 
                  ? `${((piece.length * piece.width * piece.height) / 1000000).toFixed(3)} m³`
                  : `${((piece.length * piece.width * piece.height) / 1728).toFixed(3)} ft³`
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className={`mt-4 pt-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Pieces: {totals.pieces}
          </span>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Total Weight: {totals.weightDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CargoSection;
