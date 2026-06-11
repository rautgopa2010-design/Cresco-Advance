import api from "../../utils/api";
import {
  GET_T_AND_C_AND_DEC,
  ADD_T_AND_C_AND_DEC,
  UPDATE_T_AND_C_AND_DEC,
  DELETE_T_AND_C_AND_DEC,
  T_AND_C_AND_DEC_ERROR,
  T_AND_C_AND_DEC_SUCCESS,
  T_AND_C_AND_DEC_LOADING,
  GET_DEFAULT_T_AND_C_AND_DEC,
} from "../types";

export const getTAndCAndDec = (type = null) => async (dispatch) => {
  dispatch({ type: T_AND_C_AND_DEC_LOADING });
  try {
    const url = type ? `/t-and-c-and-dec?type=${type}` : "/t-and-c-and-dec";
    const res = await api.get(url);
    dispatch({ type: GET_T_AND_C_AND_DEC, payload: res.data });
  } catch (err) {
    console.error("Get T&C/Description Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get entries";
    dispatch({ type: T_AND_C_AND_DEC_ERROR, payload: message });
  }
};

export const getDefaultTAndCAndDec = (type) => async (dispatch) => {
  dispatch({ type: T_AND_C_AND_DEC_LOADING });
  try {
    const res = await api.get(`/t-and-c-and-dec/default/${type}`);
    dispatch({ type: GET_DEFAULT_T_AND_C_AND_DEC, payload: res.data });
  } catch (err) {
    console.error("Get Default T&C/Description Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get default entry";
    dispatch({ type: T_AND_C_AND_DEC_ERROR, payload: message });
  }
};

export const createTAndCAndDec = (data) => async (dispatch) => {
  dispatch({ type: T_AND_C_AND_DEC_LOADING });
  try {
    const res = await api.post("/t-and-c-and-dec/create", data);
    dispatch({ type: ADD_T_AND_C_AND_DEC, payload: res.data });
    dispatch({ type: T_AND_C_AND_DEC_SUCCESS, payload: "Entry created successfully" });
  } catch (err) {
    console.error("Create T&C/Description Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to create entry";
    dispatch({ type: T_AND_C_AND_DEC_ERROR, payload: message });
  }
};

export const updateTAndCAndDec = (id, data) => async (dispatch) => {
  dispatch({ type: T_AND_C_AND_DEC_LOADING });
  try {
    await api.put(`/t-and-c-and-dec/edit/${id}`, data);
    dispatch({ type: UPDATE_T_AND_C_AND_DEC, payload: { id, data } });
    dispatch({ type: T_AND_C_AND_DEC_SUCCESS, payload: "Entry updated successfully" });
  } catch (err) {
    console.error("Update T&C/Description Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update entry";
    dispatch({ type: T_AND_C_AND_DEC_ERROR, payload: message });
  }
};

export const deleteTAndCAndDec = (id) => async (dispatch) => {
  dispatch({ type: T_AND_C_AND_DEC_LOADING });
  try {
    await api.delete(`/t-and-c-and-dec/${id}`);
    dispatch({ type: DELETE_T_AND_C_AND_DEC, payload: id });
    dispatch({ type: T_AND_C_AND_DEC_SUCCESS, payload: "Entry deleted successfully" });
  } catch (err) {
    console.error("Delete T&C/Description Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete entry";
    dispatch({ type: T_AND_C_AND_DEC_ERROR, payload: message });
  }
};