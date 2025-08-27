import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { NotificationToastProps, TOAST_POSITIONS } from '../../types/notifications';

const NotificationToast: React.FC<NotificationToastProps> = ({
  toast,
  onDismiss,
  position = 'top-right'
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  /**
   * Get icon based on toast type
   */
  const getIcon = () => {
    const iconProps = {
      className: 'h-5 w-5',
      'aria-hidden': true
    };

    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon {...iconProps} className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon {...iconProps} className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircleIcon {...iconProps} className="h-5 w-5 text-red-400" />;
      case 'info':
      default:
        return <InformationCircleIcon {...iconProps} className="h-5 w-5 text-blue-400" />;
    }
  };

  /**
   * Get styling based on toast type
   */
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          progress: 'bg-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          progress: 'bg-yellow-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          progress: 'bg-red-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          progress: 'bg-blue-500'
        };
    }
  };

  /**
   * Handle dismiss action
   */
  const handleDismiss = () => {
    if (onDismiss) {
      setIsExiting(true);
      setTimeout(() => {
        onDismiss(toast.id);
      }, 150); // Match exit animation duration
    }
  };

  /**
   * Handle action button click
   */
  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
    }
    handleDismiss();
  };

  const styles = getStyles();

  // Progress bar animation
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, toast.duration! - elapsed);
      const progressPercent = (remaining / toast.duration!) * 100;
      
      setProgress(progressPercent);

      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [toast.duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed z-50 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5
        transform transition-all duration-300 ease-in-out
        ${TOAST_POSITIONS[position]}
        ${styles.bg} ${styles.border}
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${position.includes('left') ? (isExiting ? '-translate-x-full' : 'translate-x-0') : ''}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${styles.title}`}>
              {toast.title}
            </p>
            <p className={`mt-1 text-sm ${styles.message}`}>
              {toast.message}
            </p>

            {/* Action button */}
            {toast.action && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAction}
                  className={`
                    inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${toast.action.variant === 'primary' 
                      ? `bg-${toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : toast.type === 'success' ? 'green' : 'blue'}-600 text-white hover:bg-${toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : toast.type === 'success' ? 'green' : 'blue'}-700 focus:ring-${toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : toast.type === 'success' ? 'green' : 'blue'}-500`
                      : `bg-white text-${toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : toast.type === 'success' ? 'green' : 'blue'}-600 hover:bg-gray-50 border-${toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : toast.type === 'success' ? 'green' : 'blue'}-300`
                    }
                  `}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className={`
                inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                ${styles.message} hover:${styles.title}
                focus:ring-${toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : toast.type === 'success' ? 'green' : 'blue'}-500
              `}
              aria-label="Fermer la notification"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className={`h-full transition-all duration-75 ease-linear ${styles.progress}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Priority indicator for urgent notifications */}
        {toast.priority === 'urgent' && (
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
        )}
      </div>
    </div>
  );
};

export default NotificationToast;