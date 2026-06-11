const db = require("../models");
const { getPusherInstance } = require("./pusher");

/**
 * Enhanced notification helper with all notification types
 */
const NOTIFICATION_TYPES = {
    // Lead related
    LEAD_CREATED: 'lead_created',
    LEAD_UPDATED: 'lead_updated',
    LEAD_ASSIGNED: 'lead_assigned',
    LEAD_STATUS_CHANGED: 'lead_status_changed',
    
    // Followup related
    FOLLOWUP_SCHEDULED: 'followup_scheduled',
    FOLLOWUP_REMINDER: 'followup_reminder',
    TODAYS_FOLLOWUP: 'todays_followup',
    MISSED_FOLLOWUP: 'missed_followup',
    FOLLOWUP_COMPLETED: 'followup_completed',
    
    // Employee related
    EMPLOYEE_CREATED: 'employee_created',
    EMPLOYEE_ROLE_CHANGED: 'employee_role_changed',
    
    // Payment related
    PAYMENT_SUCCESS: 'payment_success',
    PACKAGE_ASSIGNED: 'package_assigned',
    
    // Account related
    ACCOUNT_ACTIVATED: 'account_activated',
    ACCOUNT_DEACTIVATED: 'account_deactivated',
    LOGIN_ALERT: 'login_alert',
    PASSWORD_CHANGED: 'password_changed',
    
    // Customer related
    CUSTOMER_CREATED: 'customer_created',
    CUSTOMER_UPDATED: 'customer_updated',
    
    // Ticket related
    TICKET_CREATED: 'ticket_created',
    TICKET_UPDATED: 'ticket_updated',
    
    // Enquiry related
    ENQUIRY_RECEIVED: 'enquiry_received',
    LANDING_ENQUIRY: 'landing_enquiry',
    
    // Quotation/Order/Invoice
    QUOTATION_CREATED: 'quotation_created',
    ORDER_CREATED: 'order_created',
    INVOICE_CREATED: 'invoice_created',
};

/**
 * Create a notification and broadcast via Pusher
 */
const createNotification = async ({ org_id, user_id, type, title, message, data = {}, broadcast_to = null }) => {
    try {
        // Determine broadcast target
        const targetBroadcast = broadcast_to || (user_id ? 'user' : 'org');
        
        // Create notification in database
        const notification = await db.notification.create({
            org_id,
            user_id: targetBroadcast === 'user' ? user_id : null,
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
 * Send notification to all users in an organization with specific roles
 */
const notifyOrganizationByRole = async (org_id, roleNames, type, title, message, data = {}) => {
    try {
        const users = await db.users.findAll({
            where: { org_id, isDeleted: false },
            include: [{
                model: db.roles,
                as: 'role',
                where: { role_name: roleNames }
            }]
        });

        const notifications = [];
        for (const user of users) {
            const notification = await createNotification({
                org_id,
                user_id: user.id,
                type,
                title,
                message,
                data
            });
            notifications.push(notification);
        }
        return notifications;
    } catch (error) {
        console.error("Error notifying organization by role:", error);
        return [];
    }
};

/**
 * Send notification to all assigned employees
 */
const notifyAssignedEmployees = async (org_id, assignedToIds, type, title, message, data = {}) => {
    try {
        const notifications = [];
        for (const userId of assignedToIds) {
            const notification = await createNotification({
                org_id,
                user_id: userId,
                type,
                title,
                message,
                data
            });
            notifications.push(notification);
        }
        return notifications;
    } catch (error) {
        console.error("Error notifying assigned employees:", error);
        return [];
    }
};

module.exports = {
    NOTIFICATION_TYPES,
    createNotification,
    notifyOrganizationByRole,
    notifyAssignedEmployees
};