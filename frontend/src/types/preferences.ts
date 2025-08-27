export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'fr' | 'en';
export type DateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

export type NotificationType = 'borrowing' | 'return' | 'overdue' | 'reminders';

export type DashboardWidget = 'stats' | 'recent' | 'popular' | 'charts' | 'activity';

export interface NotificationSettings {
  enabled: boolean;
  types: {
    borrowing: boolean;
    return: boolean;
    overdue: boolean;
    reminders: boolean;
  };
  sound: boolean;
  desktop: boolean;
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  category: string;
}

export interface DefaultShortcuts {
  global: Record<string, string>;
  dashboard: Record<string, string>;
  games: Record<string, string>;
  members: Record<string, string>;
  borrowings: Record<string, string>;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  notifications_enabled: boolean;
  notification_types: NotificationType[];
  keyboard_shortcuts_enabled: boolean;
  custom_shortcuts: Record<string, string>;
  dashboard_widgets: DashboardWidget[];
  items_per_page: number;
  date_format: DateFormat;
}

export interface PreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateNotifications: (
    enabled: boolean,
    types: NotificationType[]
  ) => Promise<void>;
  updateShortcuts: (
    enabled: boolean,
    shortcuts: Record<string, string>
  ) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

export interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isSystemDark: boolean;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatDate: (date: Date | string, format?: DateFormat) => string;
  formatNumber: (number: number) => string;
}

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface Translations {
  [language: string]: TranslationKey;
}

// API Response types
export interface PreferencesApiResponse {
  success: boolean;
  data: UserPreferences;
}

export interface UpdatePreferencesRequest {
  theme?: Theme;
  language?: Language;
  notifications_enabled?: boolean;
  notification_types?: NotificationType[];
  keyboard_shortcuts_enabled?: boolean;
  custom_shortcuts?: Record<string, string>;
  dashboard_widgets?: DashboardWidget[];
  items_per_page?: number;
  date_format?: DateFormat;
}

export interface ThemeUpdateRequest {
  theme: Theme;
}

export interface LanguageUpdateRequest {
  language: Language;
}

export interface NotificationUpdateRequest {
  notifications_enabled: boolean;
  notification_types: NotificationType[];
}

export interface ShortcutsUpdateRequest {
  keyboard_shortcuts_enabled: boolean;
  custom_shortcuts: Record<string, string>;
}

// Default values
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  language: 'fr',
  notifications_enabled: true,
  notification_types: ['borrowing', 'return', 'overdue'],
  keyboard_shortcuts_enabled: true,
  custom_shortcuts: {},
  dashboard_widgets: ['stats', 'recent', 'popular', 'charts'],
  items_per_page: 10,
  date_format: 'dd/mm/yyyy'
};

export const DEFAULT_SHORTCUTS: DefaultShortcuts = {
  global: {
    search: 'Ctrl+K',
    preferences: 'Ctrl+,',
    help: '?',
    escape: 'Escape',
    home: 'Alt+H'
  },
  dashboard: {
    refresh: 'r',
    export: 'Ctrl+E',
    stats: '1',
    charts: '2'
  },
  games: {
    add: 'n',
    edit: 'e',
    delete: 'Delete',
    search: '/',
    filter: 'f'
  },
  members: {
    add: 'n',
    edit: 'e',
    delete: 'Delete',
    search: '/',
    filter: 'f'
  },
  borrowings: {
    create: 'n',
    return: 'r',
    history: 'h',
    search: '/',
    filter: 'f'
  }
};

export const AVAILABLE_THEMES: Array<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'auto', label: 'Automatique' }
];

export const AVAILABLE_LANGUAGES: Array<{ value: Language; label: string; flag: string }> = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' }
];

export const AVAILABLE_DATE_FORMATS: Array<{ value: DateFormat; label: string; example: string }> = [
  { value: 'dd/mm/yyyy', label: 'JJ/MM/AAAA', example: '25/12/2024' },
  { value: 'mm/dd/yyyy', label: 'MM/JJ/AAAA', example: '12/25/2024' },
  { value: 'yyyy-mm-dd', label: 'AAAA-MM-JJ', example: '2024-12-25' }
];

export const NOTIFICATION_TYPES: Array<{ value: NotificationType; label: string; description: string }> = [
  { 
    value: 'borrowing', 
    label: 'Nouveaux emprunts', 
    description: 'Notifications lors de nouveaux emprunts' 
  },
  { 
    value: 'return', 
    label: 'Retours', 
    description: 'Notifications lors de retours de jeux' 
  },
  { 
    value: 'overdue', 
    label: 'Retards', 
    description: 'Notifications pour les emprunts en retard' 
  },
  { 
    value: 'reminders', 
    label: 'Rappels', 
    description: 'Rappels automatiques' 
  }
];

export const DASHBOARD_WIDGETS: Array<{ value: DashboardWidget; label: string; description: string }> = [
  { 
    value: 'stats', 
    label: 'Statistiques', 
    description: 'Affichage des statistiques generales' 
  },
  { 
    value: 'recent', 
    label: 'Activite recente', 
    description: 'Derniers emprunts et retours' 
  },
  { 
    value: 'popular', 
    label: 'Jeux populaires', 
    description: 'Jeux les plus empruntes' 
  },
  { 
    value: 'charts', 
    label: 'Graphiques', 
    description: 'Graphiques de tendances' 
  },
  { 
    value: 'activity', 
    label: 'Flux d\'activite', 
    description: 'Chronologie des activites' 
  }
];