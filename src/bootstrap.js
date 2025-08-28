import('./App').then(({ default: App }) => {
  // When loaded via module federation, React comes from shell
  const React = window.React || require('react');
  const ReactDOM = window.ReactDOM || require('react-dom/client');
  
  // Only render if we're standalone (not in shell)
  const container = document.getElementById('root');
  if (container && !window.shellContext) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});

// Export for module federation
export { default as App } from './App';
