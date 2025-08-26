// src/services/dimensionConverter.js
export const convertDimensions = (cargo, fromUnit) => {
  const conversionRates = {
    weight: {
      imperialToMetric: 0.453592, // lbs to kg
      metricToImperial: 2.20462  // kg to lbs
    },
    length: {
      imperialToMetric: 2.54,     // inches to cm
      metricToImperial: 0.393701  // cm to inches
    }
  };

  return cargo.pieces.map(piece => {
    if (fromUnit === 'imperial') {
      return {
        ...piece,
        // Keep original imperial values
        weightLbs: piece.weight,
        lengthIn: piece.length,
        widthIn: piece.width,
        heightIn: piece.height,
        // Add metric conversions
        weightKg: piece.weight * conversionRates.weight.imperialToMetric,
        lengthCm: piece.length * conversionRates.length.imperialToMetric,
        widthCm: piece.width * conversionRates.length.imperialToMetric,
        heightCm: piece.height * conversionRates.length.imperialToMetric
      };
    } else {
      return {
        ...piece,
        // Keep original metric values
        weightKg: piece.weight,
        lengthCm: piece.length,
        widthCm: piece.width,
        heightCm: piece.height,
        // Add imperial conversions
        weightLbs: piece.weight * conversionRates.weight.metricToImperial,
        lengthIn: piece.length * conversionRates.length.metricToImperial,
        widthIn: piece.width * conversionRates.length.metricToImperial,
        heightIn: piece.height * conversionRates.length.metricToImperial
      };
    }
  });
};
