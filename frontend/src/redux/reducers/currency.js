import {
    GET_CURRENCY,
    ADD_CURRENCY,
    UPDATE_CURRENCY,
    DELETE_CURRENCY,
    CURRENCY_LOADING,
    CURRENCY_ERROR,
    CURRENCY_SUCCESS,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    currency: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
  };
  
  const currencyReducer = (state = initialState, action) => {
    switch (action.type) {
      case CURRENCY_LOADING:
        return { ...state, loading: true };
      case GET_CURRENCY:
        return { ...state, currency: action.payload, loading: false };
      case ADD_CURRENCY:
        return { ...state, currency: [action.payload, ...state.currency], loading: false };
      case UPDATE_CURRENCY:
        return {
          ...state,
          currency: state.currency.map((item) =>
            item.id === action.payload.id ? { ...item, ...action.payload.data } : item
          ),
          loading: false,
        };
      case DELETE_CURRENCY:
        return {
          ...state,
          currency: state.currency.filter((item) => item.id !== action.payload),
          loading: false,
        };
      case CURRENCY_SUCCESS:
        return { ...state, snackbarMessage: action.payload, snackbarSeverity: "success", loading: false };
      case CURRENCY_ERROR:
        return { ...state, snackbarMessage: action.payload, snackbarSeverity: "error", loading: false };
      case CLEAR_SNACKBAR:
        return { ...state, snackbarMessage: "", snackbarSeverity: "" };
      default:
        return state;
    }
  };
  
  export default currencyReducer;
  