import {
    GET_CUSTOMERS,
    ADD_CUSTOMER,
    UPDATE_CUSTOMER,
    DELETE_CUSTOMER,
    CUSTOMER_SUCCESS,
    CUSTOMER_ERROR,
    CUSTOMER_LOADING,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    customers: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
  };
  
  const customerReducer = (state = initialState, action) => {
    switch (action.type) {
      case CUSTOMER_LOADING:
        return { ...state, loading: true };
  
      case GET_CUSTOMERS:
        return { ...state, customers: action.payload, loading: false };
  
      case ADD_CUSTOMER:
        return {
          ...state,
          customers: [action.payload, ...state.customers],
          loading: false,
        };
  
      case UPDATE_CUSTOMER:
        return {
          ...state,
          customers: state.customers.map((customer) =>
            customer.id === action.payload.id
              ? { ...customer, ...action.payload.data }
              : customer
          ),
          loading: false,
        };
  
      case DELETE_CUSTOMER:
        return {
          ...state,
          customers: state.customers.filter((c) => c.id !== action.payload),
          loading: false,
        };
  
      case CUSTOMER_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case CUSTOMER_ERROR:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "error",
          loading: false,
        };
  
      case CLEAR_SNACKBAR:
        return {
          ...state,
          snackbarMessage: "",
          snackbarSeverity: "",
        };
  
      default:
        return state;
    }
  };
  
  export default customerReducer;
  