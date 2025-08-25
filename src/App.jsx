import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import QuoteRouter from './router/QuoteRouter';
import './styles/index.css';

function App({ shellContext }) {
  // Initialize with the role from shellContext immediately
  const [userRole, setUserRole] = useState(shellContext?.user?.role || 'foreign_partner');
  const [isDarkMode, setIsDarkMode] = useState(shellContext?.isDarkMode || false);

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

  // Use root basename when running standalone
  const isStandalone = !window.shellContext;
  const basename = isStandalone ? "/" : "/app/quotes";

  return (
    <BrowserRouter basename={basename}>
      <div className={isDarkMode ? 'dark' : ''}>
        <QuoteRouter userRole={userRole} shellContext={shellContext} />
      </div>
    </BrowserRouter>
  );
}

export default App;
