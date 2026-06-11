import { ADD_COUNTRY, GET_COUNTRY, UPDATE_COUNTRY, DELETE_COUNTRY, COUNTRY_ERROR, COUNTRY_SUCCESS, COUNTRY_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    country: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const countryReducer = (state = initialState, action) => {
    switch (action.type) {
        case COUNTRY_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_COUNTRY:
            return {
                ...state,
                country: action.payload,
                loading: false,
            };

        case ADD_COUNTRY:
            return {
                ...state,
                country: [action.payload, ...state.country],
                loading: false,
            };

        case UPDATE_COUNTRY:
            return {
                ...state,
                country: state.country.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_COUNTRY:
            return {
                ...state,
                country: state.country.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case COUNTRY_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case COUNTRY_ERROR:
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

export default countryReducer;
