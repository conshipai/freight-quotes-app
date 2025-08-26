// src/components/shared/CargoSection.jsx
import React, { useMemo } from 'react';
import { Plus, X, Package } from 'lucide-react';

const CARGO_TYPES = ['General', 'Batteries', 'Dangerous Goods'];
const COMMODITY_OPTIONS = [
  'Automotive Parts',
  'Machinery',
  'Spare Parts',
  'Electrical Equipment',
  'Consolidated Cargo',
  'Aerospace',
  'Food',
  'Ship Spares',
  'Other products',
];

// Unit conversion helpers
const convertWeight = (value, fromUnit, toUnit) => {
  if (!value || value === 0) return 0;
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'lbs' && toUnit === 'kg') return value * 0.453592;
  if (fromUnit === 'kg' && toUnit === 'lbs') return value * 2.20462;
  return value;
};

const convertDimension = (value, fromUnit, toUnit) => {
  if (!value || value === 0) return 0;
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'inches' && toUnit === 'cm') return value * 2.54;
  if (fromUnit === 'cm' && toUnit === 'inches') return value / 2.54;
  return value;
};

const CargoSection = ({
  cargo,
  onChange,
  isDarkMode,
  error,
  unitSystem = 'imperial',
}) => {
  const isImperial = unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const dimensionUnit = isImperial ? 'in' : 'cm';

  const addPiece = () => {
    const newPiece = {
      id: Date.now(),
      quantity: 1,
      weight: 0,
      weightKg: 0,
      length: 0,
      width: 0,
      height: 0,
      lengthCm: 0,
      widthCm: 0,
      heightCm: 0,
      commodity: '',
      cargoType: 'General',
      stackable: true,
    };
    onChange({
      ...cargo,
      pieces: [...cargo.pieces, newPiece],
    });
  };

  const removePiece = (id) => {
    onChange({
      ...cargo,
      pieces: cargo.pieces.filter((p) => p.id !== id),
    });
  };

  const updatePiece = (id, field, value) => {
    const numericFields = ['quantity', 'weight', 'weightKg', 'length', 'width', 'height', 'lengthCm', 'widthCm', 'heightCm'];
    const processedValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;

    onChange({
      ...cargo,
      pieces: cargo.pieces.map((p) => {
        if (p.id !== id) return p;
        
        let updates = { [field]: processedValue };

        // Handle weight conversions
        if (field === 'weight' && processedValue > 0) {
          updates.weightKg = convertWeight(processedValue, 'lbs', 'kg');
        } else if (field === 'weightKg' && processedValue > 0) {
          updates.weight = convertWeight(processedValue, 'kg', 'lbs');
        }

        // Handle dimension conversions
        if (['length', 'width', 'height'].includes(field) && processedValue > 0) {
          const cmField = field + 'Cm';
          updates[cmField] = convertDimension(processedValue, 'inches', 'cm');
        } else if (['lengthCm', 'widthCm', 'heightCm'].includes(field) && processedValue > 0) {
          const inField = field.replace('Cm', '');
          updates[inField] = convertDimension(processedValue, 'cm', 'inches');
        }

        return { ...p, ...updates };
      }),
    });
  };

  const handleStackableChange = (value) => {
    onChange({
      ...cargo,
      pieces: cargo.pieces.map((p) => ({ ...p, stackable: value })),
    });
  };

  // Calculate totals
  const totalPieces = cargo.pieces.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalWeightLbs = cargo.pieces.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 0)), 0);
  const totalWeightKg = cargo.pieces.reduce((sum, p) => sum + ((p.weightKg || 0) * (p.quantity || 0)), 0);

  return (
    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Package className="w-5 h-5" />
          Cargo Details
        </h3>
        <button
          type="button"
          onClick={addPiece}
          className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${
            isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Piece
        </button>
      </div>

      {/* Stackable checkbox for all cargo */}
      <div className="mb-4">
        <label className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <input
            type="checkbox"
            checked={cargo.pieces[0]?.stackable ?? true}
            onChange={(e) => handleStackableChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">All cargo is stackable</span>
        </label>
      </div>

      {error && <div className="mb-3 text-red-500 text-sm">{error}</div>}

      {cargo.pieces.map((piece, index) => (
        <div
          key={piece.id}
          className={`mb-4 p-3 rounded border ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Piece {index + 1}
            </h4>
            {cargo.pieces.length > 1 && (
              <button
                type="button"
                onClick={() => removePiece(piece.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Quantity
              </label>
              <input
                type="number"
                value={piece.quantity || ''}
                onChange={(e) => updatePiece(piece.id, 'quantity', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Weight ({weightUnit})
              </label>
              <input
                type="number"
                value={isImperial ? (piece.weight || '') : (piece.weightKg || '')}
                onChange={(e) => updatePiece(piece.id, isImperial ? 'weight' : 'weightKg', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              {(isImperial ? piece.weightKg : piece.weight) > 0 && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ≈ {(isImperial ? piece.weightKg : piece.weight).toFixed(1)} {isImperial ? 'kg' : 'lbs'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Length ({dimensionUnit})
              </label>
              <input
                type="number"
                value={isImperial ? (piece.length || '') : (piece.lengthCm || '')}
                onChange={(e) => updatePiece(piece.id, isImperial ? 'length' : 'lengthCm', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Width ({dimensionUnit})
              </label>
              <input
                type="number"
                value={isImperial ? (piece.width || '') : (piece.widthCm || '')}
                onChange={(e) => updatePiece(piece.id, isImperial ? 'width' : 'widthCm', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Height ({dimensionUnit})
              </label>
              <input
                type="number"
                value={isImperial ? (piece.height || '') : (piece.heightCm || '')}
                onChange={(e) => updatePiece(piece.id, isImperial ? 'height' : 'heightCm', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Cargo Type
              </label>
              <select
                value={piece.cargoType || 'General'}
                onChange={(e) => updatePiece(piece.id, 'cargoType', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                {CARGO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Commodity
              </label>
              <select
                value={piece.commodity}
                onChange={(e) => updatePiece(piece.id, 'commodity', e.target.value)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Select commodity...</option>
                {COMMODITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dimension conversions display */}
          {['length', 'width', 'height'].some((dim) => 
            (isImperial ? piece[dim] : piece[dim + 'Cm']) > 0
          ) && (
            <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Dimensions in {isImperial ? 'cm' : 'inches'}:{' '}
              {isImperial
                ? `${(piece.lengthCm || 0).toFixed(1)} × ${(piece.widthCm || 0).toFixed(1)} × ${(piece.heightCm || 0).toFixed(1)} cm`
                : `${(piece.length || 0).toFixed(1)} × ${(piece.width || 0).toFixed(1)} × ${(piece.height || 0).toFixed(1)} in`}
            </div>
          )}
        </div>
      ))}

      {/* Totals */}
      <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
        <div className="text-right space-y-1">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Total Pieces: <strong>{totalPieces}</strong>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Total Weight:{' '}
            <strong>
              {isImperial
                ? `${totalWeightLbs.toFixed(2)} lbs`
                : `${totalWeightKg.toFixed(2)} kg`}
            </strong>{' '}
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ({isImperial
                ? `≈ ${totalWeightKg.toFixed(2)} kg`
                : `≈ ${totalWeightLbs.toFixed(2)} lbs`})
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CargoSection;
