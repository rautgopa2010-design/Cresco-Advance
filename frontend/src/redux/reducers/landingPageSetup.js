import {
    GET_LANDING_PAGE_SETUP,
    UPDATE_LANDING_PAGE_SETUP,
    LANDING_PAGE_SETUP_LOADING,
    LANDING_PAGE_SETUP_SUCCESS,
    LANDING_PAGE_SETUP_ERROR,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    landingPageSetup: null,
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const landingPageSetupReducer = (state = initialState, action) => {
    switch (action.type) {
        case LANDING_PAGE_SETUP_LOADING:
            return { ...state, loading: true };

        case GET_LANDING_PAGE_SETUP:
            return { ...state, landingPageSetup: action.payload, loading: false };

        case UPDATE_LANDING_PAGE_SETUP:
            return { ...state, loading: false };

        case LANDING_PAGE_SETUP_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case LANDING_PAGE_SETUP_ERROR:
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

export default landingPageSetupReducer;