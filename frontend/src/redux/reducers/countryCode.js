import {
    ADD_COUNTRY_CODE,
    GET_COUNTRY_CODE,
    UPDATE_COUNTRY_CODE,
    DELETE_COUNTRY_CODE,
    COUNTRY_CODE_ERROR,
    COUNTRY_CODE_SUCCESS,
    COUNTRY_CODE_LOADING,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    countryCode: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
  };
  
  const countryCodeReducer = (state = initialState, action) => {
    switch (action.type) {
      case COUNTRY_CODE_LOADING:
        return {
          ...state,
          loading: true,
        };
  
      case GET_COUNTRY_CODE:
        return {
          ...state,
          countryCode: action.payload,
          loading: false,
        };
  
      case ADD_COUNTRY_CODE:
        return {
          ...state,
          countryCode: [action.payload, ...state.countryCode],
          loading: false,
        };
  
      case UPDATE_COUNTRY_CODE:
        return {
          ...state,
          countryCode: state.countryCode.map((item) =>
            item.id === action.payload.id ? { ...item, ...action.payload.data } : item
          ),
          loading: false,
        };
  
      case DELETE_COUNTRY_CODE:
        return {
          ...state,
          countryCode: state.countryCode.filter((item) => item.id !== action.payload),
          loading: false,
        };
  
      case COUNTRY_CODE_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case COUNTRY_CODE_ERROR:
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
  
  export default countryCodeReducer;
  