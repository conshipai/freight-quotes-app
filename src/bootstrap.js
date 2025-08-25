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
  root.render(
    <React.StrictMode>
      <App shellContext={window.mockShellContext || {
        user: { role: 'foreign_partner' },
        isDarkMode: false
      }} />
    </React.StrictMode>
  );
} else {
  // Will be loaded by shell
  console.log('Running in shell mode');
}

// Export for module federation
export { default as App } from './App';
