import {
    RBAC_LOADING,
    RBAC_ERROR,
    RBAC_SUCCESS,
    CLEAR_SNACKBAR,
    GET_MODULES,
    ADD_MODULE,
    GET_PERMISSIONS,
    GET_PERMISSIONSOFROLE,
    GET_PERMISSIONSMAPPED,
    GET_ROLES,
    ADD_ROLE,
    UPDATE_ROLE,
    DELETE_ROLE,
    DELETE_MODULE,
    UPDATE_MODULE,
} from "../types";

const initialState = {
    modules: [],
    permissions: {},
    permissionsOfRole: [],
    permissionsMapped: [],
    roles: [],
    loading: false,
    snackbarMessage: "",
    snackbarSeverity: "",
};

export default function rbacReducer(state = initialState, action) {
    switch (action.type) {
        case RBAC_LOADING:
            return { ...state, loading: true };
        case GET_MODULES:
            return { ...state, modules: action.payload, loading: false };
        case ADD_MODULE:
            return { ...state, modules: [...state.modules, action.payload], loading: false };
        case UPDATE_MODULE: {
            const { moduleId, module_name } = action.payload;
            const updatedModules = state.modules.map((mod) => (mod.id === parseInt(moduleId) ? { ...mod, module_name } : mod));
            return {
                ...state,
                modules: updatedModules,
                loading: false,
            };
        }
        case DELETE_MODULE:
            const updatedModules = state.modules.filter((mod) => mod.id !== parseInt(action.payload));
            const { [action.payload]: removed, ...updatedPermissions } = state.permissions;
            return {
                ...state,
                modules: updatedModules,
                permissions: updatedPermissions,
                loading: false,
            };
        case GET_PERMISSIONS:
            return { ...state, permissions: action.payload, loading: false };
        case GET_PERMISSIONSOFROLE:
            return {
                ...state,
                permissionsOfRole: action.payload,
                loading: false,
            };
        case GET_PERMISSIONSMAPPED:
            return {
                ...state,
                permissionsMapped: action.payload,
                loading: false,
            };
        case "TOGGLE_PERMISSION": {
            const { moduleId, permission } = action.payload;
            const currentModulePermissions = state.permissions[moduleId] || {};
            const updatedPermissionValue = !currentModulePermissions[permission];
            return {
                ...state,
                permissions: {
                    ...state.permissions,
                    [moduleId]: {
                        ...currentModulePermissions,
                        [permission]: updatedPermissionValue,
                    },
                },
            };
        }
        case "RESET_PERMISSIONS":
            return {
                ...state,
                permissions: action.payload,
            };
        case GET_ROLES:
            return { ...state, roles: action.payload, loading: false };
        case ADD_ROLE:
            return {
                ...state,
                roles: state.roles.some((r) => r.id === action.payload.id) ? state.roles : [...state.roles, action.payload],
                loading: false,
            };
        case UPDATE_ROLE:
            return {
                ...state,
                roles: state.roles.map((r) => (r.id === action.payload.id ? action.payload : r)),
                loading: false,
            };
        case DELETE_ROLE:
            return {
                ...state,
                roles: state.roles.filter((role) => role.id !== parseInt(action.payload)),
                loading: false,
            };
        case RBAC_SUCCESS:
            return { ...state, snackbarMessage: action.payload, snackbarSeverity: "success", loading: false };
        case RBAC_ERROR:
            return { ...state, snackbarMessage: action.payload, snackbarSeverity: "error", loading: false };
        case CLEAR_SNACKBAR:
            return { ...state, snackbarMessage: "", snackbarSeverity: "" };
        default:
            return state;
    }
}
