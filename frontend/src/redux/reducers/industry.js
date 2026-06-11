import {
    ADD_INDUSTRY,
    GET_INDUSTRY,
    UPDATE_INDUSTRY,
    DELETE_INDUSTRY,
    INDUSTRY_ERROR,
    INDUSTRY_SUCCESS,
    INDUSTRY_LOADING,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    industry: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const industryReducer = (state = initialState, action) => {
    switch (action.type) {
        case INDUSTRY_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_INDUSTRY:
            return {
                ...state,
                industry: action.payload,
                loading: false,
            };

        case ADD_INDUSTRY:
            return {
                ...state,
                industry: [action.payload, ...state.industry],
                loading: false,
            };

        case UPDATE_INDUSTRY:
            return {
                ...state,
                industry: state.industry.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_INDUSTRY:
            return {
                ...state,
                industry: state.industry.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case INDUSTRY_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case INDUSTRY_ERROR:
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

export default industryReducer;
