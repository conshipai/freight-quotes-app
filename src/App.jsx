// src/App.jsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QuoteProvider } from './contexts/QuoteContext';
import QuoteRouter from './components/QuoteRouter';

function App() {
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
