// import axios from "axios";
// import store from "../redux/store";
// import { USER_LOGOUT } from "../redux/types";

// export const API_BASE_URL = "http://localhost:8200/api";
// export const IMAGE_BASE_URL = "http://localhost:8200";
// // export const API_BASE_URL = "https://crescosoft.com/api";
// // export const IMAGE_BASE_URL = "https://crescosoft.com";

// const api = axios.create({
//     baseURL: API_BASE_URL,
// });

// // Request interceptor to ensure token is always in correct format
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             // Always set as Bearer token
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Response interceptor for 401 handling
// api.interceptors.response.use(
//     (res) => res,
//     (err) => {
//         if (err.response?.status === 401) {
//             const errorCode = err.response.data?.code;
//             const errorMsg = err.response.data?.msg;

//             console.log("Auth error:", errorMsg, errorCode);

//             // Clear auth state immediately
//             store.dispatch({ type: USER_LOGOUT });
//             localStorage.removeItem("token");
//             localStorage.removeItem("user");

//             // Redirect based on error type
//             if (errorCode === "TOKEN_EXPIRED") {
//                 window.location.href = "/signin?session=expired";
//             } else {
//                 window.location.href = "/signin";
//             }
//         }
//         return Promise.reject(err);
//     },
// );

// export default api;

import axios from "axios";
import store from "../redux/store";
import { USER_LOGOUT } from "../redux/types";

const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8200";
const API_ORIGIN = (import.meta.env.VITE_API_URL || currentOrigin).replace(/\/api\/?$/, "").replace(/\/$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const IMAGE_BASE_URL = API_ORIGIN;

// export const API_BASE_URL = "https://crescosoft.com/api";
// export const IMAGE_BASE_URL = "https://crescosoft.com";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to ensure token is always in correct format
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor for 401 handling
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status;
        const url = err.config?.url || "";

        // ────── SPECIAL CASE: Do NOT logout on login attempt failures ──────
        const isLoginAttempt = url.includes("/auth/signin");

        if (status === 401) {
            if (isLoginAttempt) {
                // Let the login action handle the error normally
                // Do NOT clear token or redirect
                return Promise.reject(err);
            }

            // For all other 401s (expired token, protected routes, etc.)
            console.log("Auth error (non-login):", err.response?.data);

            store.dispatch({ type: USER_LOGOUT });
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Optional: better UX with query param
            window.location.href = "/signin?session=expired";
        }

        return Promise.reject(err);
    },
);

export default api;
