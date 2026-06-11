import {
  GET_ORDER_PAYMENTS,
  CREATE_ORDER_PAYMENT,
  ORDER_PAYMENT_LOADING,
  ORDER_PAYMENT_SUCCESS,
  ORDER_PAYMENT_ERROR,
  CLEAR_SNACKBAR,
} from "../types";

const initialState = {
  payments: [],
  loading: false,
  snackbarMessage: "",
  snackbarSeverity: "",
};

const orderPaymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORDER_PAYMENT_LOADING:
      return { ...state, loading: true };

    case GET_ORDER_PAYMENTS:
      return { ...state, payments: action.payload, loading: false };

    case CREATE_ORDER_PAYMENT:
      return {
        ...state,
        payments: [...state.payments, action.payload],
        loading: false,
      };

    case ORDER_PAYMENT_SUCCESS:
      return {
        ...state,
        snackbarMessage: action.payload,
        snackbarSeverity: "success",
        loading: false,
      };

    case ORDER_PAYMENT_ERROR:
      return {
        ...state,
        snackbarMessage: action.payload,
        snackbarSeverity: "error",
        loading: false,
      };

    case CLEAR_SNACKBAR:
      return { ...state, snackbarMessage: "", snackbarSeverity: "" };

    default:
      return state;
  }
};

export default orderPaymentReducer;
