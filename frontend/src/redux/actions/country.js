import api from "../../utils/api";
import {
  ADD_COUNTRY,
  GET_COUNTRY,
  UPDATE_COUNTRY,
  DELETE_COUNTRY,
  COUNTRY_ERROR,
  COUNTRY_SUCCESS,
  COUNTRY_LOADING,
} from "../types";

export const getCountry = () => async (dispatch) => {
  dispatch({ type: COUNTRY_LOADING });
  try {
    const res = await api.get("/country");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_COUNTRY, payload: sorted });
  } catch (err) {
    console.error("Get Country Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get country";
    dispatch({ type: COUNTRY_ERROR, payload: message });
  }
};

export const createCountry = (data) => async (dispatch) => {
  dispatch({ type: COUNTRY_LOADING });
  try {
    const res = await api.post("/country/create", data);
    dispatch({ type: ADD_COUNTRY, payload: res.data });
    dispatch({ type: COUNTRY_SUCCESS, payload: "Country created successfully" });
  } catch (err) {
    console.error("Create Country Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add country";
    dispatch({ type: COUNTRY_ERROR, payload: message });
  }
};

export const updateCountry = (id, data) => async (dispatch) => {
  dispatch({ type: COUNTRY_LOADING });
  try {
    await api.put(`/country/edit/${id}`, data);
    dispatch({ type: UPDATE_COUNTRY, payload: { id, data } });
    dispatch({ type: COUNTRY_SUCCESS, payload: "Country updated successfully" });
  } catch (err) {
    console.error("Update Country Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update country";
    dispatch({ type: COUNTRY_ERROR, payload: message });
  }
};

export const deleteCountry = (id) => async (dispatch) => {
  dispatch({ type: COUNTRY_LOADING });
  try {
    await api.delete(`/country/${id}`);
    dispatch({ type: DELETE_COUNTRY, payload: id });
    dispatch({ type: COUNTRY_SUCCESS, payload: "Country deleted successfully" });
  } catch (err) {
    console.error("Delete Country Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete country";
    dispatch({ type: COUNTRY_ERROR, payload: message });
  }
};
