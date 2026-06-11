import {
    GET_LANDING_LEADS,
    UPDATE_LANDING_LEAD_STATUS,
    LANDING_LEAD_LOADING,
    LANDING_LEAD_SUCCESS,
    LANDING_LEAD_ERROR,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    leads: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
  };
  
  const landingPageLeadReducer = (state = initialState, action) => {
    switch (action.type) {
      case LANDING_LEAD_LOADING:
        return { ...state, loading: true };
  
      case GET_LANDING_LEADS:
        return { ...state, leads: action.payload, loading: false };
  
      case UPDATE_LANDING_LEAD_STATUS:
        return {
          ...state,
          leads: state.leads.map((lead) =>
            lead.id === action.payload.id
              ? { ...lead, status: action.payload.status }
              : lead
          ),
          loading: false,
        };
  
      case LANDING_LEAD_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case LANDING_LEAD_ERROR:
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
  
  export default landingPageLeadReducer;