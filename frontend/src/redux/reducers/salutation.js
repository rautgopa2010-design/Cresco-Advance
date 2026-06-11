import { ADD_SALUTATION, GET_SALUTATIONS, UPDATE_SALUTATION, DELETE_SALUTATION, SALUTATION_ERROR, SALUTATION_SUCCESS, SALUTATION_LOADING, CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    salutations: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const salutationReducer = (state = initialState, action) => {
    switch (action.type) {
        case SALUTATION_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_SALUTATIONS:
            return {
                ...state,
                salutations: action.payload,
                loading: false,
            };

        case ADD_SALUTATION:
            return {
                ...state,
                salutations: [action.payload, ...state.salutations],
                loading: false,
            };

        case UPDATE_SALUTATION:
            return {
                ...state,
                salutations: state.salutations.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_SALUTATION:
            return {
                ...state,
                salutations: state.salutations.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case SALUTATION_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case SALUTATION_ERROR:
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

export default salutationReducer;
