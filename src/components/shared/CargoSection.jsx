// src/components/quotes/QuoteGenerator/CargoSection.jsx
import React from 'react';
import { useQuote } from '../../../contexts/QuoteContext';
import { useTheme } from '../../../contexts/ThemeContext';
import CargoItem from './CargoItem';
import { Plus, AlertCircle } from 'lucide-react';

export default function CargoSection({ error }) {
  const {
    currentQuote,
    addCargoPiece,
    removeCargoPiece,
    updateCargoPiece,
    updateQuote,
    convertUnits
  } = useQuote();
  const { isDarkMode } = useTheme();

  // Determine Imperial vs Metric display
  const unitSystem = currentQuote.units.weight === 'lbs' ? 'imperial' : 'metric';

  // Totals
  const totalPieces = currentQuote.cargo.pieces.reduce((sum, p) => sum + p.quantity, 0);
  const totalWeightLbs = currentQuote.cargo.pieces.reduce((sum, p) => sum + p.weight * p.quantity, 0);
  const totalWeightKg = convertUnits(totalWeightLbs, 'lbs', 'kg');

  const onChangePiece = (index, patch) => {
    updateCargoPiece(index, patch);
  };

  return (
    <div className={`shadow rounded-lg p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Cargo Details
        </h2>
        <button
          type="button"
          onClick={addCargoPiece}
          className="flex items-center text-blue-600 hover:underline"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Piece
        </button>
      </div>

      <div className="mb-4">
        <label className={`inline-flex items-center text-sm space-x-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={currentQuote.cargo.stackable ?? true}
            onChange={(e) => updateQuote({ cargo: { ...currentQuote.cargo, stackable: e.target.checked } })}
          />
          <span>All cargo is stackable</span>
        </label>
      </div>

      {error && (
        <div className="mb-4 text-red-600 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {/* Render each piece */}
      {currentQuote.cargo.pieces.map((piece, idx) => (
        <CargoItem
          key={piece.id}
          piece={piece}
          index={idx}
          onChange={(patch) => onChangePiece(idx, patch)}
          onRemove={() => removeCargoPiece(piece.id)}
          canRemove={currentQuote.cargo.pieces.length > 1}
          unitSystem={unitSystem}
        />
      ))}

      {/* Totals */}
      <div className={`mt-6 border-t pt-4 text-right space-y-1 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          Total Pieces: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {totalPieces}
          </strong>
        </p>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          Total Weight:{' '}
          <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {unitSystem === 'imperial'
              ? `${totalWeightLbs.toFixed(2)} lbs`
              : `${totalWeightKg.toFixed(2)} kg`}
          </strong>{' '}
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            ({unitSystem === 'imperial'
              ? `≈ ${totalWeightKg.toFixed(2)} kg`
              : `≈ ${totalWeightLbs.toFixed(2)} lbs`})
          </span>
        </p>
      </div>
    </div>
  );
}
