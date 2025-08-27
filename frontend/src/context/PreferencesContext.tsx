import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  PreferencesContextType,
  UserPreferences,
  DEFAULT_PREFERENCES,
  Theme,
  Language,
  NotificationType
} from '../types/preferences';
import { preferencesService } from '../services/preferencesService';
import { useAuth } from './AuthContext';

type PreferencesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'RESET_PREFERENCES' }
  | { type: 'SET_ERROR'; payload: string | null };

interface PreferencesState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  preferences: null,
  isLoading: true,
  error: null,
};

function preferencesReducer(
  state: PreferencesState,
  action: PreferencesAction
): PreferencesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: state.preferences
          ? { ...state.preferences, ...action.payload }
          : null,
      };
    case 'RESET_PREFERENCES':
      return {
        ...state,
        preferences: DEFAULT_PREFERENCES,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: React.ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [state, dispatch] = useReducer(preferencesReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load preferences on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPreferences();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user]);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Try to get cached preferences first for better UX
      const cached = preferencesService.getCachedPreferences(user.id);
      if (cached) {
        dispatch({ type: 'SET_PREFERENCES', payload: cached });
      }

      // Then fetch fresh preferences from server
      const preferences = await preferencesService.getPreferences();
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });

      // Update cache
      preferencesService.setCachedPreferences(user.id, preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      
      // If we have cached preferences, use them and show error
      const cached = preferencesService.getCachedPreferences(user.id);
      if (cached) {
        dispatch({ type: 'SET_PREFERENCES', payload: cached });
        dispatch({ type: 'SET_ERROR', payload: 'Unable to sync preferences with server' });
      } else {
        // Otherwise use defaults
        dispatch({ type: 'SET_PREFERENCES', payload: DEFAULT_PREFERENCES });
        dispatch({ type: 'SET_ERROR', payload: 'Unable to load preferences, using defaults' });
      }
    }
  }, [user]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user || !state.preferences) return;

      try {
        // Optimistic update
        dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });

        // Update server
        await preferencesService.updatePreferences(updates);

        // Update cache
        const newPreferences = { ...state.preferences, ...updates };
        preferencesService.setCachedPreferences(user.id, newPreferences);

        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Error updating preferences:', error);
        
        // Revert optimistic update
        await loadPreferences();
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
        throw error;
      }
    },
    [user, state.preferences, loadPreferences]
  );

  const updateTheme = useCallback(
    async (theme: Theme) => {
      if (!user) return;

      try {
        // Optimistic update
        dispatch({ type: 'UPDATE_PREFERENCES', payload: { theme } });

        // Update server
        await preferencesService.updateTheme(theme);

        // Update cache
        if (state.preferences && user) {
          const newPreferences = { ...state.preferences, theme };
          preferencesService.setCachedPreferences(user.id, newPreferences);
        }

        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Error updating theme:', error);
        
        // Revert optimistic update
        await loadPreferences();
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update theme' });
        throw error;
      }
    },
    [user, state.preferences, loadPreferences]
  );

  const updateLanguage = useCallback(
    async (language: Language) => {
      if (!user) return;

      try {
        // Optimistic update
        dispatch({ type: 'UPDATE_PREFERENCES', payload: { language } });

        // Update server
        await preferencesService.updateLanguage(language);

        // Update cache
        if (state.preferences && user) {
          const newPreferences = { ...state.preferences, language };
          preferencesService.setCachedPreferences(user.id, newPreferences);
        }

        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Error updating language:', error);
        
        // Revert optimistic update
        await loadPreferences();
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update language' });
        throw error;
      }
    },
    [user, state.preferences, loadPreferences]
  );

  const updateNotifications = useCallback(
    async (enabled: boolean, types: NotificationType[]) => {
      if (!user) return;

      try {
        // Optimistic update
        dispatch({
          type: 'UPDATE_PREFERENCES',
          payload: {
            notifications_enabled: enabled,
            notification_types: types,
          },
        });

        // Update server
        await preferencesService.updateNotifications(enabled, types);

        // Update cache
        if (state.preferences && user) {
          const newPreferences = {
            ...state.preferences,
            notifications_enabled: enabled,
            notification_types: types,
          };
          preferencesService.setCachedPreferences(user.id, newPreferences);
        }

        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Error updating notifications:', error);
        
        // Revert optimistic update
        await loadPreferences();
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update notifications' });
        throw error;
      }
    },
    [user, state.preferences, loadPreferences]
  );

  const updateShortcuts = useCallback(
    async (enabled: boolean, shortcuts: Record<string, string>) => {
      if (!user) return;

      try {
        // Optimistic update
        dispatch({
          type: 'UPDATE_PREFERENCES',
          payload: {
            keyboard_shortcuts_enabled: enabled,
            custom_shortcuts: shortcuts,
          },
        });

        // Update server
        await preferencesService.updateShortcuts(enabled, shortcuts);

        // Update cache
        if (state.preferences && user) {
          const newPreferences = {
            ...state.preferences,
            keyboard_shortcuts_enabled: enabled,
            custom_shortcuts: shortcuts,
          };
          preferencesService.setCachedPreferences(user.id, newPreferences);
        }

        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Error updating shortcuts:', error);
        
        // Revert optimistic update
        await loadPreferences();
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update shortcuts' });
        throw error;
      }
    },
    [user, state.preferences, loadPreferences]
  );

  const resetToDefaults = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Reset on server
      const defaultPreferences = await preferencesService.resetToDefaults();
      
      dispatch({ type: 'SET_PREFERENCES', payload: defaultPreferences });

      // Update cache
      preferencesService.setCachedPreferences(user.id, defaultPreferences);

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error resetting preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset preferences' });
      throw error;
    }
  }, [user]);

  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  // Clear cached preferences on logout
  useEffect(() => {
    if (!isAuthenticated && user) {
      preferencesService.clearCachedPreferences(user.id);
      dispatch({ type: 'RESET_PREFERENCES' });
    }
  }, [isAuthenticated, user]);

  const contextValue: PreferencesContextType = {
    preferences: state.preferences,
    isLoading: state.isLoading,
    updatePreferences,
    updateTheme,
    updateLanguage,
    updateNotifications,
    updateShortcuts,
    resetToDefaults,
    refreshPreferences,
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}