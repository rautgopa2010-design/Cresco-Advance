import {
    GET_PRODUCT_CATEGORY,
    ADD_PRODUCT_CATEGORY,
    UPDATE_PRODUCT_CATEGORY,
    DELETE_PRODUCT_CATEGORY,
    PRODUCT_CATEGORY_ERROR,
    PRODUCT_CATEGORY_SUCCESS,
    PRODUCT_CATEGORY_LOADING,
    CLEAR_SNACKBAR,
  } from "../types";

const initialState = {
    productCategory: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const productCategoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_CATEGORY_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_PRODUCT_CATEGORY:
            return {
                ...state,
                productCategory: action.payload,
                loading: false,
            };

        case ADD_PRODUCT_CATEGORY:
            return {
                ...state,
                productCategory: [action.payload, ...state.productCategory],
                loading: false,
            };

        case UPDATE_PRODUCT_CATEGORY:
            return {
                ...state,
                productCategory: state.productCategory.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_PRODUCT_CATEGORY:
            return {
                ...state,
                productCategory: state.productCategory.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case PRODUCT_CATEGORY_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PRODUCT_CATEGORY_ERROR:
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

export default productCategoryReducer;
