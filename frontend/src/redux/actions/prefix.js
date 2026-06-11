import api from "../../utils/api";
import {
  GET_PREFIX,
  UPSERT_PREFIX,
  DELETE_PREFIX,
  PREFIX_LOADING,
  PREFIX_SUCCESS,
  PREFIX_ERROR,
} from "../types";

export const getPrefix = () => async (dispatch) => {
  dispatch({ type: PREFIX_LOADING });
  try {
    const res = await api.get("/prefix");
    dispatch({ type: GET_PREFIX, payload: res.data });
  } catch (err) {
    console.error("Get Prefix Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get prefix";
    dispatch({
      type: PREFIX_ERROR,
      payload: message
    });
  }
};

export const createOrUpdatePrefix = (data) => async (dispatch) => {
  dispatch({ type: PREFIX_LOADING });
  try {
    const res = await api.post("/prefix", data);
    dispatch({ type: UPSERT_PREFIX, payload: res.data.prefix });
    dispatch({ type: PREFIX_SUCCESS, payload: res.data.message });
  } catch (err) {
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to save prefix";
    dispatch({
      type: PREFIX_ERROR,
      payload: message
    });
  }
};

export const deletePrefix = () => async (dispatch) => {
  dispatch({ type: PREFIX_LOADING });
  try {
    await api.delete("/prefix");
    dispatch({ type: DELETE_PREFIX });
    dispatch({ type: PREFIX_SUCCESS, payload: "Prefix settings reset successfully" });
  } catch (err) {
    dispatch({
      type: PREFIX_ERROR,
      payload: err.response?.data?.message || "Failed to reset prefix",
    });
  }
};
