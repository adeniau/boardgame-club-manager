const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationService = require('../services/notificationService');

/**
 * POST /api/maintenance/check-notifications
 * Run daily notification checks (overdue, due soon)
 * This endpoint should be called by a cron job or similar scheduler
 */
router.post('/check-notifications', auth, async (req, res) => {
  try {
    // Check if user is admin (only admins can run maintenance tasks)
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const results = {
      overdueChecked: 0,
      overdueCreated: 0,
      dueSoonChecked: 0,
      dueSoonCreated: 0,
      expiredCleaned: 0
    };

    // Check for overdue borrowings
    try {
      const overdueResult = await notificationService.createOverdueNotifications();
      results.overdueChecked = overdueResult.data.overdueFound;
      results.overdueCreated = overdueResult.data.created;
    } catch (error) {
      console.error('Error checking overdue notifications:', error);
    }

    // Check for due soon borrowings
    try {
      const dueSoonResult = await notificationService.createDueSoonNotifications();
      results.dueSoonChecked = dueSoonResult.data.dueSoonFound;
      results.dueSoonCreated = dueSoonResult.data.created;
    } catch (error) {
      console.error('Error checking due soon notifications:', error);
    }

    // Clean up expired notifications
    try {
      const cleanupResult = await notificationService.clearExpiredNotifications();
      results.expiredCleaned = cleanupResult.data.deletedCount;
    } catch (error) {
      console.error('Error cleaning expired notifications:', error);
    }

    console.log('Notification maintenance completed:', results);

    res.success('Maintenance des notifications effectuee', results);
  } catch (error) {
    console.error('Error running notification maintenance:', error);
    res.error('Erreur lors de la maintenance des notifications');
  }
});

/**
 * POST /api/maintenance/create-test-notification
 * Create a test notification (admin only, for testing purposes)
 */
router.post('/create-test-notification', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const testNotification = {
      userId: req.user.userId,
      type: 'system',
      title: 'Test de notification',
      message: 'Ceci est une notification de test créée pour vérifier le bon fonctionnement du système.',
      priority: 'normal'
    };

    const result = await notificationService.createNotification(testNotification);
    
    res.success('Notification de test creee', result.data);
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.error('Erreur lors de la creation de la notification de test');
  }
});

/**
 * GET /api/maintenance/notification-stats
 * Get notification system statistics (admin only)
 */
router.get('/notification-stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    // Get overall notification statistics
    const db = require('../middleware/db');
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_notifications,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_notifications,
        COUNT(DISTINCT user_id) as users_with_notifications,
        AVG(CASE WHEN is_read = 1 THEN TIMESTAMPDIFF(MINUTE, created_at, updated_at) ELSE NULL END) as avg_read_time_minutes
      FROM notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const typeStatsQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY type
      ORDER BY count DESC
    `;

    const priorityStatsQuery = `
      SELECT 
        priority,
        COUNT(*) as count
      FROM notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END
    `;

    const [overallStats] = await db.query(statsQuery);
    const typeStats = await db.query(typeStatsQuery);
    const priorityStats = await db.query(priorityStatsQuery);

    const stats = {
      overall: overallStats[0],
      byType: typeStats[0],
      byPriority: priorityStats[0],
      generatedAt: new Date().toISOString()
    };

    res.success('Statistiques des notifications recuperees', stats);
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.error('Erreur lors de la recuperation des statistiques');
  }
});

module.exports = router;