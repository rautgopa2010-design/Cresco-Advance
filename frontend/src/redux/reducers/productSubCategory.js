import { GET_PRODUCT_SUB_CATEGORY, ADD_PRODUCT_SUB_CATEGORY, UPDATE_PRODUCT_SUB_CATEGORY, DELETE_PRODUCT_SUB_CATEGORY, PRODUCT_SUB_CATEGORY_ERROR, PRODUCT_SUB_CATEGORY_SUCCESS, PRODUCT_SUB_CATEGORY_LOADING, CLEAR_SNACKBAR, } from "../types";

const initialState = {
    productSubCategory: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const productSubCategoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_SUB_CATEGORY_LOADING:
            return { ...state, loading: true };

        case GET_PRODUCT_SUB_CATEGORY:
            return { ...state, productSubCategory: action.payload, loading: false };

        case ADD_PRODUCT_SUB_CATEGORY:
            return {
                ...state,
                productSubCategory: [action.payload, ...state.productSubCategory],
                loading: false,
            };

        case UPDATE_PRODUCT_SUB_CATEGORY:
            return {
                ...state,
                productSubCategory: state.productSubCategory.map((item) =>
                    item.id === action.payload.id ? { ...item, ...action.payload.data } : item
                ),
                loading: false,
            };

        case DELETE_PRODUCT_SUB_CATEGORY:
            return {
                ...state,
                productSubCategory: state.productSubCategory.filter((item) => item.id !== action.payload),
                loading: false,
            };

        case PRODUCT_SUB_CATEGORY_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PRODUCT_SUB_CATEGORY_ERROR:
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

export default productSubCategoryReducer;
