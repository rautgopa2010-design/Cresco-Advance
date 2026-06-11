import {
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_FAIL,
    MARK_READ_SUCCESS,
    MARK_ALL_READ_SUCCESS,
    DELETE_NOTIFICATION_SUCCESS,
    GET_UNREAD_COUNT_SUCCESS,
    ADD_NOTIFICATION,
    NOTIFICATION_LOADING,
    NOTIFICATION_ERROR
} from "../types";

const initialState = {
    notifications: [],
    unreadCount: 0,
    pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    },
    loading: false,
    error: null
};

const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case NOTIFICATION_LOADING:
            return {
                ...state,
                loading: true,
                error: null
            };

        case FETCH_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                notifications: action.payload.data || [],
                pagination: action.payload.pagination || {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 0
                },
                loading: false,
                error: null
            };

        case FETCH_NOTIFICATIONS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case ADD_NOTIFICATION:
            // Add new notification to the top of the list
            return {
                ...state,
                notifications: [action.payload, ...state.notifications].slice(0, 50) // Keep last 50
            };

        case MARK_READ_SUCCESS:
            return {
                ...state,
                notifications: state.notifications.map(notif =>
                    notif.id === action.payload
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            };

        case MARK_ALL_READ_SUCCESS:
            return {
                ...state,
                notifications: state.notifications.map(notif => ({
                    ...notif,
                    is_read: true,
                    read_at: new Date().toISOString()
                })),
                unreadCount: 0
            };

        case DELETE_NOTIFICATION_SUCCESS:
            return {
                ...state,
                notifications: state.notifications.filter(notif => notif.id !== action.payload)
            };

        case GET_UNREAD_COUNT_SUCCESS:
            return {
                ...state,
                unreadCount: action.payload
            };

        case NOTIFICATION_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        default:
            return state;
    }
};

export default notificationReducer;