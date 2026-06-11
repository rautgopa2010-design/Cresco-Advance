import {
    GET_PRODUCT,
    ADD_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
    PRODUCT_ERROR,
    PRODUCT_SUCCESS,
    PRODUCT_LOADING,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    product: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_LOADING:
            return { ...state, loading: true };

        case GET_PRODUCT:
            return { ...state, product: action.payload, loading: false };

        case ADD_PRODUCT:
            return {
                ...state,
                product: [action.payload, ...state.product],
                loading: false,
            };

        case UPDATE_PRODUCT:
            return {
                ...state,
                product: state.product.map((item) =>
                    item.id === action.payload.id ? { ...item, ...action.payload.data } : item
                ),
                loading: false,
            };

        case DELETE_PRODUCT:
            return {
                ...state,
                product: state.product.filter((item) => item.id !== action.payload),
                loading: false,
            };

        case PRODUCT_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PRODUCT_ERROR:
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

export default productReducer;
