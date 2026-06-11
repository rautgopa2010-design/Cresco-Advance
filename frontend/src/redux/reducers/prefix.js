import {
    GET_PREFIX,
    UPSERT_PREFIX,
    DELETE_PREFIX,
    PREFIX_LOADING,
    PREFIX_SUCCESS,
    PREFIX_ERROR,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    prefix: null,
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
  };
  
  const prefixReducer = (state = initialState, action) => {
    switch (action.type) {
      case PREFIX_LOADING:
        return { ...state, loading: true };
  
      case GET_PREFIX:
      case UPSERT_PREFIX:
        return {
          ...state,
          prefix: action.payload,
          loading: false,
        };
  
      case DELETE_PREFIX:
        return {
          ...state,
          prefix: null,
          loading: false,
        };
  
      case PREFIX_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case PREFIX_ERROR:
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
  }

  export default prefixReducer;