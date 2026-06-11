import api from "../../utils/api";
import {
  GET_ORDERS,
  ADD_ORDER,
  UPDATE_ORDER,
  DELETE_ORDER,
  ORDER_LOADING,
  ORDER_SUCCESS,
  ORDER_ERROR,
} from "../types";

// Get all orders
export const getOrders = () => async (dispatch) => {
  dispatch({ type: ORDER_LOADING });
  try {
    const res = await api.get("/order");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_ORDERS, payload: sorted });
  } catch (err) {
    console.error("Get Orders Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch orders";
    dispatch({ type: ORDER_ERROR, payload: message });
  }
};

// Create order
export const createOrder = (data) => async (dispatch) => {
  dispatch({ type: ORDER_LOADING });
  try {
    const res = await api.post("/order/create", data);
    dispatch({ type: ADD_ORDER, payload: { ...data, id: res.data.orderId } });
    dispatch({ type: ORDER_SUCCESS, payload: "Order created successfully" });
  } catch (err) {
    console.error("Create Order Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to create order";
    dispatch({ type: ORDER_ERROR, payload: message });
  }
};

// Update order status
export const updateOrderStatus = (id, status) => async (dispatch) => {
  dispatch({ type: ORDER_LOADING });
  try {
    const res = await api.patch(`/order/${id}/status`, { status });
    dispatch({
      type: UPDATE_ORDER,
      payload: { id, data: { status } },
    });
    dispatch({
      type: ORDER_SUCCESS,
      payload: res.data.message || "Order status updated successfully",
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      "Failed to update order status";
    dispatch({ type: ORDER_ERROR, payload: message });
  }
};

// Update order
export const updateOrder = (id, data) => async (dispatch) => {
  dispatch({ type: ORDER_LOADING });
  try {
    const res = await api.put(`/order/edit/${id}`, data);

    const updatedOrder = res.data?.updatedOrder || { ...data, id };

    dispatch({
      type: UPDATE_ORDER,
      payload: { id, data: updatedOrder },
    });

    dispatch({
      type: ORDER_SUCCESS,
      payload: res.data?.message || "Order updated successfully",
    });
  } catch (err) {
    console.error("Update Order Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update order";
    dispatch({ type: ORDER_ERROR, payload: message });
  }
};

// Delete order
export const deleteOrder = (id) => async (dispatch) => {
  dispatch({ type: ORDER_LOADING });
  try {
    await api.delete(`/order/${id}`);
    dispatch({ type: DELETE_ORDER, payload: id });
    dispatch({ type: ORDER_SUCCESS, payload: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete order";
    dispatch({ type: ORDER_ERROR, payload: message });
  }
};
