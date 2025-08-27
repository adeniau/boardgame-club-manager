import { ApiResponse } from '../types/api';
import {
  UserPreferences,
  UpdatePreferencesRequest,
  ThemeUpdateRequest,
  LanguageUpdateRequest,
  NotificationUpdateRequest,
  ShortcutsUpdateRequest,
  Theme,
  Language,
  NotificationType,
  DashboardWidget
} from '../types/preferences';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class PreferencesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data: ApiResponse<UserPreferences> = await response.json();
      
      if (!data.success) {
        throw new Error('API returned error');
      }

      return data.data || {
        language: 'fr' as Language,
        theme: 'auto' as Theme,
        notifications_enabled: true,
        notification_types: ['borrowing', 'return', 'overdue'] as NotificationType[],
        keyboard_shortcuts_enabled: true,
        custom_shortcuts: {},
        dashboard_widgets: ['stats', 'recent', 'popular', 'charts'] as DashboardWidget[],
        items_per_page: 10,
        date_format: 'dd/mm/yyyy' as const
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  async updateTheme(theme: Theme): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/theme`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ theme } as ThemeUpdateRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update theme');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  async updateLanguage(language: Language): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/language`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ language } as LanguageUpdateRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to update language');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update language');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  }

  async updateNotifications(
    notifications_enabled: boolean,
    notification_types: NotificationType[]
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/notifications`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          notifications_enabled, 
          notification_types 
        } as NotificationUpdateRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to update notifications');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update notifications');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  async updateShortcuts(
    keyboard_shortcuts_enabled: boolean,
    custom_shortcuts: Record<string, string>
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/shortcuts`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          keyboard_shortcuts_enabled, 
          custom_shortcuts 
        } as ShortcutsUpdateRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to update shortcuts');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update shortcuts');
      }
    } catch (error) {
      console.error('Error updating shortcuts:', error);
      throw error;
    }
  }

  async resetToDefaults(): Promise<UserPreferences> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/reset`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to reset preferences');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to reset preferences');
      }

      return data.preferences;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  }

  // Local storage methods for offline support
  private getLocalStorageKey(userId: number): string {
    return `bcm_preferences_${userId}`;
  }

  getCachedPreferences(userId: number): UserPreferences | null {
    try {
      const cached = localStorage.getItem(this.getLocalStorageKey(userId));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached preferences:', error);
      return null;
    }
  }

  setCachedPreferences(userId: number, preferences: UserPreferences): void {
    try {
      localStorage.setItem(
        this.getLocalStorageKey(userId),
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error caching preferences:', error);
    }
  }

  clearCachedPreferences(userId: number): void {
    try {
      localStorage.removeItem(this.getLocalStorageKey(userId));
    } catch (error) {
      console.error('Error clearing cached preferences:', error);
    }
  }

  // Theme detection utilities
  detectSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    return 'light';
  }

  // Browser notification API helpers
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Browser does not support notifications');
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notifications are blocked');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  }

  // Keyboard shortcut utilities
  formatShortcut(shortcut: string): string {
    return shortcut
      .replace('Ctrl+', 'Ctrl + ')
      .replace('Alt+', 'Alt + ')
      .replace('Shift+', 'Shift + ')
      .replace('Meta+', 'Cmd + ');
  }

  parseShortcut(shortcut: string): {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  } {
    const parts = shortcut.split('+').map(p => p.trim());
    const key = parts[parts.length - 1] || '';
    
    return {
      key: key.toLowerCase(),
      ctrl: parts.includes('Ctrl'),
      alt: parts.includes('Alt'),
      shift: parts.includes('Shift'),
      meta: parts.includes('Meta') || parts.includes('Cmd'),
    };
  }

  isShortcutMatch(
    event: KeyboardEvent,
    shortcut: string
  ): boolean {
    const parsed = this.parseShortcut(shortcut);
    
    return (
      event.key.toLowerCase() === parsed.key &&
      event.ctrlKey === parsed.ctrl &&
      event.altKey === parsed.alt &&
      event.shiftKey === parsed.shift &&
      event.metaKey === parsed.meta
    );
  }
}

export const preferencesService = new PreferencesService();