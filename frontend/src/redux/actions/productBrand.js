import api from "../../utils/api";
import {
  GET_PRODUCT_BRAND,
  ADD_PRODUCT_BRAND,
  UPDATE_PRODUCT_BRAND,
  DELETE_PRODUCT_BRAND,
  PRODUCT_BRAND_ERROR,
  PRODUCT_BRAND_SUCCESS,
  PRODUCT_BRAND_LOADING,
} from "../types";

export const getProductBrand = () => async (dispatch) => {
  dispatch({ type: PRODUCT_BRAND_LOADING });
  try {
    const res = await api.get("/product-brand");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_PRODUCT_BRAND, payload: sorted });
  } catch (err) {
    console.error("Get Product Brand Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get product brand";
    dispatch({ type: PRODUCT_BRAND_ERROR, payload: message });
  }
};

export const createProductBrand = (data) => async (dispatch) => {
  dispatch({ type: PRODUCT_BRAND_LOADING });
  try {
    const res = await api.post("/product-brand/create", data);
    dispatch({ type: ADD_PRODUCT_BRAND, payload: res.data });
    dispatch({ type: PRODUCT_BRAND_SUCCESS, payload: "Product Brand created successfully" });
  } catch (err) {
    console.error("Create Product Brand Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add product brand";
    dispatch({ type: PRODUCT_BRAND_ERROR, payload: message });
  }
};

export const updateProductBrand = (id, data) => async (dispatch) => {
  dispatch({ type: PRODUCT_BRAND_LOADING });
  try {
    await api.put(`/product-brand/edit/${id}`, data);
    dispatch({ type: UPDATE_PRODUCT_BRAND, payload: { id, data } });
    dispatch({ type: PRODUCT_BRAND_SUCCESS, payload: "Product Brand updated successfully" });
  } catch (err) {
    console.error("Update Product Brand Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update product brand";
    dispatch({ type: PRODUCT_BRAND_ERROR, payload: message });
  }
};

export const deleteProductBrand = (id) => async (dispatch) => {
  dispatch({ type: PRODUCT_BRAND_LOADING });
  try {
    await api.delete(`/product-brand/${id}`);
    dispatch({ type: DELETE_PRODUCT_BRAND, payload: id });
    dispatch({ type: PRODUCT_BRAND_SUCCESS, payload: "Product Brand deleted successfully" });
  } catch (err) {
    console.error("Delete Product Brand Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete product brand";
    dispatch({ type: PRODUCT_BRAND_ERROR, payload: message });
  }
};
