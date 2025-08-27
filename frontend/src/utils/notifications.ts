import {
  type Notification,
  NotificationType,
  NotificationPriority,
  NotificationToast,
  ToastType,
  NOTIFICATION_ICONS,
  PRIORITY_COLORS,
  DEFAULT_TOAST_DURATIONS
} from '../types/notifications';

/**
 * Format notification date/time for display
 */
export const formatNotificationTime = (date: Date | string): string => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'A l\'instant';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }

  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  return notificationDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get notification icon configuration
 */
export const getNotificationIcon = (type: NotificationType) => {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.system;
};

/**
 * Get priority styling configuration
 */
export const getPriorityColors = (priority: NotificationPriority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.normal;
};

/**
 * Check if notification is new (less than 5 minutes old)
 */
export const isNotificationNew = (date: Date | string): boolean => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMinutes = (now.getTime() - notificationDate.getTime()) / (1000 * 60);
  return diffInMinutes <= 5;
};

/**
 * Check if notification is expired
 */
export const isNotificationExpired = (expiresAt?: Date | string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) <= new Date();
};

/**
 * Get notification type label in French
 */
export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    borrowing: 'Emprunt',
    return: 'Retour',
    overdue: 'Retard',
    reminder: 'Rappel',
    system: 'Systeme',
    success: 'Succes',
    warning: 'Avertissement',
    error: 'Erreur'
  };
  return labels[type] || type;
};

/**
 * Get priority label in French
 */
export const getPriorityLabel = (priority: NotificationPriority): string => {
  const labels: Record<NotificationPriority, string> = {
    low: 'Faible',
    normal: 'Normal',
    high: 'Elevee',
    urgent: 'Urgente'
  };
  return labels[priority] || priority;
};

/**
 * Sort notifications by priority and date
 */
export const sortNotifications = (notifications: Notification[]): Notification[] => {
  const priorityOrder: Record<NotificationPriority, number> = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1
  };

  return [...notifications].sort((a, b) => {
    // First sort by read status (unread first)
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }

    // Then by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Finally by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Filter notifications by criteria
 */
export const filterNotifications = (
  notifications: Notification[],
  criteria: {
    types?: NotificationType[];
    priorities?: NotificationPriority[];
    isRead?: boolean;
    searchTerm?: string;
  }
): Notification[] => {
  return notifications.filter(notification => {
    // Filter by types
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(notification.type)) {
        return false;
      }
    }

    // Filter by priorities
    if (criteria.priorities && criteria.priorities.length > 0) {
      if (!criteria.priorities.includes(notification.priority)) {
        return false;
      }
    }

    // Filter by read status
    if (criteria.isRead !== undefined) {
      if (notification.isRead !== criteria.isRead) {
        return false;
      }
    }

    // Filter by search term
    if (criteria.searchTerm && criteria.searchTerm.trim()) {
      const searchTerm = criteria.searchTerm.toLowerCase().trim();
      const searchableText = [
        notification.title,
        notification.message,
        notification.relatedEntityName || ''
      ].join(' ').toLowerCase();

      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return notifications.reduce((groups, notification) => {
    const notificationDate = new Date(notification.createdAt);
    let groupKey: string;

    if (isSameDay(notificationDate, today)) {
      groupKey = 'Aujourd\'hui';
    } else if (isSameDay(notificationDate, yesterday)) {
      groupKey = 'Hier';
    } else if (isThisWeek(notificationDate)) {
      groupKey = notificationDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      groupKey = notificationDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey]?.push(notification);

    return groups;
  }, {} as Record<string, Notification[]>);
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if date is in current week
 */
const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
};

/**
 * Create a toast notification from a regular notification
 */
export const notificationToToast = (notification: Notification): NotificationToast => {
  let toastType: ToastType;

  switch (notification.type) {
    case 'success':
      toastType = 'success';
      break;
    case 'warning':
    case 'overdue':
      toastType = 'warning';
      break;
    case 'error':
      toastType = 'error';
      break;
    default:
      toastType = 'info';
  }

  const toast: NotificationToast = {
    id: `notification-${notification.id}`,
    type: toastType,
    title: notification.title,
    message: notification.message,
    duration: DEFAULT_TOAST_DURATIONS[toastType],
    priority: notification.priority,
  };
  
  if (notification.actionUrl) {
    toast.action = {
      label: 'Voir',
      onClick: () => {
        window.location.href = notification.actionUrl!;
      }
    };
  }
  
  return toast;
};

/**
 * Generate unique ID for toast notifications
 */
export const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get notification summary text for badge/title
 */
export const getNotificationSummary = (count: number): string => {
  if (count === 0) return 'Aucune notification';
  if (count === 1) return '1 notification non lue';
  return `${count} notifications non lues`;
};

/**
 * Calculate notification statistics
 */
export const calculateNotificationStats = (notifications: Notification[]) => {
  const stats = {
    total: notifications.length,
    unread: 0,
    byType: {} as Record<NotificationType, number>,
    byPriority: {} as Record<NotificationPriority, number>,
    recent: 0 // Last 24 hours
  };

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  notifications.forEach(notification => {
    // Count unread
    if (!notification.isRead) {
      stats.unread++;
    }

    // Count by type
    stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;

    // Count by priority
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;

    // Count recent
    if (new Date(notification.createdAt) > oneDayAgo) {
      stats.recent++;
    }
  });

  return stats;
};

/**
 * Format notification for export (CSV, etc.)
 */
export const formatNotificationForExport = (notification: Notification) => {
  return {
    id: notification.id,
    type: getNotificationTypeLabel(notification.type),
    title: notification.title,
    message: notification.message,
    priority: getPriorityLabel(notification.priority),
    isRead: notification.isRead ? 'Lue' : 'Non lue',
    relatedEntity: notification.relatedEntityName || '',
    createdAt: new Date(notification.createdAt).toLocaleString('fr-FR'),
    updatedAt: new Date(notification.updatedAt).toLocaleString('fr-FR')
  };
};

/**
 * Validate notification data before sending to API
 */
export const validateNotificationData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Le titre est requis');
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('Le message est requis');
  }

  if (data.title && data.title.length > 255) {
    errors.push('Le titre ne peut pas depasser 255 caracteres');
  }

  if (data.message && data.message.length > 1000) {
    errors.push('Le message ne peut pas depasser 1000 caracteres');
  }

  if (data.type && !['borrowing', 'return', 'overdue', 'reminder', 'system', 'success', 'warning', 'error'].includes(data.type)) {
    errors.push('Type de notification invalide');
  }

  if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Priorite invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Play notification sound (if enabled in preferences)
 */
export const playNotificationSound = (type: NotificationType, enabled: boolean = false): void => {
  if (!enabled) return;

  // Create a simple audio context for notification sounds
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    const frequencies: Record<NotificationType, number> = {
      success: 800,
      borrowing: 600,
      return: 700,
      reminder: 500,
      warning: 400,
      overdue: 300,
      error: 200,
      system: 650
    };

    oscillator.frequency.setValueAtTime(frequencies[type] || 600, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

/**
 * Show browser notification (if permission granted)
 */
export const showBrowserNotification = (
  notification: Notification,
  options: {
    icon?: string;
    badge?: string;
    requireInteraction?: boolean;
  } = {}
): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      requireInteraction: options.requireInteraction || notification.priority === 'urgent',
      tag: `notification-${notification.id}`
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // Auto-close after 5 seconds unless it's urgent
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};