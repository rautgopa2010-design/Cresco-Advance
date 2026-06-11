import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOGOUT,
    SET_USER,
    AUTH_LOADING,
    AUTH_ERROR,
    AUTH_SUCCESS,
    PACKAGE_SELECT_SUCCESS,
    PACKAGE_SELECT_FAIL,
    GET_ORGANIZATION_INFO_SUCCESS,
    GET_ORGANIZATION_INFO_FAIL,
    CLEAR_SNACKBAR,
    FORGOT_PASSWORD,
    VERIFY_TOKEN_SUCCESS,
    VERIFY_TOKEN_FAIL,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAIL,
    PROVIDER_REGISTER_ORG_SUCCESS,
    PROVIDER_REGISTER_ORG_FAIL,
} from "../types";

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState = {
    token: token || null,
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!token,
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
    organizationInfo: null,
    verifySuccess: false,
    resetSuccess: false,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_LOADING:
            return { ...state, loading: true };

        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem("isAuthenticated", "true");
            return {
                ...state,
                token: action.payload?.token || null,
                user: action.payload?.user || null,
                isAuthenticated: true,
                loading: false,
            };

        case SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
            };

        case REGISTER_FAIL:
        case LOGIN_FAIL:
        case USER_LOGOUT:
            localStorage.removeItem("isAuthenticated");
            return {
                ...state,
                token: null,
                user: null,
                isAuthenticated: false,
                verifySuccess: false,
                resetSuccess: false,
                loading: false,
            };

        case AUTH_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case AUTH_ERROR:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "error",
                loading: false,
            };

        case PACKAGE_SELECT_SUCCESS:
            return {
                ...state,
                user: action.payload,
                loading: false,
            };

        case PACKAGE_SELECT_FAIL:
            return {
                ...state,
                loading: false,
            };

        case GET_ORGANIZATION_INFO_SUCCESS:
            return {
                ...state,
                organizationInfo: action.payload,
                loading: false,
            };

        case GET_ORGANIZATION_INFO_FAIL:
            return {
                ...state,
                organizationInfo: null,
                loading: false,
            };

        case CLEAR_SNACKBAR:
            return {
                ...state,
                snackbarMessage: "",
                snackbarSeverity: "",
            };

        case FORGOT_PASSWORD:
            return {
                ...state,
            };

        case VERIFY_TOKEN_SUCCESS:
            return {
                ...state,
                verifySuccess: true,
                loading: false,
            };

        case VERIFY_TOKEN_FAIL:
            return {
                ...state,
                verifySuccess: false,
                loading: false,
            };

        case RESET_PASSWORD_SUCCESS:
            return {
                ...state,
                resetSuccess: true,
                loading: false,
            };

        case RESET_PASSWORD_FAIL:
            return {
                ...state,
                resetSuccess: false,
                loading: false,
            };

        case PROVIDER_REGISTER_ORG_SUCCESS:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "success",
                loading: false,
            };

        case PROVIDER_REGISTER_ORG_FAIL:
            return {
                ...state,
                snackbarMessage: action.payload,
                snackbarSeverity: "error",
                loading: false,
            };

        default:
            return state;
    }
};

export default authReducer;
