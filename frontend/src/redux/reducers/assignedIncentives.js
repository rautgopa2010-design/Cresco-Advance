import {
    GET_ASSIGNED_INCENTIVES,
    CREATE_ASSIGNED_INCENTIVE,
    UPDATE_ASSIGNED_INCENTIVE,
    DELETE_ASSIGNED_INCENTIVE,
    ASSIGNED_INCENTIVES_LOADING,
    ASSIGNED_INCENTIVES_SUCCESS,
    ASSIGNED_INCENTIVES_ERROR,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    assignedIncentives: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const assignedIncentivesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ASSIGNED_INCENTIVES_LOADING:
            return { ...state, loading: true };

        case GET_ASSIGNED_INCENTIVES:
            return { ...state, assignedIncentives: action.payload, loading: false };

        case CREATE_ASSIGNED_INCENTIVE:
            return {
                ...state,
                assignedIncentives: [action.payload, ...state.assignedIncentives],
                loading: false,
            };

        case UPDATE_ASSIGNED_INCENTIVE:
            return {
                ...state,
                assignedIncentives: state.assignedIncentives.map((item) =>
                    item.id === action.payload.id ? { ...item, ...action.payload.data } : item,
                ),
                loading: false,
            };

        case DELETE_ASSIGNED_INCENTIVE:
            return {
                ...state,
                assignedIncentives: state.assignedIncentives.filter((item) => item.id !== action.payload),
                loading: false,
            };

        case ASSIGNED_INCENTIVES_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case ASSIGNED_INCENTIVES_ERROR:
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

export default assignedIncentivesReducer;
