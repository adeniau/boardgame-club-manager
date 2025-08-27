export type NotificationType = 'borrowing' | 'return' | 'overdue' | 'reminder' | 'system' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RelatedEntityType = 'game' | 'member' | 'borrowing' | 'season';
export type ToastType = 'success' | 'warning' | 'error' | 'info';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: number;
  relatedEntityName?: string;
  actionUrl?: string;
  isRead: boolean;
  priority: NotificationPriority;
  expiresAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificationToast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: ToastAction;
  priority?: NotificationPriority;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface NotificationFilters {
  type?: NotificationType[];
  isRead?: boolean;
  priority?: NotificationPriority[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'type';
  sortOrder?: 'ASC' | 'DESC';
}

export interface NotificationStats {
  byType: Record<NotificationType, { total: number; unread: number }>;
  byPriority: Record<NotificationPriority, number>;
}

export interface NotificationPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  count: number;
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  targetUserId?: number;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: number;
  actionUrl?: string;
  priority?: NotificationPriority;
  expiresAt?: Date | string;
}

export interface CreateSystemNotificationRequest {
  title: string;
  message: string;
  targetUserId?: number;
  priority?: NotificationPriority;
  expiresAt?: Date | string;
}

// Context Types
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  filters: NotificationFilters;
  toasts: NotificationToast[];
  
  // Notification management
  fetchNotifications: (options?: Partial<NotificationFilters>) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Filters
  setFilters: (filters: Partial<NotificationFilters>) => void;
  resetFilters: () => void;
  
  // Toast management
  showToast: (toast: Omit<NotificationToast, 'id'>) => void;
  dismissToast: (toastId: string) => void;
  clearAllToasts: () => void;
  
  // Real-time updates
  startPolling: () => void;
  stopPolling: () => void;
}

// Hook Types
export interface UseNotificationsOptions {
  autoFetch?: boolean;
  polling?: boolean;
  pollingInterval?: number;
  initialFilters?: Partial<NotificationFilters>;
}

export interface UseNotificationToastsOptions {
  position?: NotificationPosition;
  defaultDuration?: number;
  maxToasts?: number;
}

export interface UseNotificationBadgeOptions {
  updateTitle?: boolean;
  animationDuration?: number;
}

// Component Props Types
export interface NotificationCenterProps {
  className?: string;
  position?: 'left' | 'right';
  maxHeight?: string;
}

export interface NotificationBellProps {
  className?: string;
  showBadge?: boolean;
  badgeVariant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

export interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  onAction?: (url: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

export interface NotificationToastProps {
  toast: NotificationToast;
  onDismiss?: (id: string) => void;
  position?: NotificationPosition;
}

export interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: Partial<NotificationFilters>) => void;
  onReset: () => void;
  availableTypes?: NotificationType[];
  className?: string;
}

// Utility Types
export interface NotificationIcon {
  name: string;
  color: string;
  bgColor: string;
}

export interface NotificationConfig {
  icons: Record<NotificationType, NotificationIcon>;
  priorities: Record<NotificationPriority, { color: string; bgColor: string }>;
  durations: Record<ToastType, number>;
  sounds: Record<NotificationType, string>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface NotificationApiResponse extends ApiResponse<NotificationsResponse> {}
export interface UnreadCountApiResponse extends ApiResponse<UnreadCountResponse> {}
export interface NotificationStatsApiResponse extends ApiResponse<NotificationStats> {}
export interface CreateNotificationApiResponse extends ApiResponse<Notification> {}

// Default Values
export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  limit: 50,
  offset: 0,
  sortBy: 'created_at',
  sortOrder: 'DESC'
};

export const DEFAULT_TOAST_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: 10000
};

export const NOTIFICATION_TYPES: Array<{ value: NotificationType; label: string; description: string }> = [
  { 
    value: 'borrowing', 
    label: 'Emprunts', 
    description: 'Notifications pour les nouveaux emprunts' 
  },
  { 
    value: 'return', 
    label: 'Retours', 
    description: 'Notifications pour les retours de jeux' 
  },
  { 
    value: 'overdue', 
    label: 'Retards', 
    description: 'Notifications pour les emprunts en retard' 
  },
  { 
    value: 'reminder', 
    label: 'Rappels', 
    description: 'Rappels et notifications preventives' 
  },
  { 
    value: 'system', 
    label: 'Systeme', 
    description: 'Notifications systeme et administratives' 
  },
  { 
    value: 'success', 
    label: 'Succes', 
    description: 'Notifications de succes' 
  },
  { 
    value: 'warning', 
    label: 'Avertissements', 
    description: 'Avertissements et alertes' 
  },
  { 
    value: 'error', 
    label: 'Erreurs', 
    description: 'Notifications d\'erreur' 
  }
];

export const NOTIFICATION_PRIORITIES: Array<{ value: NotificationPriority; label: string; color: string }> = [
  { value: 'low', label: 'Faible', color: 'text-gray-600' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'Elevee', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
];

export const NOTIFICATION_ICONS: Record<NotificationType, NotificationIcon> = {
  borrowing: {
    name: 'ArrowDownIcon',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  return: {
    name: 'ArrowUpIcon',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  overdue: {
    name: 'ExclamationTriangleIcon',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  reminder: {
    name: 'ClockIcon',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  system: {
    name: 'CogIcon',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  success: {
    name: 'CheckCircleIcon',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  warning: {
    name: 'ExclamationTriangleIcon',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  error: {
    name: 'XCircleIcon',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
};

export const PRIORITY_COLORS: Record<NotificationPriority, { text: string; bg: string; border: string }> = {
  low: {
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  },
  normal: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  high: {
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  urgent: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  }
};

export const TOAST_POSITIONS: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4'
};