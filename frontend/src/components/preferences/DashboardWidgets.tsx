import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useTranslation } from '../../context/LanguageContext';
import { DashboardWidget, DASHBOARD_WIDGETS } from '../../types/preferences';

const DashboardWidgets: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const { t } = useTranslation('preferences');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleWidgetToggle = async (widget: DashboardWidget, enabled: boolean) => {
    if (!preferences) return;

    try {
      setIsUpdating(true);
      const newWidgets = enabled
        ? [...preferences.dashboard_widgets, widget]
        : preferences.dashboard_widgets.filter(w => w !== widget);
      
      await updatePreferences({ dashboard_widgets: newWidgets });
    } catch (error) {
      console.error('Error updating dashboard widgets:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetLayout = async () => {
    if (!preferences) return;

    try {
      setIsUpdating(true);
      await updatePreferences({
        dashboard_widgets: ['stats', 'recent', 'popular', 'charts']
      });
    } catch (error) {
      console.error('Error resetting dashboard layout:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!preferences) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Widget selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {t('dashboard.widgets.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('dashboard.widgets.description')}
        </p>
      </div>

      <div className="space-y-3">
        {DASHBOARD_WIDGETS.map((widget) => (
          <div
            key={widget.value}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {widget.label}
                </h4>
                {preferences.dashboard_widgets.includes(widget.value) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Actif
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {widget.description}
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={preferences.dashboard_widgets.includes(widget.value)}
                  onChange={(e) =>
                    handleWidgetToggle(widget.value, e.target.checked)
                  }
                  disabled={isUpdating}
                />
                <div
                  className={`w-8 h-5 rounded-full transition-colors ${
                    preferences.dashboard_widgets.includes(widget.value)
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${isUpdating ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${
                      preferences.dashboard_widgets.includes(widget.value)
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

      {/* Layout management */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {t('dashboard.layout.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('dashboard.layout.description')}
        </p>

        {/* Widget preview/ordering (simplified for now) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {preferences.dashboard_widgets.map((widget, index) => (
            <div
              key={widget}
              className="p-3 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg text-center"
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {DASHBOARD_WIDGETS.find(w => w.value === widget)?.label || widget}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Position {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleResetLayout}
            disabled={isUpdating}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none disabled:opacity-50"
          >
            {t('dashboard.layout.reset')}
          </button>
        </div>
      </div>

      {/* Update indicator */}
      {isUpdating && (
        <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
            Mise à jour des widgets...
          </span>
        </div>
      )}

      {/* Info box */}
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
              Personnalisation du tableau de bord
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Vous pouvez personnaliser l'affichage de votre tableau de bord en activant 
                ou désactivant les widgets selon vos besoins. Les modifications seront 
                appliquées immédiatement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;