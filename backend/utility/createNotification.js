const db = require("../models");
const { getPusherInstance } = require("./pusher");

/**
 * Create a notification and broadcast via Pusher
 * @param {Object} data - Notification data
 * @param {number} data.org_id - Organization ID
 * @param {number} data.user_id - User ID (optional - if null, will broadcast to all org users)
 * @param {string} data.type - Notification type (must match ENUM values)
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {Object} data.data - Additional data (optional)
 * @param {string} data.broadcast_to - 'user' or 'org' (default: 'user' if user_id provided, else 'org')
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async ({ org_id, user_id, type, title, message, data = {}, broadcast_to = null }) => {
    try {
        // Determine broadcast target
        const targetBroadcast = broadcast_to || (user_id ? 'user' : 'org');
        
        // Create notification in database
        const notification = await db.notification.create({
            org_id,
            user_id: targetBroadcast === 'user' ? user_id : null, // If org broadcast, user_id is null
            type,
            title,
            message,
            data,
            is_read: false,
            created_at: new Date()
        });

        // Get Pusher instance
        const pusher = getPusherInstance();

        if (pusher) {
            // Broadcast to appropriate channel
            if (targetBroadcast === 'user' && user_id) {
                // Broadcast to specific user
                await pusher.trigger(`private-user-${user_id}`, 'new-notification', {
                    id: notification.id,
                    org_id,
                    user_id,
                    type,
                    title,
                    message,
                    data,
                    is_read: false,
                    created_at: notification.created_at
                });
            } else {
                // Broadcast to entire organization
                await pusher.trigger(`private-org-${org_id}`, 'new-notification', {
                    id: notification.id,
                    org_id,
                    type,
                    title,
                    message,
                    data,
                    is_read: false,
                    created_at: notification.created_at
                });
            }
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

/**
 * Create multiple notifications (for bulk operations)
 * @param {Array} notifications - Array of notification objects
 * @returns {Promise<Array>} Created notifications
 */
const createBulkNotifications = async (notifications) => {
    try {
        const createdNotifications = await db.notification.bulkCreate(
            notifications.map(n => ({
                ...n,
                is_read: false,
                created_at: new Date()
            }))
        );

        // Get Pusher instance
        const pusher = getPusherInstance();

        if (pusher) {
            // Broadcast each notification
            for (const notification of createdNotifications) {
                const targetChannel = notification.user_id 
                    ? `private-user-${notification.user_id}`
                    : `private-org-${notification.org_id}`;

                await pusher.trigger(targetChannel, 'new-notification', {
                    id: notification.id,
                    org_id: notification.org_id,
                    user_id: notification.user_id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data,
                    is_read: false,
                    created_at: notification.created_at
                });
            }
        }

        return createdNotifications;
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
        return [];
    }
};

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await db.notification.findOne({
            where: {
                id: notificationId,
                [db.Sequelize.Op.or]: [
                    { user_id: userId },
                    { user_id: null } // Org-wide notifications
                ]
            }
        });

        if (!notification) return false;

        await notification.update({
            is_read: true,
            read_at: new Date()
        });

        // Broadcast read status
        const pusher = getPusherInstance();
        if (pusher) {
            const targetChannel = notification.user_id 
                ? `private-user-${userId}`
                : `private-org-${notification.org_id}`;

            await pusher.trigger(targetChannel, 'notification-read', {
                id: notification.id
            });
        }

        return true;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return false;
    }
};

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 * @param {number} org_id - Organization ID
 * @returns {Promise<boolean>} Success status
 */
const markAllAsRead = async (userId, org_id) => {
    try {
        await db.notification.update(
            {
                is_read: true,
                read_at: new Date()
            },
            {
                where: {
                    org_id,
                    [db.Sequelize.Op.or]: [
                        { user_id: userId },
                        { user_id: null } // Org-wide notifications
                    ],
                    is_read: false
                }
            }
        );

        // Broadcast all read
        const pusher = getPusherInstance();
        if (pusher) {
            await pusher.trigger(`private-user-${userId}`, 'all-notifications-read', {});
        }

        return true;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return false;
    }
};

module.exports = {
    createNotification,
    createBulkNotifications,
    markAsRead,
    markAllAsRead
};