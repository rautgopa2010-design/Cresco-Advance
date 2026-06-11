import {
    GET_QUOTATIONS,
    ADD_QUOTATION,
    UPDATE_QUOTATION,
    DELETE_QUOTATION,
    QUOTATION_LOADING,
    QUOTATION_SUCCESS,
    QUOTATION_ERROR,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    quotations: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
  };
  
  const quotationReducer = (state = initialState, action) => {
    switch (action.type) {
      case QUOTATION_LOADING:
        return { ...state, loading: true };
  
      case GET_QUOTATIONS:
        return { ...state, quotations: action.payload, loading: false };
  
      case ADD_QUOTATION:
        return {
          ...state,
          quotations: [action.payload, ...state.quotations],
          loading: false,
        };
  
      case UPDATE_QUOTATION:
        return {
          ...state,
          quotations: state.quotations.map((q) =>
            q.id === action.payload.id ? { ...q, ...action.payload.data } : q
          ),
          loading: false,
        };
  
      case DELETE_QUOTATION:
        return {
          ...state,
          quotations: state.quotations.filter((q) => q.id !== action.payload),
          loading: false,
        };
  
      case QUOTATION_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case QUOTATION_ERROR:
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
  
  export default quotationReducer;
  