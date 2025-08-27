import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationBellProps } from '../../types/notifications';
import { useNotifications } from '../../context/NotificationContext';
import { useNotificationBadge } from '../../hooks/notifications';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  showBadge = true,
  badgeVariant = 'danger',
  onClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { unreadCount } = useNotifications();
  const { formattedCount, isAnimating, summary } = useNotificationBadge(unreadCount, {
    updateTitle: true,
    animationDuration: 300
  });

  /**
   * Toggle notification center dropdown
   */
  const handleToggle = () => {
    setIsOpen(prev => {
      const newState = !prev;
      if (onClick) {
        onClick();
      }
      return newState;
    });
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        bellRef.current &&
        dropdownRef.current &&
        !bellRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /**
   * Close dropdown on escape key
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  /**
   * Get badge color classes based on variant
   */
  const getBadgeColorClasses = () => {
    switch (badgeVariant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'secondary':
        return 'bg-gray-500 text-white';
      case 'danger':
      default:
        return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleToggle}
        className={`
          relative p-2 text-gray-600 hover:text-gray-900 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          rounded-full hover:bg-gray-100 transition-colors duration-200
          ${isOpen ? 'bg-gray-100 text-gray-900' : ''}
          ${className}
        `}
        title={summary}
        aria-label={summary}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon */}
        <BellIcon 
          className={`
            h-6 w-6 transition-transform duration-200
            ${isAnimating ? 'animate-pulse' : ''}
            ${isOpen ? 'transform rotate-12' : ''}
          `} 
        />

        {/* Notification Badge */}
        {showBadge && unreadCount > 0 && (
          <span
            className={`
              absolute -top-1 -right-1 inline-flex items-center justify-center
              px-1.5 py-0.5 text-xs font-medium rounded-full
              min-w-[1.25rem] h-5
              transform transition-all duration-200
              ${getBadgeColorClasses()}
              ${isAnimating ? 'animate-bounce scale-110' : 'scale-100'}
            `}
            aria-hidden="true"
          >
            {formattedCount}
          </span>
        )}

        {/* Pulse Animation for New Notifications */}
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex rounded-full h-5 w-5 opacity-75">
            <span 
              className={`
                animate-ping absolute inline-flex h-full w-full rounded-full 
                ${badgeVariant === 'primary' ? 'bg-blue-400' : 
                  badgeVariant === 'secondary' ? 'bg-gray-400' : 'bg-red-400'}
              `}
            />
          </span>
        )}
      </button>

      {/* Notification Center Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 z-50"
        >
          <NotificationCenter 
            position="right"
            maxHeight="32rem"
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;