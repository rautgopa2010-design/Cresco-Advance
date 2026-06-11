import api from "../../utils/api";
import setAuthToken from "../../utils/setAuthToken";
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOGOUT,
    AUTH_SUCCESS,
    AUTH_ERROR,
    AUTH_LOADING,
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

export const registerUserByProvider = (formData) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/register-by-provider", formData);
        dispatch({ type: PROVIDER_REGISTER_ORG_SUCCESS, payload: res.data });
        dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Registration successful" });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Registration failed";
        dispatch({ type: PROVIDER_REGISTER_ORG_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const registerUser = (formData, navigate) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });

    try {
        const res = await api.post("/auth/register", formData);

        const { token, user, message } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthToken(token);

        dispatch({ type: REGISTER_SUCCESS, payload: { token, user } });
        dispatch({ type: AUTH_SUCCESS, payload: message });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Registration failed";

        dispatch({ type: REGISTER_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const forgotPasswordSendMail = (body) => async (dispatch) => {
    try {
        const res = await api.post("/auth/forgotPassword", body);
        dispatch({ type: FORGOT_PASSWORD, payload: res.data });
        dispatch({
            type: AUTH_SUCCESS,
            payload: res.data.message || "Password reset email sent",
        });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to send reset email";

        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const verifyResetToken = (body) => async (dispatch) => {
    try {
        const res = await api.post("/auth/verifyResetToken", body);
        dispatch({ type: VERIFY_TOKEN_SUCCESS, payload: res.data });
        dispatch({
            type: AUTH_SUCCESS,
            payload: res.data.message || "Token verified successfully",
        });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Token verification failed";

        dispatch({ type: VERIFY_TOKEN_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const resetPassword = (body) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/resetPassword", body);

        dispatch({ type: RESET_PASSWORD_SUCCESS, payload: res.data });
        dispatch({
            type: AUTH_SUCCESS,
            payload: res.data.message || "Password reset successful",
        });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Password reset failed";

        dispatch({ type: RESET_PASSWORD_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const loginUser = (credentials) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/signin", credentials);
        const { token, user, message } = res.data;

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthToken(token);

        dispatch({ type: LOGIN_SUCCESS, payload: { token, user } });
        dispatch({ type: AUTH_SUCCESS, payload: message || "Login successful" });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Login failed";
        dispatch({ type: LOGIN_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const logoutUser = () => (dispatch) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");

    dispatch({ type: USER_LOGOUT });
    dispatch({ type: CLEAR_SNACKBAR });
};

export const selectPackage = (packageId) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/select-package", { packageId });

        // BACKEND now returns { token, user, message, ... }
        const token = res.data.token;
        const user = res.data.user;

        if (token && user) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setAuthToken(token);

            dispatch({ type: PACKAGE_SELECT_SUCCESS, payload: user });
            dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package selected successfully" });

            return { success: true, token, user };
        } else {
            // fallback
            const updatedUser = {
                ...JSON.parse(localStorage.getItem("user") || "{}"),
                ...res.data.package,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            dispatch({ type: PACKAGE_SELECT_SUCCESS, payload: updatedUser });
            dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package selected" });
            return { success: true, user: updatedUser };
        }
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Package selection failed";

        dispatch({ type: PACKAGE_SELECT_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
        return { success: false, message };
    }
};

// // old
// export const createPaymentOrder = (packageId) => async (dispatch) => {
//     dispatch({ type: AUTH_LOADING });
//     try {
//         const res = await api.post("/auth/create-order", { packageId });

//         return res.data; // 👈 return flag so component knows it's done
//     } catch (err) {
//         const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Package activation failled!";

//         dispatch({ type: PACKAGE_SELECT_FAIL });
//         dispatch({ type: AUTH_ERROR, payload: message });
//         return false;
//     }
// };

export const createPaymentOrder = (packageId) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/create-order", { packageId });
        // ✅ Return the full response data
        return res.data;
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Package activation failed!";
        dispatch({ type: PACKAGE_SELECT_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
        // ✅ Return false to indicate failure
        return false;
    }
};

// // old
// export const verifyPaymentOrder = (payload) => async (dispatch) => {
//     dispatch({ type: AUTH_LOADING });
//     try {
//         const res = await api.post("/auth/verify-payment", payload);

//         // BACKEND now returns token + user in success response
//         const token = res.data.token;
//         const user = res.data.user;

//         if (token && user) {
//             localStorage.setItem("token", token);
//             localStorage.setItem("user", JSON.stringify(user));
//             setAuthToken(token);

//             dispatch({ type: PACKAGE_SELECT_SUCCESS, payload: user });
//             dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package activated successfully!" });

//             return { success: true, data: res.data };
//         } else {
//             // fallback if backend changed formatting
//             const updatedUser = {
//                 ...JSON.parse(localStorage.getItem("user") || "{}"),
//                 ...res.data.package,
//             };
//             localStorage.setItem("user", JSON.stringify(updatedUser));
//             dispatch({ type: PACKAGE_SELECT_SUCCESS, payload: updatedUser });
//             dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package activated" });
//             return { success: true, data: res.data };
//         }
//     } catch (err) {
//         const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Package activation failed!";
//         dispatch({ type: PACKAGE_SELECT_FAIL });
//         dispatch({ type: AUTH_ERROR, payload: message });
//         return { success: false, message };
//     }
// };

export const verifyPaymentOrder = (payload) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/verify-payment", payload);

        // BACKEND now returns token + user in success response
        const token = res.data.token;
        const user = res.data.user;

        if (token && user) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setAuthToken(token);

            dispatch({ type: PACKAGE_SELECT_SUCCESS, payload: user });
            dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package activated successfully!" });

            // ✅ Make sure we're returning success: true
            return { success: true, data: res.data };
        } else {
            // fallback if backend changed formatting
            const updatedUser = {
                ...JSON.parse(localStorage.getItem("user") || "{}"),
                ...res.data.package,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            dispatch({ type: PACKAGE_SELECT_SUCCESS, payload: updatedUser });
            dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package activated" });
            
            // ✅ Make sure we're returning success: true
            return { success: true, data: res.data };
        }
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Package activation failed!";
        dispatch({ type: PACKAGE_SELECT_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
        
        // ✅ Return success: false with error message
        return { success: false, message };
    }
};

export const toggleAccountActivity = (orgId, status) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/toggle-account-activity", {
            orgId,
            status: status === "Activate" ? "Deactivate" : "Activate",
        });

        // Refresh organization info after toggle
        dispatch(getOrganizationInfo());

        dispatch({
            type: AUTH_SUCCESS,
            payload: res.data.message || `Account ${status === "Activate" ? "deactivated" : "activated"} successfully`,
        });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update account status";
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const getOrganizationInfo = () => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.get("/auth/organization-info");

        dispatch({
            type: GET_ORGANIZATION_INFO_SUCCESS,
            payload: res.data, // full response containing main provider + organizations
        });

        return res.data; // return data for component usage
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch organization info";

        dispatch({ type: GET_ORGANIZATION_INFO_FAIL });
        dispatch({ type: AUTH_ERROR, payload: message });
        return null;
    }
};

export const assignFreePackageByProvider = (targetOrgId, packageId) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/assign-package-by-provider", {
            targetOrgId,
            packageId,
            numUsers: packageId.maxUsers,
            totalAmount: 0,
            paymentMethod: "Free",
        });

        dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Free package assigned successfully" });
        dispatch(getOrganizationInfo());
        return { success: true };
    } catch (err) {
        const message = err.response?.data?.message || "Failed to assign free package";
        dispatch({ type: AUTH_ERROR, payload: message });
        return { success: false };
    }
};

export const assignPackageCashByProvider = (data) => async (dispatch) => {
    dispatch({ type: AUTH_LOADING });
    try {
        const res = await api.post("/auth/assign-package-by-provider", {
            ...data,
            paymentMethod: "Cash",
        });
        dispatch({ type: AUTH_SUCCESS, payload: res.data.message || "Package assigned (Cash payment)" });
        dispatch(getOrganizationInfo());
        return { success: true };
    } catch (err) {
        const message = err.response?.data?.message || "Cash payment recording failed";
        dispatch({ type: AUTH_ERROR, payload: message });
        return { success: false };
    }
};
