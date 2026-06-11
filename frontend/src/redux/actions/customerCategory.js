import api from "../../utils/api";
import {
  ADD_CUSTOMER_CATEGORY,
  GET_CUSTOMER_CATEGORY,
  UPDATE_CUSTOMER_CATEGORY,
  DELETE_CUSTOMER_CATEGORY,
  CUSTOMER_CATEGORY_ERROR,
  CUSTOMER_CATEGORY_SUCCESS,
  CUSTOMER_CATEGORY_LOADING,
} from "../types";

export const getCustomerCategory = () => async (dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_LOADING });
  try {
    const res = await api.get("/customer-category");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_CUSTOMER_CATEGORY, payload: sorted });
  } catch (err) {
    console.error("Get Customer Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get customer category";
    dispatch({ type: CUSTOMER_CATEGORY_ERROR, payload: message });
  }
};

export const createCustomerCategory = (data) => async (dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_LOADING });
  try {
    const res = await api.post("/customer-category/create", data);
    dispatch({ type: ADD_CUSTOMER_CATEGORY, payload: res.data });
    dispatch({ type: CUSTOMER_CATEGORY_SUCCESS, payload: "Customer Category created successfully" });
  } catch (err) {
    console.error("Create Customer Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add customer category";
    dispatch({ type: CUSTOMER_CATEGORY_ERROR, payload: message });
  }
};

export const updateCustomerCategory = (id, data) => async (dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_LOADING });
  try {
    await api.put(`/customer-category/edit/${id}`, data);
    dispatch({ type: UPDATE_CUSTOMER_CATEGORY, payload: { id, data } });
    dispatch({ type: CUSTOMER_CATEGORY_SUCCESS, payload: "Customer Category updated successfully" });
  } catch (err) {
    console.error("Update Customer Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update customer category";
    dispatch({ type: CUSTOMER_CATEGORY_ERROR, payload: message });
  }
};

export const deleteCustomerCategory = (id) => async (dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_LOADING });
  try {
    await api.delete(`/customer-category/${id}`);
    dispatch({ type: DELETE_CUSTOMER_CATEGORY, payload: id });
    dispatch({ type: CUSTOMER_CATEGORY_SUCCESS, payload: "Customer Category deleted successfully" });
  } catch (err) {
    console.error("Delete Customer Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete customer category";
    dispatch({ type: CUSTOMER_CATEGORY_ERROR, payload: message });
  }
};
