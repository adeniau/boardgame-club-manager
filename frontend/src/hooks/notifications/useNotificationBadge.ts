import { useState, useEffect, useRef } from 'react';
import { UseNotificationBadgeOptions } from '../../types/notifications';
import { getNotificationSummary } from '../../utils/notifications';

interface UseNotificationBadgeReturn {
  count: number;
  isAnimating: boolean;
  formattedCount: string;
  summary: string;
  triggerAnimation: () => void;
}

export const useNotificationBadge = (
  initialCount: number = 0,
  options: UseNotificationBadgeOptions = {}
): UseNotificationBadgeReturn => {
  const {
    updateTitle = true,
    animationDuration = 500
  } = options;

  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(initialCount);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Format count for display (e.g., "99+" for counts over 99)
   */
  const formatCount = (num: number): string => {
    if (num === 0) return '';
    if (num > 99) return '99+';
    return num.toString();
  };

  /**
   * Trigger badge animation
   */
  const triggerAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);
  };

  /**
   * Update count and trigger animation if increased
   */
  const updateCount = (newCount: number) => {
    const prevCount = prevCountRef.current;
    setCount(newCount);
    prevCountRef.current = newCount;

    // Trigger animation if count increased
    if (newCount > prevCount) {
      triggerAnimation();
    }

    // Update document title if enabled
    if (updateTitle) {
      updateDocumentTitle(newCount);
    }
  };

  /**
   * Update document title with notification count
   */
  const updateDocumentTitle = (notificationCount: number) => {
    const baseTitle = 'BCM - Board Game Club Manager';
    
    if (notificationCount > 0) {
      document.title = `(${notificationCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  };

  // Update count when initialCount changes (from parent)
  useEffect(() => {
    updateCount(initialCount);
  }, [initialCount]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && count > 0) {
        // Optional: You could trigger a subtle animation when user returns to tab
        // triggerAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [count]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Reset document title on unmount
      if (updateTitle) {
        document.title = 'BCM - Board Game Club Manager';
      }
    };
  }, [updateTitle]);

  return {
    count,
    isAnimating,
    formattedCount: formatCount(count),
    summary: getNotificationSummary(count),
    triggerAnimation,
  };
};