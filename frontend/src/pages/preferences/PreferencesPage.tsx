import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { usePreferences } from '../../context/PreferencesContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ThemeSelector from '../../components/preferences/ThemeSelector';
import LanguageSelector from '../../components/preferences/LanguageSelector';
import NotificationSettings from '../../components/preferences/NotificationSettings';
import ShortcutManager from '../../components/preferences/ShortcutManager';
import DashboardWidgets from '../../components/preferences/DashboardWidgets';
import PrivacySettings from '../../components/preferences/PrivacySettings';

type TabType = 'general' | 'appearance' | 'notifications' | 'shortcuts' | 'dashboard' | 'privacy';

const PreferencesPage: React.FC = () => {
  const { t } = useTranslation('preferences');
  const { preferences, isLoading } = usePreferences();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const tabs: Array<{ key: TabType; label: string; icon: string }> = [
    { key: 'general', label: t('tabs.general'), icon: '⚙️' },
    { key: 'appearance', label: t('tabs.appearance'), icon: '🎨' },
    { key: 'notifications', label: t('tabs.notifications'), icon: '🔔' },
    { key: 'shortcuts', label: t('tabs.shortcuts'), icon: '⌨️' },
    { key: 'dashboard', label: t('tabs.dashboard'), icon: '📊' },
    { key: 'privacy', label: t('tabs.privacy'), icon: '🔒' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">{t('messages.loading')}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-0" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center
                  hover:text-gray-700 dark:hover:text-gray-300 focus:z-10 focus:outline-none
                  ${activeTab === tab.key
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                aria-current={activeTab === tab.key ? 'page' : undefined}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('general.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LanguageSelector />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('general.date_format.title')}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {t('general.date_format.description')}
                    </p>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={preferences?.date_format || 'dd/mm/yyyy'}
                      onChange={(e) => {
                        // This would be handled by a preference update function
                        console.log('Date format changed:', e.target.value);
                      }}
                    >
                      <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                      <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                      <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('appearance.title')}
                </h2>
                <ThemeSelector />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('notifications.title')}
                </h2>
                <NotificationSettings />
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('shortcuts.title')}
                </h2>
                <ShortcutManager />
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('dashboard.title')}
                </h2>
                <DashboardWidgets />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('privacy.title')}
                </h2>
                <PrivacySettings />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;