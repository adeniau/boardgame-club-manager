import {
  Notification,
  NotificationFilters,
  NotificationsResponse,
  NotificationStats,
  CreateNotificationRequest,
  CreateSystemNotificationRequest,
  NotificationApiResponse,
  UnreadCountApiResponse,
  NotificationStatsApiResponse,
  CreateNotificationApiResponse,
  ApiResponse,
  DEFAULT_NOTIFICATION_FILTERS
} from '../types/notifications';

const API_BASE_URL = '/api/notifications';

class NotificationService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('bcm_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - but don't redirect if we're already on login page
        localStorage.removeItem('bcm_token');
        this.token = null;
        // Only redirect if we're not already on the login page and not in a redirect loop
        if (window.location.pathname !== '/login' && !window.location.href.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }

      const errorData = await response.json().catch(() => ({
        message: 'Une erreur est survenue'
      }));

      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }

  /**
   * Get notifications with filtering and pagination
   */
  async getNotifications(filters: Partial<NotificationFilters> = {}): Promise<NotificationsResponse> {
    if (!this.token) {
      throw new Error('Authentication required');
    }
    
    const mergedFilters = { ...DEFAULT_NOTIFICATION_FILTERS, ...filters };
    const queryString = this.buildQueryString(mergedFilters);
    
    try {
      const response = await fetch(`${API_BASE_URL}?${queryString}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data: NotificationApiResponse = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    if (!this.token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/unread`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data: UnreadCountApiResponse = await this.handleResponse(response);
      return data.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data: NotificationStatsApiResponse = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Create a new notification (admin only)
   */
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(notificationData),
      });

      const data: CreateNotificationApiResponse = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create a system notification (admin only)
   */
  async createSystemNotification(notificationData: CreateSystemNotificationRequest): Promise<{ created: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(notificationData),
      });

      const data: ApiResponse<{ created: number }> = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mark-all-read`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      const data: ApiResponse<{ updatedCount: number }> = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a specific notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<{ deletedCount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/clear-all`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data: ApiResponse<{ deletedCount: number }> = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Clean up expired notifications (admin only)
   */
  async cleanupExpiredNotifications(): Promise<{ deletedCount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/cleanup-expired`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const data: ApiResponse<{ deletedCount: number }> = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  /**
   * Check for overdue borrowings and create notifications (admin only)
   */
  async checkOverdueNotifications(): Promise<{ overdueFound: number; created: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-overdue`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const data: ApiResponse<{ overdueFound: number; created: number }> = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error checking overdue notifications:', error);
      throw error;
    }
  }

  /**
   * Check for due soon borrowings and create notifications (admin only)
   */
  async checkDueSoonNotifications(): Promise<{ dueSoonFound: number; created: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-due-soon`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const data: ApiResponse<{ dueSoonFound: number; created: number }> = await this.handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error checking due soon notifications:', error);
      throw error;
    }
  }

  /**
   * Update auth token
   */
  updateToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('bcm_token', token);
    } else {
      localStorage.removeItem('bcm_token');
    }
  }

  /**
   * Subscribe to real-time notifications (polling-based)
   */
  subscribeToNotifications(
    callback: (notifications: Notification[], unreadCount: number) => void,
    options: {
      interval?: number;
      filters?: Partial<NotificationFilters>;
    } = {}
  ): () => void {
    const { interval = 30000, filters = {} } = options;
    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const poll = async () => {
      if (!isActive) return;

      try {
        // Fetch latest notifications and unread count in parallel
        const [notificationsResponse, unreadCount] = await Promise.all([
          this.getNotifications({ ...filters, limit: 50, offset: 0 }),
          this.getUnreadCount()
        ]);

        if (isActive) {
          callback(notificationsResponse.notifications, unreadCount);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }

      if (isActive) {
        timeoutId = setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Return unsubscribe function
    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Smart polling that adjusts frequency based on activity
   */
  createSmartPolling(
    callback: (notifications: Notification[], unreadCount: number) => void,
    options: {
      baseInterval?: number;
      activeInterval?: number;
      filters?: Partial<NotificationFilters>;
    } = {}
  ): () => void {
    const { baseInterval = 60000, activeInterval = 15000, filters = {} } = options;
    let currentInterval = baseInterval;
    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // Adjust polling frequency based on document visibility
    const handleVisibilityChange = () => {
      currentInterval = document.hidden ? baseInterval : activeInterval;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange(); // Set initial interval

    const poll = async () => {
      if (!isActive) return;

      try {
        const [notificationsResponse, unreadCount] = await Promise.all([
          this.getNotifications({ ...filters, limit: 50, offset: 0 }),
          this.getUnreadCount()
        ]);

        if (isActive) {
          callback(notificationsResponse.notifications, unreadCount);
        }
      } catch (error) {
        console.error('Error in smart polling:', error);
      }

      if (isActive) {
        timeoutId = setTimeout(poll, currentInterval);
      }
    };

    // Start polling
    poll();

    // Return unsubscribe function
    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }
}

export default new NotificationService();