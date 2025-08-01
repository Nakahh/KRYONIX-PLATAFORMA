import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [systemTheme, setSystemTheme] = useState('light');

  // Detectar preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Carregar preferência salva ou usar sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('kryonix_theme');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(systemTheme === 'dark');
    }
  }, [systemTheme]);

  // Aplicar tema no documento
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('kryonix_theme', newTheme ? 'dark' : 'light');
  };

  const setTheme = (theme) => {
    if (theme === 'system') {
      localStorage.removeItem('kryonix_theme');
      setIsDark(systemTheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
      localStorage.setItem('kryonix_theme', theme);
    }
  };

  const getCurrentTheme = () => {
    const savedTheme = localStorage.getItem('kryonix_theme');
    return savedTheme || 'system';
  };

  const value = {
    isDark,
    systemTheme,
    toggleTheme,
    setTheme,
    getCurrentTheme,
    currentTheme: getCurrentTheme(),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
