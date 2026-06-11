import {
    GET_LEADS,
    ADD_LEAD,
    UPDATE_LEAD,
    DELETE_LEAD,
    DELETE_LEAD_FILE,
    ADD_FOLLOWUP,
    GET_FOLLOWUPS,
    UPDATE_FOLLOWUP,
    DELETE_FOLLOWUP,
    LEAD_ERROR,
    LEAD_SUCCESS,
    LEAD_LOADING,
    FOLLOWUP_ERROR,
    FOLLOWUP_SUCCESS,
    FOLLOWUP_LOADING,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    leads: [],
    followups: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    leadLoading: false,
    followupLoading: false,
};

const leadAndFollowupReducer = (state = initialState, action) => {
    switch (action.type) {
        case LEAD_LOADING:
            return { ...state, leadLoading: true };

        case GET_LEADS:
            return { ...state, leads: action.payload, leadLoading: false };

        case ADD_LEAD:
            return { ...state, leads: [action.payload, ...state.leads], leadLoading: false };

        case UPDATE_LEAD:
            return {
                ...state,
                leads: state.leads.map((lead) => (lead.id === parseInt(action.payload.lead_id) ? { ...lead, ...action.payload.formData } : lead)),
                leadLoading: false,
            };

        case DELETE_LEAD:
            return {
                ...state,
                leads: state.leads.filter((lead) => lead.id !== action.payload),
                leadLoading: false,
            };

        case DELETE_LEAD_FILE:
            return {
                ...state,
                leads: state.leads.map((lead) => {
                    if (lead.id === parseInt(action.payload.lead_id)) {
                        return {
                            ...lead,
                            uploadedFiles: lead.uploadedFiles.filter((file) => file && file.includes(action.payload.filename) === false),
                        };
                    }
                    return lead;
                }),
                leadLoading: false,
            };

        case LEAD_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                leadLoading: false,
            };

        case LEAD_ERROR:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "error",
                leadLoading: false,
            };

        case FOLLOWUP_LOADING:
            return { ...state, followupLoading: true };

        case ADD_FOLLOWUP:
            return { ...state, followups: [...state.followups, action.payload], followupLoading: false };

        case GET_FOLLOWUPS:
            return { ...state, followups: action.payload, followupLoading: false };

        case UPDATE_FOLLOWUP:
            return {
                ...state,
                followups: state.followups.map((f) => (f.id === action.payload.id ? { ...f, ...action.payload.data } : f)),
                followupLoading: false,
            };

        case DELETE_FOLLOWUP:
            return {
                ...state,
                followups: state.followups.filter((f) => f.id !== action.payload),
                followupLoading: false,
            };

        case FOLLOWUP_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                followupLoading: false,
            };

        case FOLLOWUP_ERROR:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "error",
                followupLoading: false,
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

export default leadAndFollowupReducer;
