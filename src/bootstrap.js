import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Check if running standalone or in shell
const isStandalone = !window.shellContext;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (isStandalone) {
  // Standalone mode for testing
  console.log('Running in standalone mode');
  
  // Use the mockShellContext from index.html if available, otherwise use defaults
  const mockContext = window.mockShellContext || {
    user: { 
      role: 'foreign_partner',
      name: 'Test User',
      email: 'test@example.com'
    },
    isDarkMode: false,
    token: 'mock-token-123'
  };
  
  console.log('Using role:', mockContext.user?.role);
  
  root.render(
    <React.StrictMode>
      <App shellContext={mockContext} />
    </React.StrictMode>
  );
} else {
  // Will be loaded by shell
  console.log('Running in shell mode');
}

// Export for module federation
export { default as App } from './App';
