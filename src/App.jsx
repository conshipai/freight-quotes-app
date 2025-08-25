import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import QuoteRouter from './router/QuoteRouter';
import './styles/index.css';

function App({ shellContext }) {
  const [userRole, setUserRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (shellContext) {
      setUserRole(shellContext.user?.role);
      setIsDarkMode(shellContext.isDarkMode);
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
