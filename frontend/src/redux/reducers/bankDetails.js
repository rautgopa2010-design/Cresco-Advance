import {
    GET_BANKS,
    GET_BANK_BY_ID,
    ADD_BANK,
    UPDATE_BANK,
    DELETE_BANK,
    BANK_LOADING,
    BANK_ERROR,
    BANK_SUCCESS,
    CLEAR_BANK,
  } from "../types";
  
  const initialState = {
    banks: [],
    currentBank: null,
    loading: false,
    error: null,
    snackbarMessage: "",
    snackbarSeverity: "",
  };
  
  const bankDetailsReducer = (state = initialState, action) => {
    switch (action.type) {
      case BANK_LOADING:
        return { ...state, loading: true };
  
      case GET_BANKS:
        return {
          ...state,
          banks: action.payload,
          loading: false,
        };
  
      case GET_BANK_BY_ID:
        return {
          ...state,
          currentBank: action.payload,
          loading: false,
        };
  
      case ADD_BANK:
        return {
          ...state,
          banks: [action.payload, ...state.banks],
          loading: false,
        };
  
      case UPDATE_BANK:
        return {
          ...state,
          banks: state.banks.map((bank) =>
            bank.id === action.payload.id ? action.payload : bank
          ),
          loading: false,
        };
  
      case DELETE_BANK:
        return {
          ...state,
          banks: state.banks.filter((bank) => bank.id !== action.payload),
          loading: false,
        };
  
      case BANK_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case BANK_ERROR:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "error",
          loading: false,
        };
  
      case CLEAR_BANK:
        return {
          ...state,
          currentBank: null,
          snackbarMessage: "",
          snackbarSeverity: "",
        };
  
      default:
        return state;
    }
  };
  
  export default bankDetailsReducer;