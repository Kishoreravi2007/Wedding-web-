const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notification-service');
const { authMiddleware } = require('../lib/secure-auth');

/**
 * GET /api/notifications
 * Fetch user's notifications
 */
router.get('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await NotificationService.getUserNotifications(userId);
        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch('/:id/read', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const success = await NotificationService.markAsRead(id, userId);

        if (!success) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user
 */
router.patch('/read-all', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await NotificationService.markAllAsRead(userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

module.exports = router;
