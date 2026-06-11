import {
    GET_PROFILE,
    UPDATE_PROFILE,
    UPLOAD_PROFILE_IMAGE,
    REMOVE_PROFILE_IMAGE,
    PROFILE_LOADING,
    PROFILE_SUCCESS,
    PROFILE_ERROR,
    CLEAR_SNACKBAR,
} from "../types";

const initialState = {
    profile: null,
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
};

const profileReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROFILE_LOADING:
            return { ...state, loading: true };

        case GET_PROFILE:
            return { ...state, profile: action.payload, loading: false };

        case UPDATE_PROFILE:
            return {
                ...state,
                profile: { ...state.profile, ...action.payload.data },
                loading: false,
            };

        case UPLOAD_PROFILE_IMAGE:
            return {
                ...state,
                profile: {
                    ...state.profile,
                    profileImage: action.payload,
                },
                loading: false,
            };

        case REMOVE_PROFILE_IMAGE:
            return {
                ...state,
                profile: {
                    ...state.profile,
                    profileImage: null,
                },
                loading: false,
            };

        case PROFILE_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PROFILE_ERROR:
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

export default profileReducer;
