import { ADD_CUSTOMER_CATEGORY, GET_CUSTOMER_CATEGORY, UPDATE_CUSTOMER_CATEGORY, DELETE_CUSTOMER_CATEGORY, CUSTOMER_CATEGORY_ERROR, CUSTOMER_CATEGORY_SUCCESS, CUSTOMER_CATEGORY_LOADING, CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    customerCategory: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const customerCategoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case CUSTOMER_CATEGORY_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_CUSTOMER_CATEGORY:
            return {
                ...state,
                customerCategory: action.payload,
                loading: false,
            };

        case ADD_CUSTOMER_CATEGORY:
            return {
                ...state,
                customerCategory: [action.payload, ...state.customerCategory],
                loading: false,
            };

        case UPDATE_CUSTOMER_CATEGORY:
            return {
                ...state,
                customerCategory: state.customerCategory.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_CUSTOMER_CATEGORY:
            return {
                ...state,
                customerCategory: state.customerCategory.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case CUSTOMER_CATEGORY_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case CUSTOMER_CATEGORY_ERROR:
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

export default customerCategoryReducer;
