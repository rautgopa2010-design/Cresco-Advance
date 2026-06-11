import api from "../../utils/api";
import {
  ADD_INDUSTRY,
  GET_INDUSTRY,
  UPDATE_INDUSTRY,
  DELETE_INDUSTRY,
  INDUSTRY_ERROR,
  INDUSTRY_SUCCESS,
  INDUSTRY_LOADING,
} from "../types";

export const getIndustry = () => async (dispatch) => {
  dispatch({ type: INDUSTRY_LOADING });
  try {
    const res = await api.get("/industry");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_INDUSTRY, payload: sorted });
  } catch (err) {
    console.error("Get Industry Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get industry";
    dispatch({ type: INDUSTRY_ERROR, payload: message });
  }
};

export const createIndustry = (data) => async (dispatch) => {
  dispatch({ type: INDUSTRY_LOADING });
  try {
    const res = await api.post("/industry/create", data);
    dispatch({ type: ADD_INDUSTRY, payload: res.data });
    dispatch({ type: INDUSTRY_SUCCESS, payload: "Industry created successfully" });
  } catch (err) {
    console.error("Create Industry Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add industry";
    dispatch({ type: INDUSTRY_ERROR, payload: message });
  }
};

export const updateIndustry = (id, data) => async (dispatch) => {
  dispatch({ type: INDUSTRY_LOADING });
  try {
    await api.put(`/industry/edit/${id}`, data);
    dispatch({ type: UPDATE_INDUSTRY, payload: { id, data } });
    dispatch({ type: INDUSTRY_SUCCESS, payload: "Industry updated successfully" });
  } catch (err) {
    console.error("Update Industry Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update industry";
    dispatch({ type: INDUSTRY_ERROR, payload: message });
  }
};

export const deleteIndustry = (id) => async (dispatch) => {
  dispatch({ type: INDUSTRY_LOADING });
  try {
    await api.delete(`/industry/${id}`);
    dispatch({ type: DELETE_INDUSTRY, payload: id });
    dispatch({ type: INDUSTRY_SUCCESS, payload: "Industry deleted successfully" });
  } catch (err) {
    console.error("Delete Industry Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete industry";
    dispatch({ type: INDUSTRY_ERROR, payload: message });
  }
};
