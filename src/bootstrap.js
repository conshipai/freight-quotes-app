// Wait for shared dependencies to be ready
async function init() {
  let React, ReactDOM;
  
  // When loaded as a module, wait for shell's React
  if (window.shellContext || window.React) {
    React = window.React;
    ReactDOM = window.ReactDOM;
    
    // Wait a bit if not ready yet
    let attempts = 0;
    while ((!React || !ReactDOM) && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      React = window.React;
      ReactDOM = window.ReactDOM;
      attempts++;
    }
  }
  
  // Fallback to local React
  if (!React || !ReactDOM) {
    React = await import('react');
    ReactDOM = await import('react-dom/client');
  }
  
  const { default: App } = await import('./App');
  
  // Only mount if standalone
  const container = document.getElementById('root');
  if (container && !window.shellContext) {
    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(App)
      )
    );
  }
  
  return App;
}

// Initialize and export
export default init().then(App => ({ default: App }));
