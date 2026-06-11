import api from "../../utils/api";
import {
  ADD_STAGE,
  GET_STAGE,
  UPDATE_STAGE,
  DELETE_STAGE,
  STAGE_ERROR,
  STAGE_SUCCESS,
  STAGE_LOADING,
} from "../types";

// Get all lead stages
export const getLeadStage = () => async (dispatch) => {
  dispatch({ type: STAGE_LOADING });
  try {
    const res = await api.get("/lead-stage");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_STAGE, payload: sorted });
  } catch (err) {
    console.error("Get Lead Stage Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get lead stage";
    dispatch({ type: STAGE_ERROR, payload: message });
  }
};

// Create new lead stage
export const createLeadStage = (data) => async (dispatch) => {
  dispatch({ type: STAGE_LOADING });
  try {
    const res = await api.post("/lead-stage/create", data);
    dispatch({ type: ADD_STAGE, payload: res.data });
    dispatch({ type: STAGE_SUCCESS, payload: "Lead Stage created successfully" });
  } catch (err) {
    console.error("Create Lead Stage Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add lead stage";
    dispatch({ type: STAGE_ERROR, payload: message });
  }
};

// Update lead stage
export const updateLeadStage = (id, data) => async (dispatch) => {
  dispatch({ type: STAGE_LOADING });
  try {
    await api.put(`/lead-stage/edit/${id}`, data);
    dispatch({ type: UPDATE_STAGE, payload: { id, data } });
    dispatch({ type: STAGE_SUCCESS, payload: "Lead Stage updated successfully" });
  } catch (err) {
    console.error("Update Lead Stage Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update lead stage";
    dispatch({ type: STAGE_ERROR, payload: message });
  }
};

// Delete lead stage
export const deleteLeadStage = (id) => async (dispatch) => {
  dispatch({ type: STAGE_LOADING });
  try {
    await api.delete(`/lead-stage/${id}`);
    dispatch({ type: DELETE_STAGE, payload: id });
    dispatch({ type: STAGE_SUCCESS, payload: "Lead Stage deleted successfully" });
  } catch (err) {
    console.error("Delete Lead Stage Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete lead stage";
    dispatch({ type: STAGE_ERROR, payload: message });
  }
};
