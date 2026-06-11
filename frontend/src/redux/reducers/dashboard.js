import {
    GET_DASHBOARD_DATA,
    DASHBOARD_LOADING
} from "../types";

const initialState = {
    dashData: {},
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const dashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case DASHBOARD_LOADING:
            return { ...state, loading: true };

        case GET_DASHBOARD_DATA:
            return { ...state, dashData: action.payload, loading: false };

        default:
            return state;
    }
};

export default dashboardReducer;