import { ADD_STAGE, GET_STAGE, UPDATE_STAGE, DELETE_STAGE, STAGE_ERROR, STAGE_SUCCESS, STAGE_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    leadStage: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const leadStageReducer = (state = initialState, action) => {
    switch (action.type) {
        case STAGE_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_STAGE:
            return {
                ...state,
                leadStage: action.payload,
                loading: false,
            };

        case ADD_STAGE:
            return {
                ...state,
                leadStage: [action.payload, ...state.leadStage],
                loading: false,
            };

        case UPDATE_STAGE:
            return {
                ...state,
                leadStage: state.leadStage.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_STAGE:
            return {
                ...state,
                leadStage: state.leadStage.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case STAGE_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case STAGE_ERROR:
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

export default leadStageReducer;
