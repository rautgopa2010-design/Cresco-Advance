import api from "../../utils/api";
import { GET_APIS, ADD_API, UPDATE_API, DELETE_API, API_LOADING, API_SUCCESS, API_ERROR, GET_API_LEADS, UPDATE_LEAD_STATUS } from "../types";

// Get all APIs
export const getAPIs = () => async (dispatch) => {
    dispatch({ type: API_LOADING });
    try {
        const res = await api.get("/api-master");
        const sorted = res.data.sort((a, b) => a.id - b.id);
        dispatch({ type: GET_APIS, payload: sorted });
    } catch (err) {
        console.error("Get APIs Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch APIs";
        dispatch({ type: API_ERROR, payload: message });
    }
};

// Create API
export const createAPI = (data) => async (dispatch) => {
    dispatch({ type: API_LOADING });
    try {
        const res = await api.post("/api-master/create", data);
        dispatch({ type: ADD_API, payload: { ...data, id: res.data.apiId } });
        dispatch({ type: API_SUCCESS, payload: "API created successfully" });
    } catch (err) {
        console.error("Create API Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to create API";
        dispatch({ type: API_ERROR, payload: message });
    }
};

// Update API
export const updateAPI = (id, data) => async (dispatch) => {
    dispatch({ type: API_LOADING });
    try {
        await api.put(`/api-master/edit/${id}`, data);
        dispatch({ type: UPDATE_API, payload: { id, data } });
        dispatch({ type: API_SUCCESS, payload: "API updated successfully" });
    } catch (err) {
        console.error("Update API Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update API";
        dispatch({ type: API_ERROR, payload: message });
    }
};

// Delete API
export const deleteAPI = (id) => async (dispatch) => {
    dispatch({ type: API_LOADING });
    try {
        await api.delete(`/api-master/${id}`);
        dispatch({ type: DELETE_API, payload: id });
        dispatch({ type: API_SUCCESS, payload: "API deleted successfully" });
    } catch (err) {
        console.error("Delete API Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete API";
        dispatch({ type: API_ERROR, payload: message });
    }
};

// Hit API
export const hitAPI = (id) => async (dispatch) => {
  dispatch({ type: API_LOADING });
  try {
      const res = await api.get(`/api-master/hit/${id}`);
      // refresh leads after hit
      dispatch(getAPILeads(id));  
      dispatch({ type: API_SUCCESS, payload: "API hit successfully" });
      return res.data; 
  } catch (err) {
      console.error("Hit API Error:", err);
      const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to hit API";
      dispatch({ type: API_ERROR, payload: message });
  }
};

// ✅ Fetch leads for a given API
export const getAPILeads = (apiId) => async (dispatch) => {
    dispatch({ type: API_LOADING });
    try {
        const res = await api.get(`/api-master/leads/${apiId}`);
        const sorted = res.data.sort((a, b) => a.id - b.id);
        dispatch({ type: GET_API_LEADS, payload: sorted });
    } catch (err) {
        console.error("Get Leads Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch leads";
        dispatch({ type: API_ERROR, payload: message });
    }
};

// ✅ Update Lead Status
export const updateLeadStatus = (id, status) => async (dispatch) => {
    dispatch({ type: API_LOADING });
    try {
        await api.put(`/api-master/lead/${id}/status`, { status });
        dispatch({ type: UPDATE_LEAD_STATUS, payload: { id, status } });
        dispatch({ type: API_SUCCESS, payload: "Lead status updated successfully" });
    } catch (err) {
        console.error("Update Lead Status Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update lead status";
        dispatch({ type: API_ERROR, payload: message });
    }
};
