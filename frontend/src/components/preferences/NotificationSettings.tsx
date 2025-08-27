import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useTranslation } from '../../context/LanguageContext';
import { NotificationType, NOTIFICATION_TYPES } from '../../types/preferences';
import { preferencesService } from '../../services/preferencesService';

const NotificationSettings: React.FC = () => {
  const { preferences, updateNotifications } = usePreferences();
  const { t } = useTranslation('preferences');
  const [isUpdating, setIsUpdating] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  // Check browser notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!preferences) return;

    try {
      setIsUpdating(true);
      await updateNotifications(enabled, preferences.notification_types);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationTypeToggle = async (type: NotificationType, enabled: boolean) => {
    if (!preferences) return;

    try {
      setIsUpdating(true);
      const newTypes = enabled
        ? [...preferences.notification_types, type]
        : preferences.notification_types.filter(t => t !== type);
      
      await updateNotifications(preferences.notifications_enabled, newTypes);
    } catch (error) {
      console.error('Error updating notification types:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const requestBrowserPermission = async () => {
    try {
      const permission = await preferencesService.requestNotificationPermission();
      setBrowserPermission(permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const testNotification = () => {
    if (browserPermission === 'granted') {
      preferencesService.showNotification(
        t('messages.test_notification'),
        {
          body: 'Cette notification confirme que les notifications fonctionnent correctement.',
          icon: '/favicon.ico',
          tag: 'test-notification'
        }
      );
    }
  };

  if (!preferences) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Master notification toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('notifications.enable.title')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('notifications.enable.description')}
          </p>
        </div>
        <div className="ml-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={preferences.notifications_enabled}
              onChange={(e) => handleNotificationToggle(e.target.checked)}
              disabled={isUpdating}
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                preferences.notifications_enabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-600'
              } ${isUpdating ? 'opacity-50' : ''}`}
            >
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  preferences.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Notification types */}
      {preferences.notifications_enabled && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('notifications.types.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('notifications.types.description')}
            </p>
          </div>

          <div className="space-y-3">
            {NOTIFICATION_TYPES.map((notificationType) => (
              <div
                key={notificationType.value}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {notificationType.label}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {notificationType.description}
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={preferences.notification_types.includes(notificationType.value)}
                      onChange={(e) =>
                        handleNotificationTypeToggle(notificationType.value, e.target.checked)
                      }
                      disabled={isUpdating}
                    />
                    <div
                      className={`w-8 h-5 rounded-full transition-colors ${
                        preferences.notification_types.includes(notificationType.value)
                          ? 'bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-600'
                      } ${isUpdating ? 'opacity-50' : ''}`}
                    >
                      <div
                        className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${
                          preferences.notification_types.includes(notificationType.value)
                            ? 'translate-x-3'
                            : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browser notifications */}
      {preferences.notifications_enabled && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('notifications.browser.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('notifications.browser.description')}
            </p>

            <div className="space-y-3">
              {/* Permission status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      browserPermission === 'granted'
                        ? 'bg-green-500'
                        : browserPermission === 'denied'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {browserPermission === 'granted'
                        ? t('notifications.browser.permission_granted')
                        : browserPermission === 'denied'
                        ? t('notifications.browser.permission_denied')
                        : t('notifications.browser.permission_default')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {browserPermission === 'default' && (
                    <button
                      onClick={requestBrowserPermission}
                      className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 
                               hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
                    >
                      {t('notifications.browser.request_permission')}
                    </button>
                  )}
                  
                  {browserPermission === 'granted' && (
                    <button
                      onClick={testNotification}
                      className="px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 
                               hover:text-green-800 dark:hover:text-green-200 focus:outline-none"
                    >
                      {t('notifications.browser.test_notification')}
                    </button>
                  )}
                </div>
              </div>

              {/* Sound setting */}
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('notifications.sound.title')}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('notifications.sound.description')}
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      defaultChecked={true} // This would come from preferences
                      disabled={isUpdating}
                    />
                    <div className="w-8 h-5 bg-blue-600 rounded-full">
                      <div className="dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform translate-x-3" />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update indicator */}
      {isUpdating && (
        <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
            Mise à jour des préférences...
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;