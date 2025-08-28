import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import QuoteRouter from './router/QuoteRouter';
import './styles/index.css';

function App({ shellContext, basename = "/app/quotes" }) {
  // Use React from window if available (for module federation)
  const ReactToUse = window.React || React;
  const [userRole, setUserRole] = ReactToUse.useState(shellContext?.user?.role || 'foreign_partner');
  const [isDarkMode, setIsDarkMode] = ReactToUse.useState(shellContext?.isDarkMode || false);

  useEffect(() => {
    if (shellContext) {
      console.log('Shell context updated:', shellContext);
      setUserRole(shellContext.user?.role || 'foreign_partner');
      setIsDarkMode(shellContext.isDarkMode || false);
    }
  }, [shellContext]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Don't use BrowserRouter when loaded as module
  const isModule = !!shellContext;
  
  if (isModule) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <QuoteRouter userRole={userRole} shellContext={shellContext} />
      </div>
    );
  }

  return (
    <BrowserRouter basename={basename}>
      <div className={isDarkMode ? 'dark' : ''}>
        <QuoteRouter userRole={userRole} shellContext={shellContext} />
      </div>
    </BrowserRouter>
  );
}

export default App;
