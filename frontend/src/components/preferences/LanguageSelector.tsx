import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../context/LanguageContext';
import { Language, AVAILABLE_LANGUAGES } from '../../types/preferences';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation('preferences');
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === language) return;

    try {
      setIsChanging(true);
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
      // You might want to show an error toast here
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('general.language.title')}
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('general.language.description')}
        </p>
      </div>

      {/* Language Options */}
      <div className="space-y-3">
        {AVAILABLE_LANGUAGES.map((lang) => (
          <div
            key={lang.value}
            className={`
              relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${language === lang.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }
              ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !isChanging && handleLanguageChange(lang.value)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {lang.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang.value === 'fr' ? 'Français' : 'English'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {language === lang.value && (
                  <div className="text-blue-500 mr-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                
                {/* Progress indicator for translation completeness */}
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {lang.value === 'fr' ? '100%' : '85%'}
                  </div>
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        lang.value === 'fr' ? 'bg-green-500 w-full' : 'bg-yellow-500 w-5/6'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Language Change Indicator */}
      {isChanging && (
        <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
            {t('messages.loading')}
          </span>
        </div>
      )}

      {/* Translation Status Info */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              État des traductions
            </h4>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
                <strong>Français :</strong> Traduction complète
              </p>
              <p className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                <strong>English :</strong> Traduction en cours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Impact Notice */}
      {language !== 'fr' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Traduction incomplète
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Certaines parties de l'interface peuvent encore être affichées en français.
                  La traduction anglaise est en cours de développement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;