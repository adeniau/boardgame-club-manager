import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LanguageContextType,
  Language,
  DateFormat,
  TranslationKey,
  Translations
} from '../types/preferences';
import { usePreferences } from './PreferencesContext';

// Import translation files
import frCommon from '../locales/fr/common.json';
import frPreferences from '../locales/fr/preferences.json';
import frDashboard from '../locales/fr/dashboard.json';
import frGames from '../locales/fr/games.json';
import frMembers from '../locales/fr/members.json';
import frBorrowings from '../locales/fr/borrowings.json';
import frErrors from '../locales/fr/errors.json';

import enCommon from '../locales/en/common.json';
import enPreferences from '../locales/en/preferences.json';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Combine all translations
const translations: Translations = {
  fr: {
    common: frCommon,
    preferences: frPreferences,
    dashboard: frDashboard,
    games: frGames,
    members: frMembers,
    borrowings: frBorrowings,
    errors: frErrors
  },
  en: {
    common: enCommon,
    preferences: enPreferences,
    // For now, fallback to French for missing English translations
    dashboard: frDashboard,
    games: frGames,
    members: frMembers,
    borrowings: frBorrowings,
    errors: frErrors
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { preferences, updateLanguage: updatePreferencesLanguage } = usePreferences();
  const [isLoading, setIsLoading] = useState(false);

  // Get language from preferences or default to French
  const language: Language = preferences?.language || 'fr';

  // Translation function
  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    try {
      const keys = key.split('.');
      let translation: any = translations[language];

      // Navigate through the nested keys
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          // Fallback to French if key not found in current language
          if (language !== 'fr') {
            translation = translations.fr;
            for (const fallbackKey of keys) {
              if (translation && typeof translation === 'object' && fallbackKey in translation) {
                translation = translation[fallbackKey];
              } else {
                console.warn(`Translation key not found: ${key} in ${language} or fr`);
                return key; // Return the key if no translation found
              }
            }
          } else {
            console.warn(`Translation key not found: ${key} in ${language}`);
            return key; // Return the key if no translation found
          }
        }
      }

      if (typeof translation !== 'string') {
        console.warn(`Translation key ${key} does not resolve to a string`);
        return key;
      }

      // Replace variables in the translation
      if (variables) {
        let result = translation;
        Object.entries(variables).forEach(([varKey, value]) => {
          result = result.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
        });
        return result;
      }

      return translation;
    } catch (error) {
      console.error('Error in translation function:', error);
      return key;
    }
  }, [language]);

  // Set language
  const setLanguage = useCallback(async (newLanguage: Language) => {
    try {
      setIsLoading(true);
      await updatePreferencesLanguage(newLanguage);
      
      // Update document language
      document.documentElement.lang = newLanguage;
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updatePreferencesLanguage]);

  // Format date according to preferences
  const formatDate = useCallback((
    date: Date | string, 
    format?: DateFormat
  ): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      const dateFormat = format || preferences?.date_format || 'dd/mm/yyyy';
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();

      switch (dateFormat) {
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
  }, [preferences?.date_format]);

  // Format number according to locale
  const formatNumber = useCallback((number: number): string => {
    try {
      const locale = language === 'en' ? 'en-US' : 'fr-FR';
      return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }, [language]);

  // Update document language when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Update document direction if needed (for RTL languages in the future)
    document.documentElement.dir = 'ltr';
  }, [language]);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    formatDate,
    formatNumber,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation utilities
export const translationUtils = {
  // Check if a translation key exists
  hasTranslation(language: Language, key: string): boolean {
    const keys = key.split('.');
    let translation: any = translations[language];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return false;
      }
    }

    return typeof translation === 'string';
  },

  // Get all available translation keys for a namespace
  getTranslationKeys(language: Language, namespace?: string): string[] {
    const keys: string[] = [];
    const source = namespace 
      ? (translations[language] as any)[namespace] 
      : translations[language];

    function extractKeys(obj: any, prefix: string = ''): void {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'string') {
            keys.push(fullKey);
          } else if (typeof obj[key] === 'object') {
            extractKeys(obj[key], fullKey);
          }
        });
      }
    }

    extractKeys(source);
    return keys;
  },

  // Pluralization helper (simple implementation)
  pluralize(
    language: Language,
    key: string,
    count: number,
    variables?: Record<string, string | number>
  ): string {
    const pluralKey = count === 1 ? `${key}_singular` : `${key}_plural`;
    
    // Try plural key first, fallback to original key
    const translation = translations[language];
    // This is a simplified implementation - would need more complex logic for full i18n
    return key; // Placeholder for now
  },

  // Get translation with fallback
  getTranslation(
    language: Language,
    key: string,
    fallbackLanguage: Language = 'fr'
  ): string {
    const keys = key.split('.');
    
    // Try primary language first
    let translation: any = translations[language];
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        translation = null;
        break;
      }
    }

    if (typeof translation === 'string') {
      return translation;
    }

    // Fallback to fallback language
    if (language !== fallbackLanguage) {
      translation = translations[fallbackLanguage];
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          break;
        }
      }
    }

    return typeof translation === 'string' ? translation : key;
  },

  // Validate all translations have required keys
  validateTranslations(requiredKeys: string[]): { 
    missing: Record<Language, string[]>; 
    isValid: boolean; 
  } {
    const missing: Record<Language, string[]> = { fr: [], en: [] };
    let isValid = true;

    Object.keys(translations).forEach(lang => {
      requiredKeys.forEach(key => {
        if (!this.hasTranslation(lang as Language, key)) {
          missing[lang as Language].push(key);
          isValid = false;
        }
      });
    });

    return { missing, isValid };
  }
};

// HOC for components that need translation
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & { t: LanguageContextType['t'] }>
) {
  const TranslatedComponent = (props: P) => {
    const { t } = useLanguage();
    return <Component {...props} t={t} />;
  };

  TranslatedComponent.displayName = `withTranslation(${Component.displayName || Component.name})`;
  return TranslatedComponent;
}

// Custom hook for namespaced translations
export function useTranslation(namespace?: string) {
  const { t, ...rest } = useLanguage();
  
  const namespacedT = useCallback((key: string, variables?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, variables);
  }, [t, namespace]);

  return {
    ...rest,
    t: namespacedT,
  };
}