import React from 'react';

const IncotermSelector = ({ formData, onChange, isDarkMode }) => {
  const handleIncotermChange = (value) => {
    const carriers = value === 'EXW' ? ['freightforce', 'pelicargo'] : ['pelicargo'];
    
    onChange({
      incoterm: value,
      carriers,
      // When switching to EXW, origin airport will be auto-determined from ZIP
      originAirport: value === 'EXW' ? '' : formData.originAirport,
      // When switching to CPT, ZIP is irrelevant
      pickupZip: value === 'CPT' ? '' : formData.pickupZip,
    });
  };

  return (
    <div className="mb-6">
      <label className={`block text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Select Incoterm
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
          formData.incoterm === 'EXW'
            ? isDarkMode 
              ? 'border-conship-orange bg-orange-900/20'
              : 'border-conship-purple bg-purple-50'
            : isDarkMode
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="radio"
            name="incoterm"
            value="EXW"
            checked={formData.incoterm === 'EXW'}
            onChange={(e) => handleIncotermChange(e.target.value)}
            className="mt-1"
          />
          <div className="ml-3">
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              EXW - Ex Works (Door to Airport)
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Pickup from US door (ZIP code) to foreign airport
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-orange-400' : 'text-purple-600'}`}>
              Available carriers: Freightforce & Pelicargo
            </p>
          </div>
        </label>

        <label className={`flex items-start p-4 border rounded-lg cursor-pointer ${
          formData.incoterm === 'CPT'
            ? isDarkMode 
              ? 'border-conship-orange bg-orange-900/20'
              : 'border-conship-purple bg-purple-50'
            : isDarkMode
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="radio"
            name="incoterm"
            value="CPT"
            checked={formData.incoterm === 'CPT'}
            onChange={(e) => handleIncotermChange(e.target.value)}
            className="mt-1"
          />
          <div className="ml-3">
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              CPT - Carriage Paid To (Airport to Airport)
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              US airport to foreign airport
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-orange-400' : 'text-purple-600'}`}>
              Available carrier: Pelicargo only
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default IncotermSelector;
