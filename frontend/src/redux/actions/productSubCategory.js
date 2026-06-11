import api from "../../utils/api";
import {
  GET_PRODUCT_SUB_CATEGORY,
  ADD_PRODUCT_SUB_CATEGORY,
  UPDATE_PRODUCT_SUB_CATEGORY,
  DELETE_PRODUCT_SUB_CATEGORY,
  PRODUCT_SUB_CATEGORY_ERROR,
  PRODUCT_SUB_CATEGORY_SUCCESS,
  PRODUCT_SUB_CATEGORY_LOADING,
} from "../types";

export const getProductSubCategory = () => async (dispatch) => {
  dispatch({ type: PRODUCT_SUB_CATEGORY_LOADING });
  try {
    const res = await api.get("/product-sub-category");

    const mapped = res.data.map((item) => ({
      id: item.id,
      brand: item.productBrand.productBrand,
      productBrandId: item.productBrandId,
      category: item.productCategory.productCategory,
      productCategoryId: item.productCategoryId,
      productCategoryName: item.productCategoryName,
      subCategories: item.productSubCategory.split(",").map((s) => s.trim()),
      date: item.date,
    }));

    const sorted = mapped.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_PRODUCT_SUB_CATEGORY, payload: sorted });
  } catch (err) {
    console.error("Get Sub-Categories Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get product sub category";
    dispatch({ type: PRODUCT_SUB_CATEGORY_ERROR, payload: message });
  }
};

export const createProductSubCategory = (data) => async (dispatch, getState) => {
  dispatch({ type: PRODUCT_SUB_CATEGORY_LOADING });
  try {
    const res = await api.post("/product-sub-category/create", data);

    const brandList = getState().productBrand.productBrand;
    const brand = brandList.find((bran) => bran.id === data.productBrandId);
    const categoryList = getState().productCategory.productCategory;
    const category = categoryList.find((cat) => cat.id === data.productCategoryId);

    const formatted = {
      id: res.data.id,
      brand: brand ? brand.productBrand : "",
      productBrandId: data.productBrandId,
      category: category ? category.productCategory : "",
      productCategoryId: data.productCategoryId,
      productCategoryName: data.productCategoryName,
      subCategories: data.productSubCategories,
      date: data.date,
    };

    dispatch({ type: ADD_PRODUCT_SUB_CATEGORY, payload: formatted });
    dispatch({ type: PRODUCT_SUB_CATEGORY_SUCCESS, payload: "Sub Categories added successfully" });
  } catch (err) {
    console.error("Create Sub-Categories Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add subcategories";
    dispatch({ type: PRODUCT_SUB_CATEGORY_ERROR, payload: message });
  }
};

export const updateProductSubCategory = (id, data) => async (dispatch, getState) => {
  dispatch({ type: PRODUCT_SUB_CATEGORY_LOADING });
  try {
    await api.put(`/product-sub-category/edit/${id}`, data);

    const brandList = getState().productBrand.productBrand;
    const brand = brandList.find((cat) => cat.id === data.productBrandId);
    const categoryList = getState().productCategory.productCategory;
    const category = categoryList.find((cat) => cat.id === data.productCategoryId);

    const formatted = {
      id,
      brand: brand ? brand.productBrand: "",
      productBrandId: data.productBrandId,
      category: category ? category.productCategory : "",
      productCategoryId: data.productCategoryId,
      productCategoryName: data.productCategoryName,
      subCategories: data.productSubCategories,
      date: data.date,
    };

    dispatch({ type: UPDATE_PRODUCT_SUB_CATEGORY, payload: { id, data: formatted } });
    dispatch({ type: PRODUCT_SUB_CATEGORY_SUCCESS, payload: "Product Sub-Categories updated successfully" });
  } catch (err) {
    console.error("Update Sub-Categories Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update subcategories";
    dispatch({ type: PRODUCT_SUB_CATEGORY_ERROR, payload: message });
  }
};

export const deleteProductSubCategory = (id) => async (dispatch) => {
  dispatch({ type: PRODUCT_SUB_CATEGORY_LOADING });
  try {
    await api.delete(`/product-sub-category/${id}`);
    dispatch({ type: DELETE_PRODUCT_SUB_CATEGORY, payload: id });
    dispatch({ type: PRODUCT_SUB_CATEGORY_SUCCESS, payload: "Product Sub Category Deleted Successfully" });
  } catch (err) {
    console.error("Delete Sub-Categories Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete product sub category";
    dispatch({ type: PRODUCT_SUB_CATEGORY_ERROR, payload: message });
  }
};
