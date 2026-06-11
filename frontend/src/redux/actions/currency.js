import api from "../../utils/api";
import {
  GET_CURRENCY,
  ADD_CURRENCY,
  UPDATE_CURRENCY,
  DELETE_CURRENCY,
  CURRENCY_ERROR,
  CURRENCY_SUCCESS,
  CURRENCY_LOADING,
} from "../types";

export const getCurrency = () => async (dispatch) => {
  dispatch({ type: CURRENCY_LOADING });
  try {
    const res = await api.get("/currency");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_CURRENCY, payload: sorted });
  } catch (err) {
    console.error("Get Currency Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get currency";
    dispatch({ type: CURRENCY_ERROR, payload: message });
  }
};

export const createCurrency = (data) => async (dispatch, getState) => {
  dispatch({ type: CURRENCY_LOADING });
  try {
    const res = await api.post("/currency/create", data);
    const countryList = getState().country.country;
    const selectedCountry = countryList.find((c) => c.country === data.Country);

    const formatted = {
      ...res.data,
      country: {
        country: selectedCountry ? selectedCountry.country : data.Country,
        id: selectedCountry?.id ?? null,
        date: data.date,
      },
    };

    dispatch({ type: ADD_CURRENCY, payload: formatted });
    dispatch({ type: CURRENCY_SUCCESS, payload: "Currency added successfully" });
  } catch (err) {
    console.error("Create Currency Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add currency";
    dispatch({ type: CURRENCY_ERROR, payload: message });
  }
};

export const updateCurrency = (id, data) => async (dispatch, getState) => {
  dispatch({ type: CURRENCY_LOADING });
  try {
    await api.put(`/currency/edit/${id}`, data);
    const countryList = getState().country.country;
    const selectedCountry = countryList.find((c) => c.country === data.Country);

    const formatted = {
      ...data,
      country: {
        country: selectedCountry ? selectedCountry.country : data.Country,
        id: selectedCountry?.id ?? null,
        date: data.date,
      },
    };

    dispatch({ type: UPDATE_CURRENCY, payload: { id, data: formatted } });
    dispatch({ type: CURRENCY_SUCCESS, payload: "Currency updated successfully" });
  } catch (err) {
    console.error("Update Currency Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update currency";
    dispatch({ type: CURRENCY_ERROR, payload: message });
  }
};

export const deleteCurrency = (id) => async (dispatch) => {
  dispatch({ type: CURRENCY_LOADING });
  try {
    await api.delete(`/currency/${id}`);
    dispatch({ type: DELETE_CURRENCY, payload: id });
    dispatch({ type: CURRENCY_SUCCESS, payload: "Currency deleted successfully" });
  } catch (err) {
    console.error("Delete Currency Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete currency";
    dispatch({ type: CURRENCY_ERROR, payload: message });
  }
};
