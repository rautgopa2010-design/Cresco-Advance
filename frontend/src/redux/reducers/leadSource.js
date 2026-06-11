import { GET_SOURCE, ADD_SOURCE, UPDATE_SOURCE, DELETE_SOURCE, SOURCE_ERROR, SOURCE_SUCCESS, SOURCE_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    leadSource: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const leadSourceReducer = (state = initialState, action) => {
    switch (action.type) {
        case SOURCE_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_SOURCE:
            return {
                ...state,
                leadSource: action.payload,
                loading: false,
            };

        case ADD_SOURCE:
            return {
                ...state,
                leadSource: [action.payload, ...state.leadSource],
                loading: false,
            };

        case UPDATE_SOURCE:
            return {
                ...state,
                leadSource: state.leadSource.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_SOURCE:
            return {
                ...state,
                leadSource: state.leadSource.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case SOURCE_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case SOURCE_ERROR:
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

export default leadSourceReducer;
