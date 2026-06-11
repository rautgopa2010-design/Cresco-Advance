import api from "../../utils/api";
import {
    RBAC_LOADING,
    RBAC_ERROR,
    RBAC_SUCCESS,
    GET_MODULES,
    ADD_MODULE,
    UPDATE_MODULE,
    DELETE_MODULE,
    GET_PERMISSIONS,
    GET_PERMISSIONSMAPPED,
    GET_PERMISSIONSOFROLE,
    GET_ROLES,
    ADD_ROLE,
    UPDATE_ROLE,
    DELETE_ROLE,
} from "../types";

// Modules
export const getModules = () => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.get("/role-management/modules");
        dispatch({ type: GET_MODULES, payload: res.data.modules });
    } catch (err) {
        console.error("Get Modules Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to get modules";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

export const createModule = (module_name) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.post("/role-management/module", { module_name });
        dispatch({ type: ADD_MODULE, payload: res.data.module });
        dispatch({ type: RBAC_SUCCESS, payload: res.data.message });
    } catch (err) {
        console.error("Create Module Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to create module";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

export const updateModule = (moduleId, module_name) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.put(`/role-management/module/${moduleId}`, { module_name });
        dispatch({ type: UPDATE_MODULE, payload: { moduleId, module_name } });
        dispatch({ type: RBAC_SUCCESS, payload: res.data.message });
    } catch (err) {
        console.error("Update Module Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update module";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

export const deleteModule = (moduleId) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.delete(`/role-management/module/${moduleId}`);
        dispatch({ type: DELETE_MODULE, payload: moduleId });
        dispatch({ type: RBAC_SUCCESS, payload: res.data.message });
    } catch (err) {
        console.error("Delete Module Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete module";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Fetch all permissions
export const getPermissions = () => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.get("/role-management/permissions");
        dispatch({ type: GET_PERMISSIONS, payload: res.data.permissions });
    } catch (err) {
        console.error("Get Permissions Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch permissions";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Fetch permissions of a specific role
export const getPermissionsOfRole = (roleId) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.get(`/role-management/role/${roleId}/permissions`);
        dispatch({ type: GET_PERMISSIONSOFROLE, payload: res.data.permissions });
    } catch (err) {
        console.error("Get Role Permissions Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch role permissions";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Fetch permissions mapped with modules
export const getPermissionsMapped = (roleId) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.get(`/role-management/role/${roleId}/permissions-map`);
        dispatch({ type: GET_PERMISSIONSMAPPED, payload: res.data.permissions });
    } catch (err) {
        console.error("Get Mapped Permissions Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch mapped permissions";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Get all roles
export const getRoles = () => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.get("/role-management/roles");
        dispatch({ type: GET_ROLES, payload: res.data.roles });
    } catch (err) {
        console.error("Get Roles Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch roles";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Add new role
export const addRole = (data) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.post("/role-management/role", data);
        dispatch({ type: ADD_ROLE, payload: res.data.role });
        dispatch({ type: RBAC_SUCCESS, payload: res.data.message || "Role added successfully" });
    } catch (err) {
        console.error("Add Role Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to add role";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Update existing role
export const updateRole = (data) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.put("/role-management/role", data);
        dispatch({ type: UPDATE_ROLE, payload: res.data.role });
        dispatch({ type: RBAC_SUCCESS, payload: res.data.message || "Role updated successfully" });
    } catch (err) {
        console.error("Update Role Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update role";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};

// Delete a role
export const deleteRole = (roleId) => async (dispatch) => {
    dispatch({ type: RBAC_LOADING });
    try {
        const res = await api.delete(`/role-management/role/${roleId}`);
        dispatch({ type: DELETE_ROLE, payload: roleId });
        dispatch({ type: RBAC_SUCCESS, payload: res.data.message || "Role deleted successfully" });
    } catch (err) {
        console.error("Delete Role Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete role";
        dispatch({ type: RBAC_ERROR, payload: message });
    }
};
