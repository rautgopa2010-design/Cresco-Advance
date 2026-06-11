import {
    GET_PRODUCT_UNIT,
    ADD_PRODUCT_UNIT,
    UPDATE_PRODUCT_UNIT,
    DELETE_PRODUCT_UNIT,
    PRODUCT_UNIT_ERROR,
    PRODUCT_UNIT_SUCCESS,
    PRODUCT_UNIT_LOADING,
    CLEAR_SNACKBAR,
  } from "../types";

const initialState = {
    productUnit: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const productUnitReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_UNIT_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_PRODUCT_UNIT:
            return {
                ...state,
                productUnit: action.payload,
                loading: false,
            };

        case ADD_PRODUCT_UNIT:
            return {
                ...state,
                productUnit: [action.payload, ...state.productUnit],
                loading: false,
            };

        case UPDATE_PRODUCT_UNIT:
            return {
                ...state,
                productUnit: state.productUnit.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_PRODUCT_UNIT:
            return {
                ...state,
                productUnit: state.productUnit.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case PRODUCT_UNIT_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PRODUCT_UNIT_ERROR:
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

export default productUnitReducer;
