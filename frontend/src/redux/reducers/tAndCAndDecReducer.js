import {
    GET_T_AND_C_AND_DEC,
    ADD_T_AND_C_AND_DEC,
    UPDATE_T_AND_C_AND_DEC,
    DELETE_T_AND_C_AND_DEC,
    T_AND_C_AND_DEC_ERROR,
    T_AND_C_AND_DEC_SUCCESS,
    T_AND_C_AND_DEC_LOADING,
    GET_DEFAULT_T_AND_C_AND_DEC,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    entries: [],
    defaultEntries: {
        quotation_description: null,
        quotation_terms: null,
        invoice_terms: null,
    },
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const tAndCAndDecReducer = (state = initialState, action) => {
    switch (action.type) {
        case T_AND_C_AND_DEC_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_T_AND_C_AND_DEC:
            return {
                ...state,
                entries: action.payload,
                loading: false,
            };

        case GET_DEFAULT_T_AND_C_AND_DEC:
            return {
                ...state,
                defaultEntries: {
                    ...state.defaultEntries,
                    [action.payload?.type]: action.payload,
                },
                loading: false,
            };

        case ADD_T_AND_C_AND_DEC:
            return {
                ...state,
                entries: [action.payload, ...state.entries],
                loading: false,
            };

        case UPDATE_T_AND_C_AND_DEC:
            return {
                ...state,
                entries: state.entries.map((entry) =>
                    entry.id === action.payload.id ? { ...entry, ...action.payload.data } : entry
                ),
                loading: false,
            };

        case DELETE_T_AND_C_AND_DEC:
            return {
                ...state,
                entries: state.entries.filter((entry) => entry.id !== action.payload),
                loading: false,
            };

        case T_AND_C_AND_DEC_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case T_AND_C_AND_DEC_ERROR:
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

export default tAndCAndDecReducer;