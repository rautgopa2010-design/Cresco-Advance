import { GET_ZONES, ADD_ZONES, UPDATE_ZONES, DELETE_ZONES, ZONE_SUCCESS, ZONE_ERROR, ZONE_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    zones: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const zonesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ZONE_LOADING:
            return { ...state, loading: true };
        case GET_ZONES:
            return { ...state, zones: action.payload, loading: false };
        case ADD_ZONES:
            return { ...state, zones: [action.payload, ...state.zones], loading: false };
        case UPDATE_ZONES:
            return {
                ...state,
                zones: state.zones.map((item) => (item.id === action.payload.id ? { ...item, ...action.payload.data } : item)),
                loading: false,
            };
        case DELETE_ZONES:
            return { ...state, zones: state.zones.filter((item) => item.id !== action.payload), loading: false };
        case ZONE_SUCCESS:
            return { ...state, snackbarMessage: action.payload, snackbarSeverity: "success", loading: false };
        case ZONE_ERROR:
            return { ...state, snackbarMessage: action.payload, snackbarSeverity: "error", loading: false };
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

export default zonesReducer;
