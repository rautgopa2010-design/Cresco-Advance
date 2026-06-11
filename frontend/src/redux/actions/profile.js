import api from "../../utils/api";
import {
    GET_PROFILE,
    UPDATE_PROFILE,
    UPLOAD_PROFILE_IMAGE,
    REMOVE_PROFILE_IMAGE,
    PROFILE_LOADING,
    PROFILE_SUCCESS,
    PROFILE_ERROR,
    COMPANY_SETUP_ERROR,
} from "../types";

// Get all profile
export const getProfile = () => async (dispatch) => {
    dispatch({ type: PROFILE_LOADING });
    try {
        const res = await api.get("/profile");
        dispatch({ type: GET_PROFILE, payload: res.data });
        return res.data;
    } catch (err) {
        console.error("Get Profile Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch profile";
        dispatch({ type: COMPANY_SETUP_ERROR, payload: message });
        return null;
    }
};

// updateProfile action
export const updateProfile = (id, formData) => async (dispatch) => {
    dispatch({ type: PROFILE_LOADING });
    try {
        // Do NOT create FormData here; it comes from handleSubmit
        await api.put(`/profile/edit/${id}`, formData);

        dispatch({ type: UPDATE_PROFILE, payload: { id, data: {} } }); // optional update in state
        dispatch({
            type: PROFILE_SUCCESS,
            payload: "Profile updated successfully",
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update profile";
        dispatch({ type: PROFILE_ERROR, payload: message });
    }
};

// Upload profile image
export const uploadProfileImage = (file) => async (dispatch) => {
    dispatch({ type: PROFILE_LOADING });
    try {
        const formData = new FormData();
        formData.append("profileImage", file);

        const res = await api.post("/profile/upload-profile-image", formData);

        dispatch({
            type: UPLOAD_PROFILE_IMAGE,
            payload: res.data.profileImage,
        });

        dispatch({
            type: PROFILE_SUCCESS,
            payload: "Profile Image uploaded successfully",
        });
    } catch (err) {
        console.error("Upload Profile Image Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload profile image";
        dispatch({ type: PROFILE_ERROR, payload: message });
    }
};

// Remove profile image
export const removeProfileImage = () => async (dispatch) => {
    dispatch({ type: PROFILE_LOADING });
    try {
        await api.delete("/profile/remove-profile-image");

        dispatch({
            type: REMOVE_PROFILE_IMAGE,
        });

        dispatch({
            type: PROFILE_SUCCESS,
            payload: "Profile Image removed successfully",
        });
    } catch (err) {
        console.error("Remove Profile Image Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove profile image";
        dispatch({ type: PROFILE_ERROR, payload: message });
    }
};
