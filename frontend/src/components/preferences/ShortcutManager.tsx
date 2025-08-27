import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useTranslation } from '../../context/LanguageContext';
import { DEFAULT_SHORTCUTS } from '../../types/preferences';

const ShortcutManager: React.FC = () => {
  const { preferences, updateShortcuts } = usePreferences();
  const { t } = useTranslation('preferences');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState(false);

  const handleShortcutToggle = async (enabled: boolean) => {
    if (!preferences) return;

    try {
      setIsUpdating(true);
      await updateShortcuts(enabled, preferences.custom_shortcuts);
    } catch (error) {
      console.error('Error updating shortcuts:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const startRecording = (shortcutKey: string) => {
    setEditingShortcut(shortcutKey);
    setRecordingKey(true);
  };

  const stopRecording = () => {
    setEditingShortcut(null);
    setRecordingKey(false);
  };

  // Handle keydown for recording shortcuts
  useEffect(() => {
    if (!recordingKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const keys = [];
      if (event.ctrlKey) keys.push('Ctrl');
      if (event.altKey) keys.push('Alt');
      if (event.shiftKey) keys.push('Shift');
      if (event.metaKey) keys.push('Cmd');

      // Add the main key
      if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift' && event.key !== 'Meta') {
        keys.push(event.key.toUpperCase());
      }

      if (keys.length > 0 && editingShortcut) {
        const newShortcut = keys.join('+');
        console.log(`New shortcut for ${editingShortcut}: ${newShortcut}`);
        // Here you would update the shortcut
        stopRecording();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [recordingKey, editingShortcut]);

  if (!preferences) {
    return <div>Loading...</div>;
  }

  const shortcutCategories = Object.entries(DEFAULT_SHORTCUTS);

  return (
    <div className="space-y-6">
      {/* Master shortcuts toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('shortcuts.enable.title')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('shortcuts.enable.description')}
          </p>
        </div>
        <div className="ml-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={preferences.keyboard_shortcuts_enabled}
              onChange={(e) => handleShortcutToggle(e.target.checked)}
              disabled={isUpdating}
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                preferences.keyboard_shortcuts_enabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-600'
              } ${isUpdating ? 'opacity-50' : ''}`}
            >
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  preferences.keyboard_shortcuts_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {preferences.keyboard_shortcuts_enabled && (
        <div className="space-y-6">
          {/* Help text */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
                  {t('shortcuts.help.title')}
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>{t('shortcuts.help.description')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shortcut categories */}
          {shortcutCategories.map(([category, shortcuts]) => (
            <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t(`shortcuts.categories.${category}`)}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(shortcuts).map(([action, defaultKey]) => (
                  <div key={action} className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {t(`shortcuts.default_shortcuts.${action}`)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                        {defaultKey}
                      </kbd>
                      <button
                        onClick={() => startRecording(`${category}.${action}`)}
                        disabled={recordingKey}
                        className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
                      >
                        {editingShortcut === `${category}.${action}` && recordingKey
                          ? t('shortcuts.help.press_key')
                          : t('shortcuts.actions.edit')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Recording overlay */}
          {recordingKey && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Enregistrement du raccourci
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {t('shortcuts.help.press_key')}
                  </p>
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => console.log('Reset shortcuts')}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 focus:outline-none"
            >
              {t('shortcuts.actions.reset')}
            </button>
          </div>
        </div>
      )}

      {/* Update indicator */}
      {isUpdating && (
        <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
            Mise à jour des raccourcis...
          </span>
        </div>
      )}
    </div>
  );
};

export default ShortcutManager;