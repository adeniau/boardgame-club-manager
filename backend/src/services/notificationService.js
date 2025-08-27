const db = require('../middleware/db');

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(notificationData) {
    const {
      userId,
      type,
      title,
      message,
      relatedEntityType = null,
      relatedEntityId = null,
      actionUrl = null,
      priority = 'normal',
      expiresAt = null
    } = notificationData;

    const query = `
      INSERT INTO notifications 
      (user_id, type, title, message, related_entity_type, related_entity_id, action_url, priority, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await db.query(query, [
        userId, type, title, message, relatedEntityType, relatedEntityId, 
        actionUrl, priority, expiresAt
      ]);

      return {
        success: true,
        data: {
          id: result.insertId,
          userId,
          type,
          title,
          message,
          relatedEntityType,
          relatedEntityId,
          actionUrl,
          priority,
          expiresAt,
          isRead: false,
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get notifications for a specific user with filtering and pagination
   */
  async getNotificationsForUser(userId, options = {}) {
    const {
      type = null,
      isRead = null,
      priority = null,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    let query = `
      SELECT n.*, 
        CASE 
          WHEN n.related_entity_type = 'game' THEN g.name
          WHEN n.related_entity_type = 'member' THEN CONCAT(m.firstname, ' ', m.name)
          WHEN n.related_entity_type = 'borrowing' THEN CONCAT(g2.name, ' - ', m2.firstname, ' ', m2.name)
          ELSE NULL
        END as related_entity_name
      FROM notifications n
      LEFT JOIN games g ON n.related_entity_type = 'game' AND n.related_entity_id = g.id
      LEFT JOIN members m ON n.related_entity_type = 'member' AND n.related_entity_id = m.id
      LEFT JOIN borrowings b ON n.related_entity_type = 'borrowing' AND n.related_entity_id = b.id
      LEFT JOIN games g2 ON b.id_game = g2.id
      LEFT JOIN members m2 ON b.id_member = m2.id
      WHERE n.user_id = ? 
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
    `;

    const params = [userId];

    // Add filters
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }

    if (isRead !== null) {
      query += ' AND n.is_read = ?';
      params.push(isRead ? 1 : 0);
    }

    if (priority) {
      query += ' AND n.priority = ?';
      params.push(priority);
    }

    // Add sorting and pagination
    query += ` ORDER BY n.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const [notifications] = await db.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM notifications n 
        WHERE n.user_id = ? 
          AND (n.expires_at IS NULL OR n.expires_at > NOW())
      `;
      const countParams = [userId];

      if (type) {
        countQuery += ' AND n.type = ?';
        countParams.push(type);
      }

      if (isRead !== null) {
        countQuery += ' AND n.is_read = ?';
        countParams.push(isRead ? 1 : 0);
      }

      if (priority) {
        countQuery += ' AND n.priority = ?';
        countParams.push(priority);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      return {
        success: true,
        data: {
          notifications: notifications.map(this.formatNotification),
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? 
        AND is_read = 0 
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

    try {
      const [result] = await db.query(query, [userId]);
      return {
        success: true,
        data: { count: result[0].count }
      };
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error('Failed to get unread count');
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = 1, updated_at = NOW() 
      WHERE id = ? AND user_id = ?
    `;

    try {
      const [result] = await db.query(query, [notificationId, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Notification not found or access denied');
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = 1, updated_at = NOW() 
      WHERE user_id = ? AND is_read = 0
    `;

    try {
      const [result] = await db.query(query, [userId]);
      return {
        success: true,
        data: { updatedCount: result.affectedRows }
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    const query = `
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `;

    try {
      const [result] = await db.query(query, [notificationId, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Notification not found or access denied');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAllNotifications(userId) {
    const query = `
      DELETE FROM notifications 
      WHERE user_id = ?
    `;

    try {
      const [result] = await db.query(query, [userId]);
      return {
        success: true,
        data: { deletedCount: result.affectedRows }
      };
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw new Error('Failed to clear all notifications');
    }
  }

  /**
   * Get notification type statistics for a user
   */
  async getNotificationStats(userId) {
    const query = `
      SELECT 
        type,
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
        priority,
        COUNT(*) as priority_count
      FROM notifications 
      WHERE user_id = ? 
        AND (expires_at IS NULL OR expires_at > NOW())
      GROUP BY type, priority
      ORDER BY type, priority
    `;

    try {
      const [results] = await db.query(query, [userId]);
      
      const stats = {
        byType: {},
        byPriority: {}
      };

      results.forEach(row => {
        if (!stats.byType[row.type]) {
          stats.byType[row.type] = { total: 0, unread: 0 };
        }
        stats.byType[row.type].total += row.total;
        stats.byType[row.type].unread += row.unread;

        if (!stats.byPriority[row.priority]) {
          stats.byPriority[row.priority] = 0;
        }
        stats.byPriority[row.priority] += row.priority_count;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error('Failed to get notification stats');
    }
  }

  /**
   * Clean up expired notifications
   */
  async clearExpiredNotifications() {
    const query = `
      DELETE FROM notifications 
      WHERE expires_at IS NOT NULL 
        AND expires_at <= NOW()
    `;

    try {
      const [result] = await db.query(query);
      console.log(`Cleaned up ${result.affectedRows} expired notifications`);
      return {
        success: true,
        data: { deletedCount: result.affectedRows }
      };
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw new Error('Failed to clean up expired notifications');
    }
  }

  /**
   * Create borrowing-related notifications
   */
  async createBorrowingNotifications(borrowingData) {
    const { borrowingId, memberId, gameId, gameName, memberName, type } = borrowingData;
    
    const notifications = [];

    try {
      // Get all admin users to notify them
      const [admins] = await db.query('SELECT id FROM members WHERE admin = "1"');
      
      let title, message, actionUrl;

      switch (type) {
        case 'new_borrowing':
          title = 'Nouvel emprunt';
          message = `${memberName} a emprunte le jeu "${gameName}"`;
          actionUrl = `/borrowings/${borrowingId}`;
          break;
          
        case 'return':
          title = 'Retour de jeu';
          message = `${memberName} a rendu le jeu "${gameName}"`;
          actionUrl = `/borrowings/${borrowingId}`;
          break;
          
        case 'overdue':
          title = 'Emprunt en retard';
          message = `L'emprunt du jeu "${gameName}" par ${memberName} est en retard`;
          actionUrl = `/borrowings/${borrowingId}`;
          break;
          
        case 'due_soon':
          title = 'Retour prevu demain';
          message = `N'oubliez pas de rendre "${gameName}" demain`;
          actionUrl = `/borrowings/${borrowingId}`;
          // This notification goes to the borrower
          notifications.push({
            userId: memberId,
            type: 'reminder',
            title,
            message,
            relatedEntityType: 'borrowing',
            relatedEntityId: borrowingId,
            actionUrl,
            priority: 'normal'
          });
          break;
      }

      // Create notifications for admins (except for due_soon which goes to member)
      if (type !== 'due_soon') {
        for (const admin of admins) {
          notifications.push({
            userId: admin.id,
            type: type === 'new_borrowing' ? 'borrowing' : 'return',
            title,
            message,
            relatedEntityType: 'borrowing',
            relatedEntityId: borrowingId,
            actionUrl,
            priority: type === 'overdue' ? 'high' : 'normal'
          });
        }
      }

      // Create all notifications
      const results = [];
      for (const notificationData of notifications) {
        const result = await this.createNotification(notificationData);
        results.push(result);
      }

      return {
        success: true,
        data: { created: results.length }
      };

    } catch (error) {
      console.error('Error creating borrowing notifications:', error);
      throw new Error('Failed to create borrowing notifications');
    }
  }

  /**
   * Create system notification for all users or specific user
   */
  async createSystemNotification(notificationData) {
    const { title, message, priority = 'normal', targetUserId = null, expiresAt = null } = notificationData;

    try {
      let users = [];

      if (targetUserId) {
        users = [{ id: targetUserId }];
      } else {
        // Get all users
        const [allUsers] = await db.query('SELECT id FROM members');
        users = allUsers;
      }

      const results = [];
      for (const user of users) {
        const result = await this.createNotification({
          userId: user.id,
          type: 'system',
          title,
          message,
          priority,
          expiresAt
        });
        results.push(result);
      }

      return {
        success: true,
        data: { created: results.length }
      };

    } catch (error) {
      console.error('Error creating system notification:', error);
      throw new Error('Failed to create system notification');
    }
  }

  /**
   * Format notification object for API response
   */
  formatNotification(notification) {
    return {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedEntityType: notification.related_entity_type,
      relatedEntityId: notification.related_entity_id,
      relatedEntityName: notification.related_entity_name,
      actionUrl: notification.action_url,
      isRead: notification.is_read === 1,
      priority: notification.priority,
      expiresAt: notification.expires_at,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at
    };
  }

  /**
   * Check for overdue borrowings and create notifications
   */
  async createOverdueNotifications() {
    try {
      // Get borrowings that are overdue (assuming 14 days loan period)
      const query = `
        SELECT 
          b.id,
          b.id_member,
          b.id_game,
          b.borrow_date,
          g.name as game_name,
          CONCAT(m.firstname, ' ', m.name) as member_name,
          DATEDIFF(NOW(), STR_TO_DATE(b.borrow_date, '%Y-%m-%d')) as days_overdue
        FROM borrowings b
        JOIN games g ON b.id_game = g.id
        JOIN members m ON b.id_member = m.id
        WHERE b.return_date IS NULL 
          AND DATEDIFF(NOW(), STR_TO_DATE(b.borrow_date, '%Y-%m-%d')) > 14
          AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.related_entity_type = 'borrowing' 
              AND n.related_entity_id = b.id 
              AND n.type = 'overdue'
              AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
          )
      `;

      const [overdueBorrowings] = await db.query(query);

      let created = 0;
      for (const borrowing of overdueBorrowings) {
        await this.createBorrowingNotifications({
          borrowingId: borrowing.id,
          memberId: borrowing.id_member,
          gameId: borrowing.id_game,
          gameName: borrowing.game_name,
          memberName: borrowing.member_name,
          type: 'overdue'
        });
        created++;
      }

      return {
        success: true,
        data: { overdueFound: overdueBorrowings.length, created }
      };

    } catch (error) {
      console.error('Error creating overdue notifications:', error);
      throw new Error('Failed to create overdue notifications');
    }
  }

  /**
   * Check for due soon borrowings and create notifications
   */
  async createDueSoonNotifications() {
    try {
      // Get borrowings that are due tomorrow (assuming 14 days loan period)
      const query = `
        SELECT 
          b.id,
          b.id_member,
          b.id_game,
          b.borrow_date,
          g.name as game_name,
          CONCAT(m.firstname, ' ', m.name) as member_name
        FROM borrowings b
        JOIN games g ON b.id_game = g.id
        JOIN members m ON b.id_member = m.id
        WHERE b.return_date IS NULL 
          AND DATEDIFF(NOW(), STR_TO_DATE(b.borrow_date, '%Y-%m-%d')) = 13
          AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.related_entity_type = 'borrowing' 
              AND n.related_entity_id = b.id 
              AND n.type = 'reminder'
              AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
          )
      `;

      const [dueSoonBorrowings] = await db.query(query);

      let created = 0;
      for (const borrowing of dueSoonBorrowings) {
        await this.createBorrowingNotifications({
          borrowingId: borrowing.id,
          memberId: borrowing.id_member,
          gameId: borrowing.id_game,
          gameName: borrowing.game_name,
          memberName: borrowing.member_name,
          type: 'due_soon'
        });
        created++;
      }

      return {
        success: true,
        data: { dueSoonFound: dueSoonBorrowings.length, created }
      };

    } catch (error) {
      console.error('Error creating due soon notifications:', error);
      throw new Error('Failed to create due soon notifications');
    }
  }
}

module.exports = new NotificationService();