import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const PrivacySettings: React.FC = () => {
  const { resetToDefaults } = usePreferences();
  const { t } = useTranslation('preferences');
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // This would collect all user data
      const userData = {
        user: user,
        exportDate: new Date().toISOString(),
        preferences: 'preferences data would go here',
        borrowingHistory: 'borrowing history would go here',
        // Add other user data as needed
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bcm-user-data-${user?.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setIsClearingCache(true);
      
      // Clear localStorage items related to the app
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('bcm_') || key.includes('preferences') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // You might want to reload the page or show a success message
      alert(t('messages.cache_cleared'));
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleResetAll = async () => {
    try {
      setIsResetting(true);
      await resetToDefaults();
      setShowResetConfirm(false);
      alert(t('messages.reset'));
    } catch (error) {
      console.error('Error resetting preferences:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data export */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('privacy.data_export.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('privacy.data_export.description')}
            </p>
          </div>
          <div className="ml-4">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Export...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('privacy.data_export.button')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clear cache */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('privacy.clear_cache.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('privacy.clear_cache.description')}
            </p>
          </div>
          <div className="ml-4">
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isClearingCache ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2" />
                  Nettoyage...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('privacy.clear_cache.button')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reset all preferences */}
      <div className="border border-red-200 dark:border-red-600 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {t('privacy.reset_all.title')}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              {t('privacy.reset_all.description')}
            </p>
          </div>
          <div className="ml-4">
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={isResetting}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('privacy.reset_all.button')}
            </button>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Confirmer la réinitialisation
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy.reset_all.confirm')}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                Annuler
              </button>
              <button
                onClick={handleResetAll}
                disabled={isResetting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser tout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Respect de votre vie privée
            </h3>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Vos données sont stockées de manière sécurisée et ne sont utilisées que pour 
                le fonctionnement de l'application. Vous avez le contrôle total sur vos 
                informations et pouvez les exporter ou les supprimer à tout moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;