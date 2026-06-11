import api from "../../utils/api";
import {
  GET_BANKS,
  GET_BANK_BY_ID,
  ADD_BANK,
  UPDATE_BANK,
  DELETE_BANK,
  BANK_LOADING,
  BANK_ERROR,
  BANK_SUCCESS,
} from "../types";

export const getBanks = () => async (dispatch) => {
  dispatch({ type: BANK_LOADING });
  try {
    const res = await api.get("/bank-details");
    dispatch({
      type: GET_BANKS,
      payload: res.data.data,
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to fetch bank accounts";
    dispatch({ type: BANK_ERROR, payload: message });
    return null;
  }
};

export const getBankById = (id) => async (dispatch) => {
  dispatch({ type: BANK_LOADING });
  try {
    const res = await api.get(`/bank-details/${id}`);
    dispatch({
      type: GET_BANK_BY_ID,
      payload: res.data.data,
    });
    return res.data.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to fetch bank account";
    dispatch({ type: BANK_ERROR, payload: message });
    return null;
  }
};

export const addBank = (formData, onSuccess) => async (dispatch) => {
  dispatch({ type: BANK_LOADING });
  try {
    const res = await api.post("/bank-details", formData);
    dispatch({
      type: ADD_BANK,
      payload: res.data.data,
    });
    dispatch({
      type: BANK_SUCCESS,
      payload: res.data.message || "Bank account added successfully",
    });
    if (onSuccess) onSuccess();
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || "Failed to add bank account";
    dispatch({ type: BANK_ERROR, payload: message });
    return { success: false, message };
  }
};

export const updateBank = (id, formData, onSuccess) => async (dispatch) => {
  dispatch({ type: BANK_LOADING });
  try {
    const res = await api.put(`/bank-details/${id}`, formData);
    dispatch({
      type: UPDATE_BANK,
      payload: res.data.data,
    });
    dispatch({
      type: BANK_SUCCESS,
      payload: res.data.message || "Bank account updated successfully",
    });
    if (onSuccess) onSuccess();
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || "Failed to update bank account";
    dispatch({ type: BANK_ERROR, payload: message });
    return { success: false, message };
  }
};

export const deleteBank = (id, onSuccess) => async (dispatch) => {
  dispatch({ type: BANK_LOADING });
  try {
    await api.delete(`/bank-details/${id}`);
    dispatch({
      type: DELETE_BANK,
      payload: id,
    });
    dispatch({
      type: BANK_SUCCESS,
      payload: "Bank account deleted successfully",
    });
    if (onSuccess) onSuccess();
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || "Failed to delete bank account";
    dispatch({ type: BANK_ERROR, payload: message });
    return { success: false, message };
  }
};

export const clearBankSuccess = () => (dispatch) => {
  dispatch({ type: BANK_SUCCESS, payload: "" });
};