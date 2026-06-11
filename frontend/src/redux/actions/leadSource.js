import api from "../../utils/api";
import {
  GET_SOURCE,
  ADD_SOURCE,
  UPDATE_SOURCE,
  DELETE_SOURCE,
  SOURCE_ERROR,
  SOURCE_SUCCESS,
  SOURCE_LOADING,
} from "../types";

export const getLeadSource = () => async (dispatch) => {
  dispatch({ type: SOURCE_LOADING });
  try {
    const res = await api.get("/lead-source");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_SOURCE, payload: sorted });
  } catch (err) {
    console.error("Get Lead Source Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get lead source";
    dispatch({ type: SOURCE_ERROR, payload: message });
  }
};

export const createLeadSource = (data) => async (dispatch) => {
  dispatch({ type: SOURCE_LOADING });
  try {
    const res = await api.post("/lead-source/create", data);
    dispatch({ type: ADD_SOURCE, payload: res.data });
    dispatch({ type: SOURCE_SUCCESS, payload: "Lead Source created successfully" });
  } catch (err) {
    console.error("Create Lead Source Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add lead source";
    dispatch({ type: SOURCE_ERROR, payload: message });
  }
};

export const updateLeadSource = (id, data) => async (dispatch) => {
  dispatch({ type: SOURCE_LOADING });
  try {
    await api.put(`/lead-source/edit/${id}`, data);
    dispatch({ type: UPDATE_SOURCE, payload: { id, data } });
    dispatch({ type: SOURCE_SUCCESS, payload: "Lead Source updated successfully" });
  } catch (err) {
    console.error("Update Lead Source Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update lead source";
    dispatch({ type: SOURCE_ERROR, payload: message });
  }
};

export const deleteLeadSource = (id) => async (dispatch) => {
  dispatch({ type: SOURCE_LOADING });
  try {
    await api.delete(`/lead-source/${id}`);
    dispatch({ type: DELETE_SOURCE, payload: id });
    dispatch({ type: SOURCE_SUCCESS, payload: "Lead Source deleted successfully" });
  } catch (err) {
    console.error("Delete Lead Source Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete lead source";
    dispatch({ type: SOURCE_ERROR, payload: message });
  }
};
