import api from "../../utils/api";
import {
  GET_LEADS,
  ADD_LEAD,
  UPDATE_LEAD,
  DELETE_LEAD,
  DELETE_LEAD_FILE,
  ADD_FOLLOWUP,
  GET_FOLLOWUPS,
  UPDATE_FOLLOWUP,
  DELETE_FOLLOWUP,
  LEAD_ERROR,
  LEAD_SUCCESS,
  LEAD_LOADING,
  FOLLOWUP_ERROR,
  FOLLOWUP_SUCCESS,
  FOLLOWUP_LOADING,
} from "../types";

export const getLeads = () => async (dispatch) => {
  dispatch({ type: LEAD_LOADING });
  try {
    const res = await api.get("/lead");
    dispatch({ type: GET_LEADS, payload: res.data });
  } catch (err) {
    console.error("Get Leads Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get leads";
    dispatch({ type: LEAD_ERROR, payload: message });
  }
};

export const createLead = (formData) => async (dispatch) => {
  dispatch({ type: LEAD_LOADING });
  try {
    const res = await api.post("/lead/create", formData);
    dispatch({ type: ADD_LEAD, payload: res.data });
    dispatch({ type: LEAD_SUCCESS, payload: res.data.message });
  } catch (err) {
    console.error("Create Lead Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||    err.message ||
      "Failed to create lead";
    dispatch({ type: LEAD_ERROR, payload: message });
  }
};

export const updateLead = (lead_id, formData) => async (dispatch) => {
  dispatch({ type: LEAD_LOADING });
  try {
    const res = await api.put(`/lead/update/${lead_id}`, formData);
    dispatch({ type: UPDATE_LEAD, payload: { lead_id, formData } });
    dispatch({ type: LEAD_SUCCESS, payload: res.data.message });
  } catch (err) {
    console.error("Update Lead Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update lead";
    dispatch({ type: LEAD_ERROR, payload: message });
  }
};

export const updateLeadPipeline = (lead_id, data) => async (dispatch) => {
  dispatch({ type: LEAD_LOADING });
  try {
    const res = await api.patch(`/lead/pipeline/${lead_id}`, data);
    dispatch({ type: UPDATE_LEAD, payload: { lead_id, formData: data } });
    dispatch({ type: LEAD_SUCCESS, payload: res.data.message });
    return res.data;
  } catch (err) {
    console.error("Update Lead Pipeline Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update pipeline stage";
    dispatch({ type: LEAD_ERROR, payload: message });
    throw err;
  }
};

export const deleteLead = (lead_id) => async (dispatch) => {
  dispatch({ type: LEAD_LOADING });
  try {
    await api.delete(`/lead/${lead_id}`);
    dispatch({ type: DELETE_LEAD, payload: lead_id });
    dispatch({ type: LEAD_SUCCESS, payload: "Lead deleted successfully" });
  } catch (err) {
    console.error("Delete Lead Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete lead";
    dispatch({ type: LEAD_ERROR, payload: message });
  }
};

export const deleteLeadFile = (lead_id, filename) => async (dispatch) => {
  dispatch({ type: LEAD_LOADING });
  try {
    await api.delete(`/lead/${lead_id}/file/${filename}`);
    dispatch({ type: DELETE_LEAD_FILE, payload: { lead_id, filename } });
    dispatch({ type: LEAD_SUCCESS, payload: "Lead File deleted successfully" });
  } catch (err) {
    console.error("Delete Lead File Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete lead file";
    dispatch({ type: LEAD_ERROR, payload: message });
  }
};

export const addFollowup = (data) => async (dispatch) => {
  dispatch({ type: FOLLOWUP_LOADING });
  try {
    const res = await api.post("/lead/followup", data);
    dispatch({ type: ADD_FOLLOWUP, payload: res.data.followup });
    dispatch({ type: FOLLOWUP_SUCCESS, payload: res.data.message });
  } catch (err) {
    console.error("Add Followup Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add follow-up";
    dispatch({ type: FOLLOWUP_ERROR, payload: message });
  }
};

export const getFollowupsByLead = (lead_id) => async (dispatch) => {
  dispatch({ type: FOLLOWUP_LOADING });
  try {
    const res = await api.get(`/lead/followup/${lead_id}`);
    dispatch({ type: GET_FOLLOWUPS, payload: res.data });
  } catch (err) {
    console.error("Get Followups Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch followups";
    dispatch({ type: FOLLOWUP_ERROR, payload: message });
  }
};

export const updateFollowup = (id, data) => async (dispatch) => {
  dispatch({ type: FOLLOWUP_LOADING });
  try {
    const res = await api.put(`/lead/followup/${id}`, data);
    dispatch({ type: UPDATE_FOLLOWUP, payload: { id, data } });
    dispatch({ type: FOLLOWUP_SUCCESS, payload: res.data.message });
  } catch (err) {
    console.error("Update Followup Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update follow-up";
    dispatch({ type: FOLLOWUP_ERROR, payload: message });
  }
};

export const deleteFollowup = (id) => async (dispatch) => {
  dispatch({ type: FOLLOWUP_LOADING });
  try {
    await api.delete(`/lead/followup/${id}`);
    dispatch({ type: DELETE_FOLLOWUP, payload: id });
    dispatch({ type: FOLLOWUP_SUCCESS, payload: "Follow-up deleted successfully" });
  } catch (err) {
    console.error("Delete Followup Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete follow-up";
    dispatch({ type: FOLLOWUP_ERROR, payload: message });
  }
};

export const markFollowupCompleted = (followupId) => async (dispatch) => {
  dispatch({ type: FOLLOWUP_LOADING });
  try {
    const res = await api.put(`/lead/followup/${followupId}/complete`);
    dispatch({ 
      type: UPDATE_FOLLOWUP, 
      payload: { 
        id: followupId, 
        data: { isCompleted: true, completedAt: new Date().toISOString() } 
      } 
    });
    dispatch({ type: FOLLOWUP_SUCCESS, payload: res.data.message });
    return res.data;
  } catch (err) {
    console.error("Mark Followup Completed Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to mark follow-up as completed";
    dispatch({ type: FOLLOWUP_ERROR, payload: message });
    throw err;
  }
};
