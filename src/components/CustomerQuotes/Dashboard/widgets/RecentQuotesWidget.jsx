import React from 'react';

const RecentQuotesWidget = () => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Recent Quotes</h3>
      <p style={{ color: '#666' }}>Recent quotes will be displayed here</p>
      {/* Placeholder content */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
          Quote #1 - Coming soon...
        </div>
        <div style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
          Quote #2 - Coming soon...
        </div>
        <div style={{ padding: '10px', backgroundColor: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
          Quote #3 - Coming soon...
        </div>
      </div>
    </div>
  );
};

export default RecentQuotesWidget;
