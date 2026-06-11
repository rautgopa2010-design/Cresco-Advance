import { GET_TICKETS, ADD_TICKET, UPDATE_TICKET, DELETE_TICKET, TICKET_LOADING, TICKET_SUCCESS, TICKET_ERROR, CLEAR_SNACKBAR } from "../types";

const initialState = {
    ticket: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
};

const ticketReducer = (state = initialState, action) => {
    switch (action.type) {
        case TICKET_LOADING:
            return { ...state, loading: true };

        case GET_TICKETS:
            return {
                ...state,
                ticket: action.payload,
                loading: false,
                snackbarMessage: state.snackbarMessage || "",
                snackbarSeverity: state.snackbarSeverity || "",
            };

        case ADD_TICKET:
            return { ...state, ticket: [action.payload, ...state.ticket], loading: false };

        case UPDATE_TICKET:
            return {
                ...state,
                ticket: state.ticket.map((t) => (t.id === action.payload.id ? { ...t, ...(action.payload.data || action.payload) } : t)),
                loading: false,
            };

        case DELETE_TICKET:
            return { ...state, ticket: state.ticket.filter((t) => t.id !== action.payload), loading: false };

        case TICKET_SUCCESS:
            return { ...state, snackbarMessage: action.payload, snackbarSeverity: "success", loading: false };

        case TICKET_ERROR:
            return { ...state, snackbarMessage: action.payload, snackbarSeverity: "error", loading: false };

        case CLEAR_SNACKBAR:
            return { ...state, snackbarMessage: "", snackbarSeverity: "" };

        default:
            return state;
    }
};

export default ticketReducer;
