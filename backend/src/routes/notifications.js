const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const { body, validationResult, query } = require('express-validator');

/**
 * GET /api/notifications
 * Get user notifications with filtering and pagination
 */
router.get('/', auth, [
  query('type').optional().isIn(['borrowing', 'return', 'overdue', 'reminder', 'system', 'success', 'warning', 'error']),
  query('isRead').optional().isBoolean(),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('sortBy').optional().isIn(['created_at', 'updated_at', 'priority', 'type']),
  query('sortOrder').optional().isIn(['ASC', 'DESC'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.badRequest('Parametres de requete invalides', { errors: errors.array() });
    }

    const options = {
      type: req.query.type,
      isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : null,
      priority: req.query.priority,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await notificationService.getNotificationsForUser(req.user.userId, options);
    res.success('Notifications recuperees avec succes', result.data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.error('Erreur lors de la recuperation des notifications');
  }
});

/**
 * GET /api/notifications/unread
 * Get unread notifications count
 */
router.get('/unread', auth, async (req, res) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.userId);
    res.success('Nombre de notifications non lues recupere', result.data);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.error('Erreur lors de la recuperation du nombre de notifications');
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics by type and priority
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await notificationService.getNotificationStats(req.user.userId);
    res.success('Statistiques des notifications recuperees', result.data);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.error('Erreur lors de la recuperation des statistiques');
  }
});

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
router.post('/', auth, [
  body('type').isIn(['borrowing', 'return', 'overdue', 'reminder', 'system', 'success', 'warning', 'error']),
  body('title').isLength({ min: 1, max: 255 }).trim(),
  body('message').isLength({ min: 1, max: 1000 }).trim(),
  body('targetUserId').optional().isInt({ min: 1 }),
  body('relatedEntityType').optional().isIn(['game', 'member', 'borrowing', 'season']),
  body('relatedEntityId').optional().isInt({ min: 1 }),
  body('actionUrl').optional().isLength({ max: 255 }).trim(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.badRequest('Donnees de notification invalides', { errors: errors.array() });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const notificationData = {
      userId: req.body.targetUserId || req.user.userId,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      relatedEntityType: req.body.relatedEntityType,
      relatedEntityId: req.body.relatedEntityId,
      actionUrl: req.body.actionUrl,
      priority: req.body.priority || 'normal',
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null
    };

    const result = await notificationService.createNotification(notificationData);
    res.success('Notification creee avec succes', result.data);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.error('Erreur lors de la creation de la notification');
  }
});

/**
 * POST /api/notifications/system
 * Create a system notification for all users or specific user (admin only)
 */
router.post('/system', auth, [
  body('title').isLength({ min: 1, max: 255 }).trim(),
  body('message').isLength({ min: 1, max: 1000 }).trim(),
  body('targetUserId').optional().isInt({ min: 1 }),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.badRequest('Donnees de notification systeme invalides', { errors: errors.array() });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const notificationData = {
      title: req.body.title,
      message: req.body.message,
      targetUserId: req.body.targetUserId,
      priority: req.body.priority || 'normal',
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null
    };

    const result = await notificationService.createSystemNotification(notificationData);
    res.success('Notification systeme creee avec succes', result.data);
  } catch (error) {
    console.error('Error creating system notification:', error);
    res.error('Erreur lors de la creation de la notification systeme');
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    if (!notificationId || notificationId <= 0) {
      return res.badRequest('ID de notification invalide');
    }

    const result = await notificationService.markAsRead(notificationId, req.user.userId);
    res.success('Notification marquee comme lue');
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error.message.includes('not found')) {
      res.notFound('Notification non trouvee');
    } else {
      res.error('Erreur lors de la mise a jour de la notification');
    }
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.userId);
    res.success('Toutes les notifications ont ete marquees comme lues', result.data);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.error('Erreur lors de la mise a jour des notifications');
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    if (!notificationId || notificationId <= 0) {
      return res.badRequest('ID de notification invalide');
    }

    const result = await notificationService.deleteNotification(notificationId, req.user.userId);
    res.success('Notification supprimee avec succes');
  } catch (error) {
    console.error('Error deleting notification:', error);
    if (error.message.includes('not found')) {
      res.notFound('Notification non trouvee');
    } else {
      res.error('Erreur lors de la suppression de la notification');
    }
  }
});

/**
 * DELETE /api/notifications/clear-all
 * Clear all notifications for the current user
 */
router.delete('/clear-all', auth, async (req, res) => {
  try {
    const result = await notificationService.clearAllNotifications(req.user.userId);
    res.success('Toutes les notifications ont ete supprimees', result.data);
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.error('Erreur lors de la suppression des notifications');
  }
});

/**
 * POST /api/notifications/cleanup-expired
 * Clean up expired notifications (admin only)
 */
router.post('/cleanup-expired', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const result = await notificationService.clearExpiredNotifications();
    res.success('Nettoyage des notifications expirees effectue', result.data);
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    res.error('Erreur lors du nettoyage des notifications expirees');
  }
});

/**
 * POST /api/notifications/check-overdue
 * Check for overdue borrowings and create notifications (admin only)
 */
router.post('/check-overdue', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const result = await notificationService.createOverdueNotifications();
    res.success('Verification des retards effectuee', result.data);
  } catch (error) {
    console.error('Error checking overdue notifications:', error);
    res.error('Erreur lors de la verification des retards');
  }
});

/**
 * POST /api/notifications/check-due-soon
 * Check for due soon borrowings and create notifications (admin only)
 */
router.post('/check-due-soon', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.forbidden('Acces refuse - administrateur requis');
    }

    const result = await notificationService.createDueSoonNotifications();
    res.success('Verification des echeances proches effectuee', result.data);
  } catch (error) {
    console.error('Error checking due soon notifications:', error);
    res.error('Erreur lors de la verification des echeances');
  }
});

module.exports = router;