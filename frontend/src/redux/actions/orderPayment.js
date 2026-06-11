import api from "../../utils/api";
import {
  GET_ORDER_PAYMENTS,
  CREATE_ORDER_PAYMENT,
  ORDER_PAYMENT_LOADING,
  ORDER_PAYMENT_SUCCESS,
  ORDER_PAYMENT_ERROR,
} from "../types";

export const addOrderPayment = (orderId, paymentData) => async (dispatch) => {
  dispatch({ type: ORDER_PAYMENT_LOADING });

  try {
    const res = await api.post(`/order-payment/add/${orderId}`, paymentData);

    dispatch({
      type: CREATE_ORDER_PAYMENT,
      payload: res.data.payment,
    });

    dispatch({
      type: ORDER_PAYMENT_SUCCESS,
      payload: res.data.message,
    });

    // Fetch updated payments
    dispatch(getOrderPayments(orderId));
  } catch (err) {
    console.error("Add Order Payment Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message || "Failed to add order payment";
    dispatch({
      type: ORDER_PAYMENT_ERROR,
      payload: message,
    });
  }
};

export const getOrderPayments = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_PAYMENT_LOADING });
  try {
    const res = await api.get(`/order-payment/get/${orderId}`);
    dispatch({ type: GET_ORDER_PAYMENTS, payload: res.data.payments });
  } catch (err) {
    console.error("Get Order Payments Error:", err);
    const message =
    err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message || "Failed to fetch order payments";
    dispatch({ type: ORDER_PAYMENT_ERROR, payload: message });
  }
};
