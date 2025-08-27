import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  NotificationFilters,
  NotificationToast,
  NotificationContextType,
  DEFAULT_NOTIFICATION_FILTERS
} from '../types/notifications';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import {
  sortNotifications,
  notificationToToast,
  generateToastId,
  playNotificationSound,
  showBrowserNotification
} from '../utils/notifications';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState<NotificationFilters>(DEFAULT_NOTIFICATION_FILTERS);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const { user, isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  // Refs for managing subscriptions and intervals
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastNotificationCountRef = useRef<number>(0);

  /**
   * Fetch notifications with current filters
   */
  const fetchNotifications = useCallback(async (options: Partial<NotificationFilters> = {}) => {
    if (!user || !isAuthenticated) return;

    try {
      setIsLoading(true);
      const mergedFilters = { ...filters, ...options };
      const response = await notificationService.getNotifications(mergedFilters);

      if (mergedFilters.offset === 0) {
        // Fresh fetch - replace all notifications
        setNotifications(sortNotifications(response.notifications));
      } else {
        // Load more - append to existing notifications
        setNotifications(prev => {
          const combined = [...prev, ...response.notifications];
          return sortNotifications(combined);
        });
      }

      setHasMore(response.pagination.hasMore);
      
      // Update filters with actual used values
      setFiltersState(mergedFilters);
    } catch (error) {
      // Only show error toast if it's not an authentication error
      if (!(error instanceof Error && error.message?.includes('Authentication required'))) {
        console.error('Error fetching notifications:', error);
        showToast({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les notifications'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, filters]);

  /**
   * Load more notifications (pagination)
   */
  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextOffset = notifications.length;
    await fetchNotifications({ ...filters, offset: nextOffset });
  }, [hasMore, isLoading, notifications.length, filters, fetchNotifications]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de marquer la notification comme lue'
      });
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);

      showToast({
        type: 'success',
        title: 'Succes',
        message: `${result.updatedCount} notifications marquees comme lues`
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de marquer toutes les notifications comme lues'
      });
    }
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update unread count if the deleted notification was unread
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      showToast({
        type: 'success',
        title: 'Succes',
        message: 'Notification supprimee'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer la notification'
      });
    }
  }, [notifications]);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(async () => {
    try {
      const result = await notificationService.clearAllNotifications();

      // Update local state
      setNotifications([]);
      setUnreadCount(0);

      showToast({
        type: 'success',
        title: 'Succes',
        message: `${result.deletedCount} notifications supprimees`
      });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer toutes les notifications'
      });
    }
  }, []);

  /**
   * Refresh notifications (reset and fetch)
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications({ ...filters, offset: 0 });
  }, [fetchNotifications, filters]);

  /**
   * Set filters and trigger fetch
   */
  const setFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    const mergedFilters = { ...filters, ...newFilters, offset: 0 };
    setFiltersState(mergedFilters);
    fetchNotifications(mergedFilters);
  }, [filters, fetchNotifications]);

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_NOTIFICATION_FILTERS);
    fetchNotifications(DEFAULT_NOTIFICATION_FILTERS);
  }, [fetchNotifications]);

  /**
   * Show a toast notification
   */
  const showToast = useCallback((toast: Omit<NotificationToast, 'id'>) => {
    const toastWithId = {
      ...toast,
      id: generateToastId(),
    };

    setToasts(prev => [...prev, toastWithId]);

    // Auto-dismiss after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      dismissToast(toastWithId.id);
    }, duration);

    // Play sound if enabled
    if (preferences?.notifications_enabled && toast.type === 'info') {
      playNotificationSound('system', true);
    }
  }, [preferences?.notifications_enabled]);

  /**
   * Dismiss a toast notification
   */
  const dismissToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  /**
   * Clear all toast notifications
   */
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Start polling for real-time updates
   */
  const startPolling = useCallback(() => {
    if (!user || !isAuthenticated || unsubscribeRef.current) return;

    const unsubscribe = notificationService.createSmartPolling(
      (newNotifications, newUnreadCount) => {
        // Check for new notifications
        const newNotificationCount = newNotifications.length;
        if (newNotificationCount > lastNotificationCountRef.current && lastNotificationCountRef.current > 0) {
          // New notifications detected
          const newOnes = newNotifications.slice(0, newNotificationCount - lastNotificationCountRef.current);
          
          newOnes.forEach(notification => {
            // Show toast for new notifications if preferences allow
            if (preferences?.notifications_enabled && 
                preferences?.notification_types.includes(notification.type as any)) {
              const toast = notificationToToast(notification);
              showToast(toast);

              // Show browser notification if enabled
              showBrowserNotification(notification);
            }
          });
        }

        lastNotificationCountRef.current = newNotificationCount;
        setNotifications(sortNotifications(newNotifications));
        setUnreadCount(newUnreadCount);
      },
      {
        baseInterval: 60000, // 1 minute when inactive
        activeInterval: 15000, // 15 seconds when active
        filters: { limit: 50, offset: 0 }
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, [user, isAuthenticated, preferences, showToast]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  /**
   * Update unread count independently
   */
  const updateUnreadCount = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently handle authentication errors to prevent console spam
      if (!(error instanceof Error && error.message?.includes('Authentication required'))) {
        console.error('Error updating unread count:', error);
      }
    }
  }, [user, isAuthenticated]);

  // Initialize notifications when user logs in
  useEffect(() => {
    if (user && isAuthenticated) {
      // Update auth token in service
      notificationService.updateToken(localStorage.getItem('bcm_token'));
      
      // Fetch initial notifications
      fetchNotifications();
      updateUnreadCount();
      
      // Start real-time polling
      startPolling();
    } else {
      // Clean up when user logs out
      setNotifications([]);
      setUnreadCount(0);
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [user, isAuthenticated, fetchNotifications, updateUnreadCount, startPolling, stopPolling]);

  // Update preferences in notification service when they change
  useEffect(() => {
    if (preferences && user && isAuthenticated) {
      // Restart polling with updated preferences
      stopPolling();
      startPolling();
    }
  }, [preferences, user, isAuthenticated, startPolling, stopPolling]);

  // Page visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isAuthenticated) {
        // Refresh notifications when page becomes visible
        updateUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isAuthenticated, updateUnreadCount]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    filters,
    toasts,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    setFilters,
    resetFilters,
    showToast,
    dismissToast,
    clearAllToasts,
    startPolling,
    stopPolling,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;