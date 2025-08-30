// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QuoteProvider } from './contexts/QuoteContext';
import QuoteRouter from './components/QuoteRouter';

function App({ shellContext, basename }) {
  // If running standalone (not in shell), provide our own router
  const isStandalone = !window.shellContext && !shellContext;
  
  if (isStandalone) {
    // Running standalone - provide our own BrowserRouter
    const { BrowserRouter } = require('react-router-dom');
    return (
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <ThemeProvider>
            <QuoteProvider>
              <QuoteRouter />
            </QuoteProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }
  
  // Running in shell - shell provides the router
  return (
    <AuthProvider>
      <ThemeProvider>
        <QuoteProvider>
          <QuoteRouter />
        </QuoteProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
