import { ADD_TICKET_PRIORITY, GET_TICKET_PRIORITY, UPDATE_TICKET_PRIORITY, DELETE_TICKET_PRIORITY, TICKET_PRIORITY_ERROR, TICKET_PRIORITY_SUCCESS, TICKET_PRIORITY_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    ticketPriority: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const ticketPriorityReducer = (state = initialState, action) => {
    switch (action.type) {
        case TICKET_PRIORITY_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_TICKET_PRIORITY:
            return {
                ...state,
                ticketPriority: action.payload,
                loading: false,
            };

        case ADD_TICKET_PRIORITY:
            return {
                ...state,
                ticketPriority: [action.payload, ...state.ticketPriority],
                loading: false,
            };

        case UPDATE_TICKET_PRIORITY:
            return {
                ...state,
                ticketPriority: state.ticketPriority.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_TICKET_PRIORITY:
            return {
                ...state,
                ticketPriority: state.ticketPriority.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case TICKET_PRIORITY_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case TICKET_PRIORITY_ERROR:
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

export default ticketPriorityReducer;
