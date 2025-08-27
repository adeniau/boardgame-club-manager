import React from 'react';
import {
  CheckIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { NotificationItemProps } from '../../types/notifications';
import {
  formatNotificationTime,
  getNotificationIcon,
  getPriorityColors,
  isNotificationNew,
  getPriorityLabel
} from '../../utils/notifications';

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  onAction,
  compact = false,
  showActions = true
}) => {
  const iconConfig = getNotificationIcon(notification.type);
  const priorityColors = getPriorityColors(notification.priority);
  const isNew = isNotificationNew(notification.createdAt);

  /**
   * Get icon component based on notification type
   */
  const getIconComponent = () => {
    const iconProps = {
      className: `h-5 w-5 ${iconConfig.color}`,
      'aria-hidden': true
    };

    switch (notification.type) {
      case 'borrowing':
        return <ArrowDownIcon {...iconProps} />;
      case 'return':
        return <ArrowUpIcon {...iconProps} />;
      case 'overdue':
        return <ExclamationTriangleIcon {...iconProps} />;
      case 'reminder':
        return <ClockIcon {...iconProps} />;
      case 'system':
        return <CogIcon {...iconProps} />;
      case 'success':
        return <CheckCircleIcon {...iconProps} />;
      case 'warning':
        return <ExclamationTriangleIcon {...iconProps} />;
      case 'error':
        return <XCircleIcon {...iconProps} />;
      default:
        return <CogIcon {...iconProps} />;
    }
  };

  /**
   * Handle mark as read action
   */
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRead && !notification.isRead) {
      onRead(notification.id);
    }
  };

  /**
   * Handle delete action
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  /**
   * Handle action button click
   */
  const handleAction = () => {
    if (onAction && notification.actionUrl) {
      onAction(notification.actionUrl);
    }
  };

  /**
   * Handle notification click
   */
  const handleNotificationClick = () => {
    // Mark as read when clicked
    if (onRead && !notification.isRead) {
      onRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      handleAction();
    }
  };

  return (
    <div
      className={`
        group relative p-4 border-b border-gray-100 last:border-b-0
        hover:bg-gray-50 transition-colors duration-150 cursor-pointer
        ${!notification.isRead ? 'bg-blue-50/50' : 'bg-white'}
        ${notification.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}
        ${notification.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}
        ${compact ? 'py-3' : 'py-4'}
      `}
      onClick={handleNotificationClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNotificationClick();
        }
      }}
      aria-label={`${notification.title}: ${notification.message}`}
    >
      {/* New notification indicator */}
      {isNew && (
        <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${iconConfig.bgColor}
          ${compact ? 'w-6 h-6' : 'w-8 h-8'}
        `}>
          {getIconComponent()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`
                font-medium text-gray-900 truncate
                ${compact ? 'text-sm' : 'text-base'}
                ${!notification.isRead ? 'font-semibold' : 'font-medium'}
              `}>
                {notification.title}
              </h4>
              
              {/* Priority badge for high/urgent notifications */}
              {(notification.priority === 'high' || notification.priority === 'urgent') && (
                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${priorityColors.text} ${priorityColors.bg}
                  ml-2
                `}>
                  {getPriorityLabel(notification.priority)}
                </span>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Mark as read button */}
                {!notification.isRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    title="Marquer comme lu"
                    aria-label="Marquer comme lu"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}

                {/* Action button */}
                {notification.actionUrl && (
                  <button
                    onClick={handleAction}
                    className="p-1 text-gray-400 hover:text-green-500 rounded"
                    title="Voir les details"
                    aria-label="Voir les details"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  title="Supprimer"
                  aria-label="Supprimer la notification"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Message */}
          <p className={`
            text-gray-600 mt-1
            ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}
          `}>
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {/* Related entity */}
              {notification.relatedEntityName && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {notification.relatedEntityName}
                </span>
              )}

              {/* Timestamp */}
              <time 
                className="text-xs text-gray-500"
                dateTime={new Date(notification.createdAt).toISOString()}
                title={new Date(notification.createdAt).toLocaleString('fr-FR')}
              >
                {formatNotificationTime(notification.createdAt)}
              </time>
            </div>

            {/* Read status indicator */}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;