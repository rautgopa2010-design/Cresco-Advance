import { ADD_STATUS, GET_STATUS, UPDATE_STATUS, DELETE_STATUS, STATUS_ERROR, STATUS_SUCCESS, STATUS_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    leadStatus: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const leadStatusReducer = (state = initialState, action) => {
    switch (action.type) {
        case STATUS_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_STATUS:
            return {
                ...state,
                leadStatus: action.payload,
                loading: false,
            };

        case ADD_STATUS:
            return {
                ...state,
                leadStatus: [action.payload, ...state.leadStatus],
                loading: false,
            };

        case UPDATE_STATUS:
            return {
                ...state,
                leadStatus: state.leadStatus.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_STATUS:
            return {
                ...state,
                leadStatus: state.leadStatus.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case STATUS_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case STATUS_ERROR:
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

export default leadStatusReducer;
