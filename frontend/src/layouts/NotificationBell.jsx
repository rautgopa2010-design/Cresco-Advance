import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Trash2, Mail, MailOpen, X, Clock, UserPlus, CreditCard, AlertCircle, CheckCircle, FileText, ShoppingCart, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Pusher from "pusher-js";
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} from "../redux/actions/notification";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { notifications, unreadCount, pagination } = useSelector(
        (state) => state.notifications || { notifications: [], unreadCount: 0, pagination: { total: 0 } }
    );
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Initialize Pusher
    useEffect(() => {
        if (!user?.id) return;

        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
            authEndpoint: `${import.meta.env.VITE_API_URL}/api/pusher/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        });

        // Subscribe to user channel
        const userChannel = pusher.subscribe(`private-user-${user.id}`);
        userChannel.bind('new-notification', (data) => {
            dispatch({ type: 'ADD_NOTIFICATION', payload: data });
            dispatch(getUnreadCount());
        });

        userChannel.bind('notification-read', (data) => {
            dispatch({ type: 'MARK_READ', payload: data.id });
        });

        userChannel.bind('all-notifications-read', () => {
            dispatch({ type: 'MARK_ALL_READ' });
        });

        userChannel.bind('notification-deleted', (data) => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: data.id });
            dispatch(getUnreadCount());
        });

        // Subscribe to org channel for org-wide notifications
        const orgChannel = pusher.subscribe(`private-org-${user.org_id}`);
        orgChannel.bind('new-notification', (data) => {
            dispatch({ type: 'ADD_NOTIFICATION', payload: data });
            dispatch(getUnreadCount());
        });

        return () => {
            pusher.unsubscribe(`private-user-${user.id}`);
            pusher.unsubscribe(`private-org-${user.org_id}`);
        };
    }, [user?.id, user?.org_id]);

    // Fetch notifications on mount
    useEffect(() => {
        dispatch(fetchNotifications());
        dispatch(getUnreadCount());
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await dispatch(markAsRead(notification.id));
        }
        
        // Navigate based on notification type
        if (notification.data) {
            switch (notification.type) {
                case 'lead_created':
                case 'lead_updated':
                case 'lead_assigned':
                    if (notification.data.leadId) {
                        navigate(`/leads/view-leads/${notification.data.leadId}`);
                    }
                    break;
                case 'customer_created':
                case 'customer_updated':
                    if (notification.data.customerId) {
                        navigate(`/customer/${notification.data.customerId}`);
                    }
                    break;
                case 'quotation_created':
                    if (notification.data.quotationId) {
                        navigate(`/quotations/view-quotation/${notification.data.quotationId}`);
                    }
                    break;
                case 'order_created':
                    if (notification.data.orderId) {
                        navigate(`/orders/view-order/${notification.data.orderId}`);
                    }
                    break;
                case 'invoice_created':
                    if (notification.data.invoiceId) {
                        navigate(`/invoice/view-invoice/${notification.data.invoiceId}`);
                    }
                    break;
                case 'ticket_created':
                case 'ticket_updated':
                    if (notification.data.ticketId) {
                        navigate(`/tickets/view-ticket/${notification.data.ticketId}`);
                    }
                    break;
                default:
                    break;
            }
        }
        
        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        await dispatch(markAllAsRead());
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        await dispatch(deleteNotification(id));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'lead_created':
            case 'lead_updated':
            case 'lead_assigned':
            case 'lead_status_changed':
                return <FileText size={16} className="text-blue-500" />;
            case 'customer_created':
            case 'customer_updated':
                return <UserPlus size={16} className="text-green-500" />;
            case 'quotation_created':
                return <FileText size={16} className="text-purple-500" />;
            case 'order_created':
                return <ShoppingCart size={16} className="text-orange-500" />;
            case 'invoice_created':
                return <CreditCard size={16} className="text-red-500" />;
            case 'payment_success':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'ticket_created':
            case 'ticket_updated':
                return <MessageSquare size={16} className="text-yellow-500" />;
            case 'login_alert':
                return <AlertCircle size={16} className="text-red-500" />;
            case 'employee_created':
                return <UserPlus size={16} className="text-blue-500" />;
            default:
                return <Bell size={16} className="text-gray-500" />;
        }
    };

    const getTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return '';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute md:right-0 -right-20 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                    <span className="hidden sm:inline">Mark all read</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <Clock size={12} />
                                                <span>{getTimeAgo(notification.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(markAsRead(notification.id));
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Mark as read"
                                                >
                                                    <MailOpen size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteNotification(e, notification.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {pagination.total > 10 && (
                        <div className="p-3 border-t text-center">
                            <button
                                onClick={() => {
                                    dispatch(fetchNotifications({ page: pagination.page + 1 }));
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;