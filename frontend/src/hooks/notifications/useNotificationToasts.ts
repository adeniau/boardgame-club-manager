import { useState, useCallback, useRef, useEffect } from 'react';
import {
  NotificationToast,
  ToastType,
  UseNotificationToastsOptions,
  NotificationPosition
} from '../../types/notifications';
import { generateToastId } from '../../utils/notifications';

interface UseNotificationToastsReturn {
  toasts: NotificationToast[];
  showToast: (toast: Omit<NotificationToast, 'id'>) => void;
  dismissToast: (toastId: string) => void;
  clearAll: () => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: 10000
};

export const useNotificationToasts = (
  options: UseNotificationToastsOptions = {}
): UseNotificationToastsReturn => {
  const {
    position = 'top-right',
    defaultDuration = 5000,
    maxToasts = 5
  } = options;

  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Show a toast notification
   */
  const showToast = useCallback((toast: Omit<NotificationToast, 'id'>) => {
    const toastId = generateToastId();
    const duration = toast.duration || DEFAULT_DURATIONS[toast.type] || defaultDuration;

    const newToast: NotificationToast = {
      ...toast,
      id: toastId,
      duration
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      
      // Limit number of toasts
      if (updated.length > maxToasts) {
        // Remove oldest toasts
        const toRemove = updated.slice(0, updated.length - maxToasts);
        toRemove.forEach(t => {
          const timeout = timeoutsRef.current.get(t.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(t.id);
          }
        });
        return updated.slice(-maxToasts);
      }
      
      return updated;
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      const timeout = setTimeout(() => {
        dismissToast(toastId);
      }, duration);

      timeoutsRef.current.set(toastId, timeout);
    }
  }, [defaultDuration, maxToasts]);

  /**
   * Dismiss a specific toast
   */
  const dismissToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));

    // Clear timeout if exists
    const timeout = timeoutsRef.current.get(toastId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(toastId);
    }
  }, []);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    setToasts([]);
  }, []);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    showToast({
      type: 'success',
      title,
      message,
      duration
    });
  }, [showToast]);

  /**
   * Show error toast
   */
  const showError = useCallback((title: string, message: string, duration?: number) => {
    showToast({
      type: 'error',
      title,
      message,
      duration
    });
  }, [showToast]);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    showToast({
      type: 'warning',
      title,
      message,
      duration
    });
  }, [showToast]);

  /**
   * Show info toast
   */
  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    showToast({
      type: 'info',
      title,
      message,
      duration
    });
  }, [showToast]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};