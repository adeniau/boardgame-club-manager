import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { NotificationCenterProps, NotificationFilters, NotificationType, NotificationPriority } from '../../types/notifications';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationItem from './NotificationItem';
import LoadingSpinner from '../ui/LoadingSpinner';

interface NotificationCenterExtendedProps extends NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterExtendedProps> = ({
  className = '',
  position = 'right',
  maxHeight = '32rem',
  onClose
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    filters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadMoreNotifications,
    refreshNotifications,
    setFilters,
    resetFilters
  } = useNotifications();

  const { t } = useLanguage();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localFilters, setLocalFilters] = useState<Partial<NotificationFilters>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Handle action navigation
   */
  const handleAction = useCallback((url: string) => {
    window.location.href = url;
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  /**
   * Handle infinite scroll
   */
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadMoreNotifications();
    }
  }, [isLoading, hasMore, loadMoreNotifications]);

  /**
   * Apply filters
   */
  const applyFilters = () => {
    setFilters(localFilters);
    setShowFilters(false);
  };

  /**
   * Reset filters
   */
  const handleResetFilters = () => {
    setLocalFilters({});
    resetFilters();
    setShowFilters(false);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Mark all as read and show feedback
   */
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setShowMenu(false);
  };

  /**
   * Clear all notifications with confirmation
   */
  const handleClearAll = async () => {
    if (window.confirm('Etes-vous sur de vouloir supprimer toutes les notifications ?')) {
      await clearAllNotifications();
      setShowMenu(false);
    }
  };

  // Setup scroll listener
  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [handleScroll]);

  return (
    <div
      className={`
        w-96 bg-white rounded-lg shadow-lg border border-gray-200 
        overflow-hidden z-50
        ${className}
      `}
      style={{ maxHeight }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                p-1 rounded-lg hover:bg-gray-200 transition-colors
                ${showFilters ? 'bg-gray-200' : ''}
              `}
              title="Filtrer"
            >
              <FunnelIcon className="h-4 w-4" />
            </button>

            {/* Refresh button */}
            <button
              onClick={refreshNotifications}
              disabled={isLoading}
              className="p-1 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Menu button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                title="Actions"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </button>

              {/* Menu dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>Tout marquer comme lu</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleClearAll}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Tout supprimer</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                title="Fermer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
            {/* Type filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={localFilters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Tous les types</option>
                <option value="borrowing">Emprunts</option>
                <option value="return">Retours</option>
                <option value="overdue">Retards</option>
                <option value="reminder">Rappels</option>
                <option value="system">Systeme</option>
              </select>
            </div>

            {/* Read status filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={localFilters.isRead === undefined ? '' : localFilters.isRead.toString()}
                onChange={(e) => 
                  handleFilterChange('isRead', 
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Toutes</option>
                <option value="false">Non lues</option>
                <option value="true">Lues</option>
              </select>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Priorite
              </label>
              <select
                value={localFilters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Toutes les priorites</option>
                <option value="urgent">Urgente</option>
                <option value="high">Elevee</option>
                <option value="normal">Normal</option>
                <option value="low">Faible</option>
              </select>
            </div>

            {/* Filter actions */}
            <div className="flex space-x-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Appliquer
              </button>
              <button
                onClick={handleResetFilters}
                className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: 'calc(100% - 4rem)' }}
      >
        {/* Loading state */}
        {isLoading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="text-gray-400 mb-2">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM9 12h6m-6-4h6m2 5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2h14a2 2 0 002-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Aucune notification</p>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length > 0 && (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onAction={handleAction}
                compact={true}
                showActions={true}
              />
            ))}

            {/* Load more indicator */}
            {isLoading && notifications.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && notifications.length > 0 && (
              <div className="text-center py-4 text-xs text-gray-500">
                Toutes les notifications ont ete chargees
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;