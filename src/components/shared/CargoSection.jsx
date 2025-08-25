import React from 'react';
import { Plus, X, Package } from 'lucide-react';

const CargoSection = ({ cargo, onChange, isDarkMode, error }) => {
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
      pieces: cargo.pieces.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

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

      {error && (
        <div className="mb-3 text-red-500 text-sm">{error}</div>
      )}

      {cargo.pieces.map((piece, index) => (
        <div key={piece.id} className={`mb-4 p-3 rounded border ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
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
                value={piece.quantity}
                onChange={(e) => updatePiece(piece.id, 'quantity', parseInt(e.target.value) || 0)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Weight (lbs)
              </label>
              <input
                type="number"
                value={piece.weight}
                onChange={(e) => updatePiece(piece.id, 'weight', parseFloat(e.target.value) || 0)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Length (in)
              </label>
              <input
                type="number"
                value={piece.length}
                onChange={(e) => updatePiece(piece.id, 'length', parseFloat(e.target.value) || 0)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Width (in)
              </label>
              <input
                type="number"
                value={piece.width}
                onChange={(e) => updatePiece(piece.id, 'width', parseFloat(e.target.value) || 0)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Height (in)
              </label>
              <input
                type="number"
                value={piece.height}
                onChange={(e) => updatePiece(piece.id, 'height', parseFloat(e.target.value) || 0)}
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Commodity
              </label>
              <input
                type="text"
                value={piece.commodity}
                onChange={(e) => updatePiece(piece.id, 'commodity', e.target.value)}
                placeholder="Description"
                className={`w-full px-2 py-1 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CargoSection;
