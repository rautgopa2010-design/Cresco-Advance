import { GET_ORDERS, ADD_ORDER, UPDATE_ORDER, DELETE_ORDER, ORDER_LOADING, ORDER_SUCCESS, ORDER_ERROR, CLEAR_SNACKBAR } from "../types";

const initialState = {
    orders: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
};

const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case ORDER_LOADING:
            return { ...state, loading: true };

        case GET_ORDERS:
            return { ...state, orders: action.payload, loading: false };

        case ADD_ORDER:
            return {
                ...state,
                orders: [action.payload, ...state.orders],
                loading: false,
            };

        case UPDATE_ORDER:
            return {
                ...state,
                loading: false,
                orders: state.orders.map((order) => (order.id === action.payload.id ? { ...order, ...action.payload.data } : order)),
            };
            
        case DELETE_ORDER:
            return {
                ...state,
                orders: state.orders.filter((q) => q.id !== action.payload),
                loading: false,
            };

        case ORDER_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case ORDER_ERROR:
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

export default orderReducer;
