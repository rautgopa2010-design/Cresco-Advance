import api from "../../utils/api";
import {
  GET_COUNTRY_CODE,
  ADD_COUNTRY_CODE,
  UPDATE_COUNTRY_CODE,
  DELETE_COUNTRY_CODE,
  COUNTRY_CODE_ERROR,
  COUNTRY_CODE_SUCCESS,
  COUNTRY_CODE_LOADING,
} from "../types";

export const getCountryCode = () => async (dispatch) => {
  dispatch({ type: COUNTRY_CODE_LOADING });
  try {
    const res = await api.get("/country-code");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_COUNTRY_CODE, payload: sorted });
  } catch (err) {
    console.error("Get Country Code Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get country code";
    dispatch({ type: COUNTRY_CODE_ERROR, payload: message });
  }
};

export const createCountryCode = (data) => async (dispatch, getState) => {
  dispatch({ type: COUNTRY_CODE_LOADING });
  try {
    const res = await api.post("/country-code/create", data);
    const countryList = getState().country.country;
    const selectedCountry = countryList.find((c) => c.country === data.Country || c.id === data.countryId);

    const formatted = {
      ...res.data,
      phoneCode: data.phoneCode,
      country: {
        country: selectedCountry ? selectedCountry.country : data.Country,
        id: selectedCountry?.id ?? null,
        date: data.date,
      },
    };

    dispatch({ type: ADD_COUNTRY_CODE, payload: formatted });
    dispatch({ type: COUNTRY_CODE_SUCCESS, payload: "Country Code added successfully" });
  } catch (err) {
    console.error("Create Country Code Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      (err.response?.status === 409
        ? err.response.data.message
        : err.response?.data?.message) ||
      "Failed to add country code";
    dispatch({ type: COUNTRY_CODE_ERROR, payload: message });
  }
};

export const updateCountryCode = (id, data) => async (dispatch, getState) => {
  dispatch({ type: COUNTRY_CODE_LOADING });
  try {
    await api.put(`/country-code/edit/${id}`, data);
    const countryList = getState().country.country;
    const selectedCountry = countryList.find((c) => c.country === data.Country || c.id === data.countryId);

    const formatted = {
      ...data,
      phoneCode: data.phoneCode,
      country: {
        country: selectedCountry ? selectedCountry.country : data.Country,
        id: selectedCountry?.id ?? null,
        date: data.date,
      },
    };

    dispatch({ type: UPDATE_COUNTRY_CODE, payload: { id, data: formatted } });
    dispatch({ type: COUNTRY_CODE_SUCCESS, payload: "Country Code updated successfully" });
  } catch (err) {
    console.error("Update Country Code Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      (err.response?.status === 409
        ? err.response.data.message
        : err.response?.data?.message) ||
      "Failed to update country code";
    dispatch({ type: COUNTRY_CODE_ERROR, payload: message });
  }
};

export const deleteCountryCode = (id) => async (dispatch) => {
  dispatch({ type: COUNTRY_CODE_LOADING });
  try {
    await api.delete(`/country-code/${id}`);
    dispatch({ type: DELETE_COUNTRY_CODE, payload: id });
    dispatch({ type: COUNTRY_CODE_SUCCESS, payload: "Country Code deleted successfully" });
  } catch (err) {
    console.error("Delete Country Code Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete country code";
    dispatch({ type: COUNTRY_CODE_ERROR, payload: message });
  }
};
