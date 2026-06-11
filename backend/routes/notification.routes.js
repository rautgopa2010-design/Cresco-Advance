const router = require("express").Router();
const notificationController = require("../controllers/notification.controller");
const auth = require("../middleware/auth.middleware");

// All notification routes require authentication
router.use(auth);

// Get user notifications
router.get("/", notificationController.getUserNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.put("/:id/read", notificationController.markNotificationRead);

// Mark all notifications as read
router.put("/mark-all-read", notificationController.markAllRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;