import api from "../../utils/api";
import {
  ADD_STATUS,
  GET_STATUS,
  UPDATE_STATUS,
  DELETE_STATUS,
  STATUS_ERROR,
  STATUS_SUCCESS,
  STATUS_LOADING,
} from "../types";

export const getLeadStatus = () => async (dispatch) => {
  dispatch({ type: STATUS_LOADING });
  try {
    const res = await api.get("/lead-status");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_STATUS, payload: sorted });
  } catch (err) {
    console.error("Get Lead Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get lead status";
    dispatch({ type: STATUS_ERROR, payload: message });
  }
};

export const createLeadStatus = (data) => async (dispatch) => {
  dispatch({ type: STATUS_LOADING });
  try {
    const res = await api.post("/lead-status/create", data);
    dispatch({ type: ADD_STATUS, payload: res.data });
    dispatch({ type: STATUS_SUCCESS, payload: "Lead Status created successfully" });
  } catch (err) {
    console.error("Create Lead Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add lead status";
    dispatch({ type: STATUS_ERROR, payload: message });
  }
};

export const updateLeadStatus = (id, data) => async (dispatch) => {
  dispatch({ type: STATUS_LOADING });
  try {
    await api.put(`/lead-status/edit/${id}`, data);
    dispatch({ type: UPDATE_STATUS, payload: { id, data } });
    dispatch({ type: STATUS_SUCCESS, payload: "Lead Status updated successfully" });
  } catch (err) {
    console.error("Update Lead Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update lead status";
    dispatch({ type: STATUS_ERROR, payload: message });
  }
};

export const deleteLeadStatus = (id) => async (dispatch) => {
  dispatch({ type: STATUS_LOADING });
  try {
    await api.delete(`/lead-status/${id}`);
    dispatch({ type: DELETE_STATUS, payload: id });
    dispatch({ type: STATUS_SUCCESS, payload: "Lead Status deleted successfully" });
  } catch (err) {
    console.error("Delete Lead Status Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete lead status";
    dispatch({ type: STATUS_ERROR, payload: message });
  }
};
