import api from "../../utils/api";
import {
    GET_COMPANY_SETUP,
    UPDATE_COMPANY_SETUP,
    UPLOAD_COMPANY_LOGO,
    REMOVE_COMPANY_LOGO,
    COMPANY_SETUP_LOADING,
    COMPANY_SETUP_SUCCESS,
    COMPANY_SETUP_ERROR,
} from "../types";

// Get all company setup
export const getCompanySetup = () => async (dispatch) => {
    dispatch({ type: COMPANY_SETUP_LOADING });
    try {
        const res = await api.get("/company-setup");
        dispatch({ type: GET_COMPANY_SETUP, payload: res.data });
        return res.data;
    } catch (err) {
        console.error("Get Company Setup Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch company setup";
        dispatch({ type: COMPANY_SETUP_ERROR, payload: message });
        return null;
    }
};

// updateCompanySetup action
export const updateCompanySetup = (id, formData) => async (dispatch) => {
    dispatch({ type: COMPANY_SETUP_LOADING });
    try {
        // Do NOT create FormData here; it comes from handleSubmit
        await api.put(`/company-setup/edit/${id}`, formData);

        dispatch({ type: UPDATE_COMPANY_SETUP, payload: { id, data: {} } }); // optional update in state
        dispatch({
            type: COMPANY_SETUP_SUCCESS,
            payload: "Company setup updated successfully",
        });
    } catch (err) {
        console.error("Update Company Setup Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update company setup";
        dispatch({ type: COMPANY_SETUP_ERROR, payload: message });
    }
};

// Upload company logo
export const uploadCompanyLogo = (file) => async (dispatch) => {
    dispatch({ type: COMPANY_SETUP_LOADING });
    try {
        const formData = new FormData();
        formData.append("companyLogo", file);

        const res = await api.post("/company-setup/upload-logo", formData);

        dispatch({
            type: UPLOAD_COMPANY_LOGO,
            payload: res.data.logo,
        });

        dispatch({
            type: COMPANY_SETUP_SUCCESS,
            payload: "Logo uploaded successfully",
        });
    } catch (err) {
        console.error("Upload Logo Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload logo";
        dispatch({ type: COMPANY_SETUP_ERROR, payload: message });
    }
};

// Remove company logo
export const removeCompanyLogo = () => async (dispatch) => {
    dispatch({ type: COMPANY_SETUP_LOADING });
    try {
        await api.delete("/company-setup/remove-logo");

        dispatch({
            type: REMOVE_COMPANY_LOGO,
        });

        dispatch({
            type: COMPANY_SETUP_SUCCESS,
            payload: "Logo removed successfully",
        });
    } catch (err) {
        console.error("Remove Logo Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove logo";
        dispatch({ type: COMPANY_SETUP_ERROR, payload: message });
    }
};
