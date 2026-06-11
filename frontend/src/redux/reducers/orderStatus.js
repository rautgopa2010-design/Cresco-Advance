import {
    GET_ORDER_STATUS,
    ADD_ORDER_STATUS,
    UPDATE_ORDER_STATUS,
    DELETE_ORDER_STATUS,
    ORDER_STATUS_ERROR,
    ORDER_STATUS_SUCCESS,
    ORDER_STATUS_LOADING,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    orderStatus: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const orderStatusReducer = (state = initialState, action) => {
    switch (action.type) {
        case ORDER_STATUS_LOADING:
            return { ...state, loading: true };

        case GET_ORDER_STATUS:
            return { ...state, orderStatus: action.payload, loading: false };

        case ADD_ORDER_STATUS:
            return {
                ...state,
                orderStatus: [action.payload, ...state.orderStatus],
                loading: false,
            };

        case UPDATE_ORDER_STATUS:
            return {
                ...state,
                orderStatus: state.orderStatus.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_ORDER_STATUS:
            return {
                ...state,
                orderStatus: state.orderStatus.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case ORDER_STATUS_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case ORDER_STATUS_ERROR:
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

export default orderStatusReducer;
