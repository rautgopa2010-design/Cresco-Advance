import api from "../../utils/api";
import { GET_QUOTATIONS, ADD_QUOTATION, UPDATE_QUOTATION, DELETE_QUOTATION, QUOTATION_LOADING, QUOTATION_SUCCESS, QUOTATION_ERROR } from "../types";

// Get all quotations
export const getQuotations = () => async (dispatch) => {
    dispatch({ type: QUOTATION_LOADING });
    try {
        const res = await api.get("/quotation");
        const sorted = res.data.sort((a, b) => b.id - a.id);
        dispatch({ type: GET_QUOTATIONS, payload: sorted });
    } catch (err) {
        console.error("Get Quotations Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch quotations";
        dispatch({ type: QUOTATION_ERROR, payload: message });
    }
};

// Create quotation
export const createQuotation = (data) => async (dispatch) => {
    dispatch({ type: QUOTATION_LOADING });
    try {
        const res = await api.post("/quotation/create", data);
        dispatch({ type: ADD_QUOTATION, payload: { ...data, id: res.data.quotationId } });
        dispatch({ type: QUOTATION_SUCCESS, payload: "Quotation created successfully" });
    } catch (err) {
        console.error("Create Quotation Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to create quotation";
        dispatch({ type: QUOTATION_ERROR, payload: message });
    }
};

// Update quotation
export const updateQuotation = (id, data) => async (dispatch) => {
    dispatch({ type: QUOTATION_LOADING });
    try {
        const res = await api.put(`/quotation/edit/${id}`, data);
        dispatch({
            type: UPDATE_QUOTATION,
            payload: { id: res.data.quotationId, data },
        });
        dispatch({
            type: QUOTATION_SUCCESS,
            payload: "Quotation updated successfully",
        });
    } catch (err) {
        console.error("Update Quotation Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update quotation";
        dispatch({ type: QUOTATION_ERROR, payload: message });
    }
};

// Delete quotation
export const deleteQuotation = (id) => async (dispatch) => {
    dispatch({ type: QUOTATION_LOADING });
    try {
        await api.delete(`/quotation/${id}`);
        dispatch({ type: DELETE_QUOTATION, payload: id });
        dispatch({ type: QUOTATION_SUCCESS, payload: "Quotation deleted successfully" });
    } catch (err) {
        console.error("Delete Quotation Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete quotation";
        dispatch({ type: QUOTATION_ERROR, payload: message });
    }
};
