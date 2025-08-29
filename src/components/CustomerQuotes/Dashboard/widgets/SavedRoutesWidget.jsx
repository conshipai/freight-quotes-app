import React from 'react';

const SavedRoutesWidget = () => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Saved Routes</h3>
      <p style={{ color: '#666' }}>Your saved routes will appear here</p>
      {/* Placeholder content */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
          📍 Route: Origin → Destination (Coming soon...)
        </div>
        <div style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
          📍 Route: City A → City B (Coming soon...)
        </div>
        <div style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
          📍 Route: Port X → Port Y (Coming soon...)
        </div>
      </div>
    </div>
  );
};

export default SavedRoutesWidget;
