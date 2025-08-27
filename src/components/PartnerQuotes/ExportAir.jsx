// In ExportAir.jsx, update the handleSubmit function with debug logs:

const handleSubmit = async () => {
  console.log('=== SUBMIT CLICKED ===');
  console.log('Form data:', formData);
  
  const isValid = await validateForm();
  if (!isValid) {
    console.log('Form validation failed');
    return;
  }

  // Convert dimensions to include both units
  const convertedCargo = {
    ...formData.cargo,
    pieces: convertDimensions(formData.cargo, formData.units)
  };

  // Check cargo type for routing
  if (formData.cargoType === 'batteries') {
    console.log('Navigating to battery details...');
    localStorage.setItem('tempQuoteData', JSON.stringify({
      ...formData,
      cargo: convertedCargo,
      aircraftType: formData.aircraftType
    }));
    
    navigate('/quotes/battery-details', {
      state: {
        quoteData: { ...formData, cargo: convertedCargo },
        aircraftType: formData.aircraftType
      }
    });
    return;
  }
  
  if (formData.cargoType === 'dangerous_goods') {
    console.log('Navigating to dangerous goods...');
    localStorage.setItem('tempQuoteData', JSON.stringify({
      ...formData,
      cargo: convertedCargo,
      aircraftType: formData.aircraftType
    }));
    
    navigate('/quotes/dangerous-goods', {
      state: {
        quoteData: { ...formData, cargo: convertedCargo },
        aircraftType: formData.aircraftType
      }
    });
    return;
  }

  // General cargo - go directly to success
  console.log('General cargo - going to success page');
  setLoading(true);
  
  try {
    // Mock response for Phase 1 - General cargo
    const mockResponse = {
      success: true,
      data: {
        requestNumber: `REQ-2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        quoteNumber: `Q-2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Mock response:', mockResponse);

    if (mockResponse.success) {
      const { totalPieces, displayWeight } = getTotals(formData.cargo.pieces, formData.units);
      
      const navigationState = {
        requestNumber: mockResponse.data.requestNumber,
        quoteNumber: mockResponse.data.quoteNumber,
        origin: formData.originAirport,
        destination: formData.destinationAirport,
        pieces: totalPieces,
        weight: displayWeight,
        incoterm: formData.incoterm,
        pickupZip: formData.pickupZip,
        aircraftType: formData.aircraftType,
        cargoType: formData.cargoType,
        insurance: formData.insurance,
        hasBatteries: false,
        hasDG: false
      };
      
      console.log('Navigating to success with state:', navigationState);
      
      // Clean up localStorage
      localStorage.removeItem('tempQuoteData');
      
      // Navigate to success page
      navigate('/quotes/success', {
        state: navigationState
      });
      
      console.log('Navigation called to /quotes/success');
    }
  } catch (error) {
    console.error('Submit error:', error);
    setErrors({ 
      submit: 'Failed to submit quote. Please try again.' 
    });
  } finally {
    setLoading(false);
  }
};
