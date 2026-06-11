import api from "../../utils/api";
import {
  GET_PRODUCT_CATEGORY,
  ADD_PRODUCT_CATEGORY,
  UPDATE_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY,
  PRODUCT_CATEGORY_ERROR,
  PRODUCT_CATEGORY_SUCCESS,
  PRODUCT_CATEGORY_LOADING,
} from "../types";

export const getProductCategory = () => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_LOADING });
  try {
    const res = await api.get("/product-category");

    const mapped = res.data.map((item) => ({
      id: item.id,
      brand: item.productBrand.productBrand,
      productBrandId: item.productBrandId,
      categories: item.productCategory.split(",").map((s) => s.trim()),
      date: item.date,
    }));

    const sorted = mapped.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_PRODUCT_CATEGORY, payload: sorted });
  } catch (err) {
    console.error("Get Product Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get product category";
    dispatch({ type: PRODUCT_CATEGORY_ERROR, payload: message });
  }
};

export const createProductCategory = (data) => async (dispatch, getState) => {
  dispatch({ type: PRODUCT_CATEGORY_LOADING });
  try {
    const res = await api.post("/product-category/create", data);

    const brandList = getState().productBrand.productBrand;
    const brand = brandList.find((cat) => cat.id === data.productBrandId);

    const formatted = {
      id: res.data.id,
      brand: brand ? brand.productBrand : "",
      productBrandId: res.data.productBrandId,
      categories: res.data.productCategory
        ? res.data.productCategory.split(",").map((s) => s.trim())
        : [],
      date: res.data.date,
    };

    dispatch({ type: ADD_PRODUCT_CATEGORY, payload: formatted });
    dispatch({ type: PRODUCT_CATEGORY_SUCCESS, payload: "Product Category created successfully" });
  } catch (err) {
    console.error("Create Product Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add product category";
    dispatch({ type: PRODUCT_CATEGORY_ERROR, payload: message });
  }
};

export const updateProductCategory = (id, data) => async (dispatch, getState) => {
  dispatch({ type: PRODUCT_CATEGORY_LOADING });
  try {
    await api.put(`/product-category/edit/${id}`, data);

    const brandList = getState().productBrand.productBrand;
    const brand = brandList.find((cat) => cat.id === data.productBrandId);

    const categoriesArray = Array.isArray(data.productCategory)
    ? data.productCategory.map((s) => s.trim())
    : data.productCategory.split(",").map((s) => s.trim());

    const formatted = {
      id,
      brand: brand ? brand.productBrand: "",
      productBrandId: data.productBrandId,
      categories: categoriesArray,
      date: data.date,
    };

    dispatch({ type: UPDATE_PRODUCT_CATEGORY, payload: { id, data: formatted } });
    dispatch({ type: PRODUCT_CATEGORY_SUCCESS, payload: "Product Category updated successfully" });
  } catch (err) {
    console.error("Update Product Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update product category";
    dispatch({ type: PRODUCT_CATEGORY_ERROR, payload: message });
  }
};

export const deleteProductCategory = (id) => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_LOADING });
  try {
    await api.delete(`/product-category/${id}`);
    dispatch({ type: DELETE_PRODUCT_CATEGORY, payload: id });
    dispatch({ type: PRODUCT_CATEGORY_SUCCESS, payload: "Product Category deleted successfully" });
  } catch (err) {
    console.error("Delete Product Category Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete product category";
    dispatch({ type: PRODUCT_CATEGORY_ERROR, payload: message });
  }
};
