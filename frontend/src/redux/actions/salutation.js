import api from "../../utils/api";
import {
  ADD_SALUTATION,
  GET_SALUTATIONS,
  UPDATE_SALUTATION,
  DELETE_SALUTATION,
  SALUTATION_ERROR,
  SALUTATION_SUCCESS,
  SALUTATION_LOADING,
} from "../types";

export const getSalutations = () => async (dispatch) => {
  dispatch({ type: SALUTATION_LOADING });
  try {
    const res = await api.get("/salutations");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_SALUTATIONS, payload: sorted });
  } catch (err) {
    console.error("Get Salutations Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get salutation";
    dispatch({ type: SALUTATION_ERROR, payload: message });
  }
};

export const createSalutation = (data) => async (dispatch) => {
  dispatch({ type: SALUTATION_LOADING });
  try {
    const res = await api.post("/salutations/create", data);
    dispatch({ type: ADD_SALUTATION, payload: res.data });
    dispatch({ type: SALUTATION_SUCCESS, payload: "Salutation created successfully" });
  } catch (err) {
    console.error("Create Salutation Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add salutation";
    dispatch({ type: SALUTATION_ERROR, payload: message });
  }
};

export const updateSalutation = (id, data) => async (dispatch) => {
  dispatch({ type: SALUTATION_LOADING });
  try {
    await api.put(`/salutations/edit/${id}`, data);
    dispatch({ type: UPDATE_SALUTATION, payload: { id, data } });
    dispatch({ type: SALUTATION_SUCCESS, payload: "Salutation updated successfully" });
  } catch (err) {
    console.error("Update Salutation Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update salutation";
    dispatch({ type: SALUTATION_ERROR, payload: message });
  }
};

export const deleteSalutation = (id) => async (dispatch) => {
  dispatch({ type: SALUTATION_LOADING });
  try {
    await api.delete(`/salutations/${id}`);
    dispatch({ type: DELETE_SALUTATION, payload: id });
    dispatch({ type: SALUTATION_SUCCESS, payload: "Salutation deleted successfully" });
  } catch (err) {
    console.error("Delete Salutation Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete salutation";
    dispatch({ type: SALUTATION_ERROR, payload: message });
  }
};
