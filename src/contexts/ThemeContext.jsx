import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Check if shell provides dark mode, otherwise use localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // First check shell context
    if (window.shellContext?.isDarkMode !== undefined) {
      return window.shellContext.isDarkMode;
    }
    // Then check localStorage
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Listen for shell context theme changes
  useEffect(() => {
    const handleShellThemeChange = () => {
      if (window.shellContext?.isDarkMode !== undefined) {
        setIsDarkMode(window.shellContext.isDarkMode);
      }
    };

    // Check if shell context updates
    window.addEventListener('shell-theme-change', handleShellThemeChange);
    
    return () => {
      window.removeEventListener('shell-theme-change', handleShellThemeChange);
    };
  }, []);

  // Save to localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
