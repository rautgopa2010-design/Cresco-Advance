import {
    GET_PROVIDER_DASHBOARD_DATA,
    PROVIDER_DASHBOARD_LOADING
} from "../types";

const initialState = {
    providerDashData: {},
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const providerDashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROVIDER_DASHBOARD_LOADING:
            return { ...state, loading: true };

        case GET_PROVIDER_DASHBOARD_DATA:
            return { ...state, providerDashData: action.payload, loading: false };

        default:
            return state;
    }
};

export default providerDashboardReducer;