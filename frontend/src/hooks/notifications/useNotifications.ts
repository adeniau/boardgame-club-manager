import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  NotificationFilters,
  UseNotificationsOptions,
  DEFAULT_NOTIFICATION_FILTERS
} from '../../types/notifications';
import notificationService from '../../services/notificationService';
import { sortNotifications } from '../../utils/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  unreadCount: number;
  filters: NotificationFilters;
  
  // Actions
  fetchNotifications: (options?: Partial<NotificationFilters>) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  resetFilters: () => void;
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    autoFetch = true,
    polling = false,
    pollingInterval = 30000,
    initialFilters = {}
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFiltersState] = useState<NotificationFilters>({
    ...DEFAULT_NOTIFICATION_FILTERS,
    ...initialFilters
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  /**
   * Fetch notifications with current filters
   */
  const fetchNotifications = useCallback(async (options: Partial<NotificationFilters> = {}) => {
    const mergedFilters = { ...filters, ...options };
    
    try {
      setIsLoading(true);
      setError(null);

      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        notificationService.getNotifications(mergedFilters),
        mergedFilters.offset === 0 ? notificationService.getUnreadCount() : Promise.resolve(unreadCount)
      ]);

      if (mergedFilters.offset === 0) {
        // Fresh fetch - replace all notifications
        setNotifications(sortNotifications(notificationsResponse.notifications));
        if (typeof unreadCountResponse === 'number') {
          setUnreadCount(unreadCountResponse);
        }
      } else {
        // Load more - append to existing notifications
        setNotifications(prev => {
          const combined = [...prev, ...notificationsResponse.notifications];
          return sortNotifications(combined);
        });
      }

      setHasMore(notificationsResponse.pagination.hasMore);
      
      // Update filters with actual used values
      if (mergedFilters !== filters) {
        setFiltersState(mergedFilters);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, unreadCount]);

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextOffset = notifications.length;
    await fetchNotifications({ offset: nextOffset });
  }, [hasMore, isLoading, notifications.length, fetchNotifications]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationService.deleteNotification(id);

      // Update local state
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));

      // Update unread count if the deleted notification was unread
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAllNotifications();

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Error clearing all notifications:', err);
    }
  }, []);

  /**
   * Refresh notifications (reset and fetch)
   */
  const refresh = useCallback(async () => {
    await fetchNotifications({ ...filters, offset: 0 });
  }, [fetchNotifications, filters]);

  /**
   * Set filters and trigger fetch
   */
  const setFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    const mergedFilters = { ...filters, ...newFilters, offset: 0 };
    setFiltersState(mergedFilters);
  }, [filters]);

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    const defaultFilters = { ...DEFAULT_NOTIFICATION_FILTERS, ...initialFilters };
    setFiltersState(defaultFilters);
  }, [initialFilters]);

  /**
   * Setup polling for real-time updates
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current || !polling) return;

    pollingIntervalRef.current = setInterval(async () => {
      if (!isActiveRef.current || isLoading) return;

      try {
        // Only fetch first page to check for new notifications
        const response = await notificationService.getNotifications({
          ...filters,
          limit: 50,
          offset: 0
        });

        const newUnreadCount = await notificationService.getUnreadCount();

        // Update notifications if we're on the first page
        if (filters.offset === 0) {
          setNotifications(sortNotifications(response.notifications));
        }

        setUnreadCount(newUnreadCount);
      } catch (err) {
        console.error('Error during polling:', err);
      }
    }, pollingInterval);
  }, [polling, pollingInterval, filters, isLoading]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Auto-fetch notifications on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Refetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [filters]);

  // Setup/cleanup polling
  useEffect(() => {
    if (polling) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [polling, startPolling, stopPolling]);

  // Handle page visibility for efficient polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (!document.hidden && polling) {
        // Resume polling when page becomes visible
        stopPolling();
        startPolling();
      } else if (document.hidden) {
        // Pause polling when page is hidden
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [polling, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    notifications,
    isLoading,
    error,
    hasMore,
    unreadCount,
    filters,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
    setFilters,
    resetFilters,
  };
};