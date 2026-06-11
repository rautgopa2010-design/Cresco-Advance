const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { markAsRead, markAllAsRead } = require("../utility/createNotification");
const { Op } = require("sequelize");

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const org_id = req.user.org_id;
        const { page = 1, limit = 20, unread_only = false } = req.query;

        const offset = (page - 1) * limit;

        const where = {
            org_id,
            [Op.or]: [
                { user_id: userId },
                { user_id: null } // Include org-wide notifications
            ]
        };

        if (unread_only === 'true') {
            where.is_read = false;
        }

        const { count, rows: notifications } = await db.notification.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get unread count
        const unreadCount = await db.notification.count({
            where: {
                org_id,
                [Op.or]: [
                    { user_id: userId },
                    { user_id: null }
                ],
                is_read: false
            }
        });

        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            },
            unreadCount
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return sendErrorResponse(res, 500, "Failed to fetch notifications");
    }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const success = await markAsRead(id, userId);

        if (!success) {
            return sendErrorResponse(res, 404, "Notification not found");
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.error("Mark notification read error:", error);
        return sendErrorResponse(res, 500, "Failed to mark notification as read");
    }
};

// Mark all notifications as read
exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const org_id = req.user.org_id;

        await markAllAsRead(userId, org_id);

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Mark all read error:", error);
        return sendErrorResponse(res, 500, "Failed to mark all notifications as read");
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const org_id = req.user.org_id;

        const notification = await db.notification.findOne({
            where: {
                id,
                org_id,
                [Op.or]: [
                    { user_id: userId },
                    { user_id: null }
                ]
            }
        });

        if (!notification) {
            return sendErrorResponse(res, 404, "Notification not found");
        }

        await notification.destroy();

        // Broadcast deletion
        const pusher = require("../utility/pusher").getPusherInstance();
        if (pusher) {
            await pusher.trigger(`private-user-${userId}`, 'notification-deleted', {
                id: notification.id
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error("Delete notification error:", error);
        return sendErrorResponse(res, 500, "Failed to delete notification");
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const org_id = req.user.org_id;

        const count = await db.notification.count({
            where: {
                org_id,
                [Op.or]: [
                    { user_id: userId },
                    { user_id: null }
                ],
                is_read: false
            }
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        return sendErrorResponse(res, 500, "Failed to get unread count");
    }
};