import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { Theme, AVAILABLE_THEMES } from '../../types/preferences';

const ThemeSelector: React.FC = () => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { t } = useTranslation('preferences');
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeChange = async (newTheme: Theme) => {
    try {
      setIsChanging(true);
      await setTheme(newTheme);
    } catch (error) {
      console.error('Error changing theme:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const getThemeIcon = (themeValue: Theme): string => {
    switch (themeValue) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '⚙️';
      default:
        return '⚙️';
    }
  };

  const getThemeLabel = (themeValue: Theme): string => {
    switch (themeValue) {
      case 'light':
        return t('appearance.theme.light');
      case 'dark':
        return t('appearance.theme.dark');
      case 'auto':
        return t('appearance.theme.auto');
      default:
        return themeValue;
    }
  };

  const getThemeDescription = (themeValue: Theme): string => {
    switch (themeValue) {
      case 'light':
        return t('appearance.theme_description.light');
      case 'dark':
        return t('appearance.theme_description.dark');
      case 'auto':
        return t('appearance.theme_description.auto');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('appearance.theme.title')}
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('appearance.theme.description')}
        </p>
      </div>

      {/* Theme Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {AVAILABLE_THEMES.map((themeOption) => (
          <div
            key={themeOption.value}
            className={`
              relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${theme === themeOption.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }
              ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !isChanging && handleThemeChange(themeOption.value)}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getThemeIcon(themeOption.value)}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {getThemeLabel(themeOption.value)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getThemeDescription(themeOption.value)}
                </p>
              </div>
              {theme === themeOption.value && (
                <div className="text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('appearance.preview')}
        </h4>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('appearance.current_theme', { theme: getThemeLabel(theme) })}
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Thème actuel: {effectiveTheme === 'dark' ? 'Sombre' : 'Clair'}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Change Indicator */}
      {isChanging && (
        <div className="flex items-center justify-center p-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Application du thème...
          </span>
        </div>
      )}

      {/* Additional Theme Information */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              À propos des thèmes
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                • <strong>Clair :</strong> Utilise toujours le thème clair
              </p>
              <p>
                • <strong>Sombre :</strong> Utilise toujours le thème sombre
              </p>
              <p>
                • <strong>Automatique :</strong> S'adapte aux préférences de votre système
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;