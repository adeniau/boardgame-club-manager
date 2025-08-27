import { DateFormat, Language, Theme } from '../types/preferences';

/**
 * Utility functions for preferences management
 */
export const preferencesUtils = {
  /**
   * Format date according to user preference
   */
  formatDate(date: Date | string, format: DateFormat = 'dd/mm/yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();

      switch (format) {
        case 'mm/dd/yyyy':
          return `${month}/${day}/${year}`;
        case 'yyyy-mm-dd':
          return `${year}-${month}-${day}`;
        case 'dd/mm/yyyy':
        default:
          return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Format date and time according to user preference
   */
  formatDateTime(date: Date | string, format: DateFormat = 'dd/mm/yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      const dateStr = this.formatDate(dateObj, format);
      const time = dateObj.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `${dateStr} ${time}`;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Format relative time (e.g., "2 days ago")
   */
  formatRelativeTime(date: Date | string, language: Language = 'fr'): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      const translations = {
        fr: {
          now: 'maintenant',
          minutes: 'il y a {count} minute(s)',
          hours: 'il y a {count} heure(s)',
          days: 'il y a {count} jour(s)',
          weeks: 'il y a {count} semaine(s)',
          months: 'il y a {count} mois',
          years: 'il y a {count} année(s)',
        },
        en: {
          now: 'now',
          minutes: '{count} minute(s) ago',
          hours: '{count} hour(s) ago',
          days: '{count} day(s) ago',
          weeks: '{count} week(s) ago',
          months: '{count} month(s) ago',
          years: '{count} year(s) ago',
        }
      };

      const t = translations[language];

      if (diffInMinutes < 1) return t.now;
      if (diffInMinutes < 60) return t.minutes.replace('{count}', diffInMinutes.toString());
      if (diffInHours < 24) return t.hours.replace('{count}', diffInHours.toString());
      if (diffInDays < 7) return t.days.replace('{count}', diffInDays.toString());
      if (diffInWeeks < 4) return t.weeks.replace('{count}', diffInWeeks.toString());
      if (diffInMonths < 12) return t.months.replace('{count}', diffInMonths.toString());
      return t.years.replace('{count}', diffInYears.toString());
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Format number according to locale
   */
  formatNumber(number: number, language: Language = 'fr'): string {
    try {
      const locale = language === 'en' ? 'en-US' : 'fr-FR';
      return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  },

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, language: Language = 'fr', currency: string = 'EUR'): string {
    try {
      const locale = language === 'en' ? 'en-US' : 'fr-FR';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount} ${currency}`;
    }
  },

  /**
   * Get theme CSS class names
   */
  getThemeClasses(theme: Theme, effectiveTheme?: 'light' | 'dark'): string {
    const classes = [`theme-${theme}`];
    
    if (effectiveTheme) {
      classes.push(`theme-effective-${effectiveTheme}`);
    }
    
    return classes.join(' ');
  },

  /**
   * Get language direction (for future RTL support)
   */
  getLanguageDirection(_language: Language): 'ltr' | 'rtl' {
    // For now, both supported languages are LTR
    // This can be extended for RTL languages in the future
    return 'ltr';
  },

  /**
   * Validate date format string
   */
  isValidDateFormat(format: string): format is DateFormat {
    return ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'].includes(format);
  },

  /**
   * Validate theme string
   */
  isValidTheme(theme: string): theme is Theme {
    return ['light', 'dark', 'auto'].includes(theme);
  },

  /**
   * Validate language string
   */
  isValidLanguage(language: string): language is Language {
    return ['fr', 'en'].includes(language);
  },

  /**
   * Get browser locale preference
   */
  getBrowserLocale(): Language {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      return 'en';
    }
    // Default to French
    return 'fr';
  },

  /**
   * Get system theme preference
   */
  getSystemThemePreference(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    return 'light';
  },

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },

  /**
   * Check if high contrast is preferred
   */
  prefersHighContrast(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-contrast: high)').matches;
    }
    return false;
  },

  /**
   * Storage helpers for preferences caching
   */
  storage: {
    set(key: string, value: any): void {
      try {
        localStorage.setItem(`bcm_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },

    get<T>(key: string, defaultValue: T): T {
      try {
        const item = localStorage.getItem(`bcm_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
      }
    },

    remove(key: string): void {
      try {
        localStorage.removeItem(`bcm_${key}`);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    },

    clear(): void {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('bcm_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  },

  /**
   * Accessibility helpers
   */
  accessibility: {
    /**
     * Announce message to screen readers
     */
    announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
      const announcer = document.getElementById('aria-live-region');
      if (announcer) {
        announcer.textContent = message;
        announcer.setAttribute('aria-live', priority);
      } else {
        // Create announcer if it doesn't exist
        const newAnnouncer = document.createElement('div');
        newAnnouncer.id = 'aria-live-region';
        newAnnouncer.setAttribute('aria-live', priority);
        newAnnouncer.setAttribute('aria-atomic', 'true');
        newAnnouncer.className = 'sr-only';
        newAnnouncer.textContent = message;
        document.body.appendChild(newAnnouncer);
      }
    },

    /**
     * Focus management
     */
    focusElement(selector: string, delay: number = 0): void {
      setTimeout(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element && element.focus) {
          element.focus();
        }
      }, delay);
    },

    /**
     * Trap focus within an element
     */
    trapFocus(containerSelector: string): () => void {
      const container = document.querySelector(containerSelector) as HTMLElement;
      if (!container) return () => {};

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab' && firstElement && lastElement) {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);

      // Return cleanup function
      return () => {
        container.removeEventListener('keydown', handleTabKey);
      };
    }
  },

  /**
   * Performance helpers
   */
  performance: {
    /**
     * Debounce function calls
     */
    debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => void {
      let timeout: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    /**
     * Throttle function calls
     */
    throttle<T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): (...args: Parameters<T>) => void {
      let inThrottle: boolean;
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }
  }
};