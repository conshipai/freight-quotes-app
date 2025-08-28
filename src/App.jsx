import React from 'react';
import QuoteRouter from './router/QuoteRouter';
import './styles/index.css';

function App({ shellContext, basename }) {
  const userRole = shellContext?.user?.role || 'foreign_partner';
  const isDarkMode = shellContext?.isDarkMode || false;

  // Apply dark mode
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <QuoteRouter userRole={userRole} shellContext={shellContext} />
    </div>
  );
}

export default App;
