import api from "../../utils/api";
import {
  GET_ORDER_STATUS,
  ADD_ORDER_STATUS,
  UPDATE_ORDER_STATUS,
  DELETE_ORDER_STATUS,
  ORDER_STATUS_ERROR,
  ORDER_STATUS_SUCCESS,
  ORDER_STATUS_LOADING,
} from "../types";

export const getOrderStatus = () => async (dispatch) => {
  dispatch({ type: ORDER_STATUS_LOADING });
  try {
    const res = await api.get("/order-status");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_ORDER_STATUS, payload: sorted });
  } catch (err) {
    console.error("Get Order Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch order status";
    dispatch({ type: ORDER_STATUS_ERROR, payload: message });
  }
};

export const createOrderStatus = (data) => async (dispatch) => {
  dispatch({ type: ORDER_STATUS_LOADING });
  try {
    const res = await api.post("/order-status/create", data);
    dispatch({ type: ADD_ORDER_STATUS, payload: res.data });
    dispatch({
      type: ORDER_STATUS_SUCCESS,
      payload: "Order Status created successfully",
    });
  } catch (err) {
    console.error("Create Order Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add order status";
    dispatch({ type: ORDER_STATUS_ERROR, payload: message });
  }
};

export const updateOrderStatus = (id, data) => async (dispatch) => {
  dispatch({ type: ORDER_STATUS_LOADING });
  try {
    await api.put(`/order-status/edit/${id}`, data);
    dispatch({ type: UPDATE_ORDER_STATUS, payload: { id, data } });
    dispatch({
      type: ORDER_STATUS_SUCCESS,
      payload: "Order Status updated successfully",
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update order status";
    dispatch({ type: ORDER_STATUS_ERROR, payload: message });
  }
};

export const deleteOrderStatus = (id) => async (dispatch) => {
  dispatch({ type: ORDER_STATUS_LOADING });
  try {
    await api.delete(`/order-status/${id}`);
    dispatch({ type: DELETE_ORDER_STATUS, payload: id });
    dispatch({
      type: ORDER_STATUS_SUCCESS,
      payload: "Order Status deleted successfully",
    });
  } catch (err) {
    console.error("Delete Order Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete order status";
    dispatch({ type: ORDER_STATUS_ERROR, payload: message });
  }
};
