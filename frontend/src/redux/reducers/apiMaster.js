import {
    GET_APIS,
    ADD_API,
    UPDATE_API,
    DELETE_API,
    API_LOADING,
    API_SUCCESS,
    API_ERROR,
    CLEAR_SNACKBAR,
    GET_API_LEADS,
    UPDATE_LEAD_STATUS,
} from "../types";

const initialState = {
    apis: [],
    leads: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
};

const apiMasterReducer = (state = initialState, action) => {
    switch (action.type) {
        case API_LOADING:
            return { ...state, loading: true };

        case GET_APIS:
            return { ...state, apis: action.payload, loading: false };
            
            case GET_API_LEADS:
              return { ...state, leads: action.payload, loading: false };
        
            case UPDATE_LEAD_STATUS:
              return {
                ...state,
                leads: state.leads.map((lead) =>
                  lead.id === action.payload.id
                    ? { ...lead, status: action.payload.status }
                    : lead
                ),
                loading: false,
              };

        case ADD_API:
            return { ...state, apis: [action.payload, ...state.apis], loading: false };

        case UPDATE_API:
            return {
                ...state,
                apis: state.apis.map((api) => (api.id === action.payload.id ? { ...api, ...action.payload.data } : api)),
                loading: false,
            };

        case DELETE_API:
            return {
                ...state,
                apis: state.apis.filter((api) => api.id !== action.payload),
                loading: false,
            };

        case API_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case API_ERROR:
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

export default apiMasterReducer;
