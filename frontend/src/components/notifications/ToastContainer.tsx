import React from 'react';
import { createPortal } from 'react-dom';
import { NotificationPosition } from '../../types/notifications';
import { useNotifications } from '../../context/NotificationContext';
import NotificationToast from './NotificationToast';

interface ToastContainerProps {
  position?: NotificationPosition;
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className = ''
}) => {
  const { toasts, dismissToast } = useNotifications();

  // Create portal to render toasts at document body level
  const toastElements = (
    <div
      className={`
        fixed inset-0 pointer-events-none z-50
        ${className}
      `}
    >
      <div className={`
        fixed space-y-2
        ${position === 'top-right' ? 'top-4 right-4' : ''}
        ${position === 'top-left' ? 'top-4 left-4' : ''}
        ${position === 'bottom-right' ? 'bottom-4 right-4' : ''}
        ${position === 'bottom-left' ? 'bottom-4 left-4' : ''}
      `}>
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            position={position}
          />
        ))}
      </div>
    </div>
  );

  // Only render if there are toasts and if we're in a browser environment
  if (typeof window === 'undefined' || toasts.length === 0) {
    return null;
  }

  return createPortal(toastElements, document.body);
};

export default ToastContainer;