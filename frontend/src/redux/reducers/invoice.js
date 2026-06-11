import { GET_INVOICES, ADD_INVOICE, UPDATE_INVOICE, DELETE_INVOICE, INVOICE_LOADING, INVOICE_SUCCESS, INVOICE_ERROR, CLEAR_SNACKBAR } from "../types";

const initialState = {
    invoices: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
};

const invoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case INVOICE_LOADING:
            return { ...state, loading: true };

        case GET_INVOICES:
            return { ...state, invoices: action.payload, loading: false };

        case ADD_INVOICE:
            return {
                ...state,
                invoices: [action.payload, ...state.invoices],
                loading: false,
            };

        case UPDATE_INVOICE:
            return {
                ...state,
                invoices: state.invoices.map((inv) => (inv.id === action.payload.id ? action.payload : inv)),
                loading: false,
            };

        case DELETE_INVOICE:
            return {
                ...state,
                invoices: state.invoices.filter((q) => q.id !== action.payload),
                loading: false,
            };

        case INVOICE_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case INVOICE_ERROR:
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

export default invoiceReducer;
