import api from "../../utils/api";
import {
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_FAIL,
    MARK_READ_SUCCESS,
    MARK_READ_FAIL,
    MARK_ALL_READ_SUCCESS,
    MARK_ALL_READ_FAIL,
    DELETE_NOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_FAIL,
    GET_UNREAD_COUNT_SUCCESS,
    GET_UNREAD_COUNT_FAIL,
    NOTIFICATION_LOADING,
} from "../types";

export const fetchNotifications = (params = {}) => async (dispatch) => {
    dispatch({ type: NOTIFICATION_LOADING });
    try {
        const queryParams = new URLSearchParams(params).toString();
        const res = await api.get(`/notifications?${queryParams}`);
        
        dispatch({
            type: FETCH_NOTIFICATIONS_SUCCESS,
            payload: res.data
        });
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch notifications";
        dispatch({
            type: FETCH_NOTIFICATIONS_FAIL,
            payload: message
        });
    }
};

export const markAsRead = (id) => async (dispatch) => {
    try {
        const res = await api.put(`/notifications/${id}/read`);
        
        dispatch({
            type: MARK_READ_SUCCESS,
            payload: id
        });
        
        // Update unread count
        dispatch(getUnreadCount());
        
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to mark as read";
        dispatch({
            type: MARK_READ_FAIL,
            payload: message
        });
    }
};

export const markAllAsRead = () => async (dispatch) => {
    try {
        const res = await api.put('/notifications/mark-all-read');
        
        dispatch({
            type: MARK_ALL_READ_SUCCESS
        });
        
        // Update unread count
        dispatch(getUnreadCount());
        
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to mark all as read";
        dispatch({
            type: MARK_ALL_READ_FAIL,
            payload: message
        });
    }
};

export const deleteNotification = (id) => async (dispatch) => {
    try {
        const res = await api.delete(`/notifications/${id}`);
        
        dispatch({
            type: DELETE_NOTIFICATION_SUCCESS,
            payload: id
        });
        
        // Update unread count
        dispatch(getUnreadCount());
        
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to delete notification";
        dispatch({
            type: DELETE_NOTIFICATION_FAIL,
            payload: message
        });
    }
};

export const getUnreadCount = () => async (dispatch) => {
    try {
        const res = await api.get('/notifications/unread-count');
        
        dispatch({
            type: GET_UNREAD_COUNT_SUCCESS,
            payload: res.data.unreadCount
        });
    } catch (err) {
        const message = err.response?.data?.message || "Failed to get unread count";
        dispatch({
            type: GET_UNREAD_COUNT_FAIL,
            payload: message
        });
    }
};