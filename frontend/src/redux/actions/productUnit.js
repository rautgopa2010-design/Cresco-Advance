import api from "../../utils/api";
import {
  GET_PRODUCT_UNIT,
  ADD_PRODUCT_UNIT,
  UPDATE_PRODUCT_UNIT,
  DELETE_PRODUCT_UNIT,
  PRODUCT_UNIT_ERROR,
  PRODUCT_UNIT_SUCCESS,
  PRODUCT_UNIT_LOADING,
} from "../types";

export const getProductUnit = () => async (dispatch) => {
  dispatch({ type: PRODUCT_UNIT_LOADING });
  try {
    const res = await api.get("/product-product-unit");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_PRODUCT_UNIT, payload: sorted });
  } catch (err) {
    console.error("Get Product Unit Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get product unit";
    dispatch({ type: PRODUCT_UNIT_ERROR, payload: message });
  }
};

export const createProductUnit = (data) => async (dispatch) => {
  dispatch({ type: PRODUCT_UNIT_LOADING });
  try {
    const res = await api.post("/product-product-unit/create", data);
    dispatch({ type: ADD_PRODUCT_UNIT, payload: res.data });
    dispatch({ type: PRODUCT_UNIT_SUCCESS, payload: "Product Unit created successfully" });
  } catch (err) {
    console.error("Create Product Unit Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add product unit";
    dispatch({ type: PRODUCT_UNIT_ERROR, payload: message });
  }
};

export const updateProductUnit = (id, data) => async (dispatch) => {
  dispatch({ type: PRODUCT_UNIT_LOADING });
  try {
    await api.put(`/product-product-unit/edit/${id}`, data);
    dispatch({ type: UPDATE_PRODUCT_UNIT, payload: { id, data } });
    dispatch({ type: PRODUCT_UNIT_SUCCESS, payload: "Product Unit updated successfully" });
  } catch (err) {
    console.error("Update Product Unit Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update product unit";
    dispatch({ type: PRODUCT_UNIT_ERROR, payload: message });
  }
};

export const deleteProductUnit = (id) => async (dispatch) => {
  dispatch({ type: PRODUCT_UNIT_LOADING });
  try {
    await api.delete(`/product-product-unit/${id}`);
    dispatch({ type: DELETE_PRODUCT_UNIT, payload: id });
    dispatch({ type: PRODUCT_UNIT_SUCCESS, payload: "Product Unit deleted successfully" });
  } catch (err) {
    console.error("Delete Product Unit Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete product unit";
    dispatch({ type: PRODUCT_UNIT_ERROR, payload: message });
  }
};
