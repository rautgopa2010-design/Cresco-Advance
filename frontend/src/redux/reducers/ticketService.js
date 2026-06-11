import { ADD_TICKET_SERVICE, GET_TICKET_SERVICE, UPDATE_TICKET_SERVICE, DELETE_TICKET_SERVICE, TICKET_SERVICE_ERROR, TICKET_SERVICE_SUCCESS, TICKET_SERVICE_LOADING, CLEAR_SNACKBAR } from "../types";

const initialState = {
    ticketService: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const ticketServiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case TICKET_SERVICE_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_TICKET_SERVICE:
            return {
                ...state,
                ticketService: action.payload,
                loading: false,
            };

        case ADD_TICKET_SERVICE:
            return {
                ...state,
                ticketService: [action.payload, ...state.ticketService],
                loading: false,
            };

        case UPDATE_TICKET_SERVICE:
            return {
                ...state,
                ticketService: state.ticketService.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.data } : s)),
                loading: false,
            };

        case DELETE_TICKET_SERVICE:
            return {
                ...state,
                ticketService: state.ticketService.filter((s) => s.id !== action.payload),
                loading: false,
            };

        case TICKET_SERVICE_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case TICKET_SERVICE_ERROR:
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

export default ticketServiceReducer;
