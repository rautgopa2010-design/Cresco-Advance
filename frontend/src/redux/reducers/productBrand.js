import {
    GET_PRODUCT_BRAND,
    ADD_PRODUCT_BRAND,
    UPDATE_PRODUCT_BRAND,
    DELETE_PRODUCT_BRAND,
    PRODUCT_BRAND_ERROR,
    PRODUCT_BRAND_SUCCESS,
    PRODUCT_BRAND_LOADING,
    CLEAR_SNACKBAR,
  } from "../types";

const initialState = {
    productBrand: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const productBrandReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_BRAND_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_PRODUCT_BRAND:
            return {
                ...state,
                productBrand: action.payload,
                loading: false,
            };

        case ADD_PRODUCT_BRAND:
            return {
                ...state,
                productBrand: [action.payload, ...state.productBrand],
                loading: false,
            };

        case UPDATE_PRODUCT_BRAND:
            return {
                ...state,
                productBrand: state.productBrand.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_PRODUCT_BRAND:
            return {
                ...state,
                productBrand: state.productBrand.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case PRODUCT_BRAND_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PRODUCT_BRAND_ERROR:
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

export default productBrandReducer;
