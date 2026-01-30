/**
 * Notification Service
 * 
 * Handles creation and management of in-app notifications.
 */
const { query } = require('../lib/db-gcp');

const NotificationService = {
    /**
     * Create a new notification
     * 
     * @param {string} userId - UUID of the user
     * @param {object} data - { title, message, type, category, link }
     */
    async createNotification(userId, { title, message, type = 'info', category = 'personal', link = null }) {
        try {
            const insertQuery = `
        INSERT INTO notifications (user_id, title, message, type, category, link, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;
            const { rows } = await query(insertQuery, [userId, title, message, type, category, link]);
            return rows[0];
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId, limit = 50) {
        try {
            const { rows } = await query(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
                [userId, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            const { rowCount } = await query(
                'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
                [notificationId, userId]
            );
            return rowCount > 0;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        try {
            await query(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
                [userId]
            );
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    /**
     * Clear old notifications (optional maintenance)
     */
    async clearOldNotifications(days = 30) {
        try {
            await query(
                'DELETE FROM notifications WHERE created_at < NOW() - ($1 || \' days\')::INTERVAL',
                [days]
            );
        } catch (error) {
            console.error('Error clearing old notifications:', error);
        }
    }
};

module.exports = NotificationService;
