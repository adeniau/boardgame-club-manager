import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeContextType, Theme } from '../types/preferences';
import { usePreferences } from './PreferencesContext';
import { preferencesService } from '../services/preferencesService';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { preferences, updateTheme: updatePreferencesTheme } = usePreferences();
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Get theme from preferences or default
  const theme: Theme = preferences?.theme || 'auto';

  // Calculate effective theme (light or dark) based on theme preference
  const effectiveTheme: 'light' | 'dark' = React.useMemo(() => {
    if (theme === 'light') return 'light';
    if (theme === 'dark') return 'dark';
    return isSystemDark ? 'dark' : 'light';
  }, [theme, isSystemDark]);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Set initial value
    setIsSystemDark(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(effectiveTheme);

    // Set data attribute for CSS custom properties
    root.setAttribute('data-theme', effectiveTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = {
        light: '#ffffff',
        dark: '#1a1a1a'
      };
      metaThemeColor.setAttribute('content', themeColors[effectiveTheme]);
    }
  }, [effectiveTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    try {
      await updatePreferencesTheme(newTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }, [updatePreferencesTheme]);

  const toggleTheme = useCallback(async () => {
    const nextTheme: Theme = effectiveTheme === 'light' ? 'dark' : 'light';
    await setTheme(nextTheme);
  }, [effectiveTheme, setTheme]);

  const contextValue: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme utilities for CSS-in-JS or dynamic styles
export const themeUtils = {
  // Get CSS custom property value
  getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${name}`)
      .trim();
  },

  // Set CSS custom property value
  setCSSVariable(name: string, value: string): void {
    document.documentElement.style.setProperty(`--${name}`, value);
  },

  // Get theme-aware color
  getThemeColor(lightColor: string, darkColor: string, theme?: 'light' | 'dark'): string {
    const effectiveTheme = theme || 
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    return effectiveTheme === 'dark' ? darkColor : lightColor;
  },

  // Apply theme transition
  applyThemeTransition(duration: number = 300): void {
    const root = document.documentElement;
    
    // Add transition class
    root.style.setProperty('--theme-transition-duration', `${duration}ms`);
    root.classList.add('theme-transitioning');

    // Remove transition class after transition
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
      root.style.removeProperty('--theme-transition-duration');
    }, duration);
  },

  // Create theme-aware media query
  createThemeMediaQuery(theme: 'light' | 'dark'): MediaQueryList {
    const query = theme === 'dark' 
      ? '(prefers-color-scheme: dark)' 
      : '(prefers-color-scheme: light)';
    return window.matchMedia(query);
  },

  // Generate theme-specific CSS classes
  getThemeClasses(baseClass: string): {
    light: string;
    dark: string;
    auto: string;
  } {
    return {
      light: `${baseClass} ${baseClass}--light`,
      dark: `${baseClass} ${baseClass}--dark`,
      auto: `${baseClass} ${baseClass}--auto`,
    };
  },
};

// Theme-aware component HOC
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextType }>
) {
  const ThemedComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };

  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
}

// Theme CSS variables for use in CSS files
export const themeVariables = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--bg-tertiary': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-tertiary': '#64748b',
    '--border-primary': '#e2e8f0',
    '--border-secondary': '#cbd5e1',
    '--accent-primary': '#3b82f6',
    '--accent-secondary': '#1e40af',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--error': '#ef4444',
    '--shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--bg-tertiary': '#334155',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#cbd5e1',
    '--text-tertiary': '#94a3b8',
    '--border-primary': '#374151',
    '--border-secondary': '#4b5563',
    '--accent-primary': '#60a5fa',
    '--accent-secondary': '#3b82f6',
    '--success': '#34d399',
    '--warning': '#fbbf24',
    '--error': '#f87171',
    '--shadow': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  },
};

// Initialize theme variables on module load
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const variables = isDark ? themeVariables.dark : themeVariables.light;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}