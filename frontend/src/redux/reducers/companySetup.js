import {
  GET_COMPANY_SETUP,
  UPDATE_COMPANY_SETUP,
  UPLOAD_COMPANY_LOGO,
  REMOVE_COMPANY_LOGO,
  COMPANY_SETUP_LOADING,
  COMPANY_SETUP_SUCCESS,
  COMPANY_SETUP_ERROR,
  CLEAR_SNACKBAR,
} from "../types";

const initialState = {
  companySetup: null,
  snackbarMessage: "",
  snackbarSeverity: "",
  loading: false,
};

const companySetupReducer = (state = initialState, action) => {
  switch (action.type) {
    case COMPANY_SETUP_LOADING:
      return { ...state, loading: true };

    case GET_COMPANY_SETUP:
      return { ...state, companySetup: action.payload, loading: false };

    case UPDATE_COMPANY_SETUP:
      return {
        ...state,
        companySetup: { ...state.companySetup, ...action.payload.data },
        loading: false,
      };

    case UPLOAD_COMPANY_LOGO:
      return {
        ...state,
        companySetup: {
          ...state.companySetup,
          companyLogo: action.payload,
        },
        loading: false,
      };

    case REMOVE_COMPANY_LOGO:
      return {
        ...state,
        companySetup: {
          ...state.companySetup,
          companyLogo: null,
        },
        loading: false,
      };

    case COMPANY_SETUP_SUCCESS:
      return {
        ...state,
        snackbarMessage: action.payload,
        snackbarSeverity: "success",
        loading: false,
      };

    case COMPANY_SETUP_ERROR:
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

export default companySetupReducer;
