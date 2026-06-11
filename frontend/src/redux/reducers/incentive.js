import {
    GET_INCENTIVES,
    INCENTIVE_LOADING,
    INCENTIVE_SUCCESS,
    INCENTIVE_ERROR,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    incentives: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
  };
  
  const incentiveReducer = (state = initialState, action) => {
    switch (action.type) {
      case INCENTIVE_LOADING:
        return { ...state, loading: true };
  
      case GET_INCENTIVES:
        return { ...state, incentives: action.payload, loading: false };
  
      case INCENTIVE_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case INCENTIVE_ERROR:
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
  
  export default incentiveReducer;
  