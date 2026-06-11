import api from "../../utils/api";
import { GET_PRODUCT, ADD_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, PRODUCT_ERROR, PRODUCT_SUCCESS, PRODUCT_LOADING } from "../types";

export const getProduct = () => async (dispatch) => {
    dispatch({ type: PRODUCT_LOADING });
    try {
        const res = await api.get("/product");

        const mapped = res.data.map((item) => ({
            id: item.id,
            brand: item.productBrand.productBrand,
            productBrandId: item.productBrandId,
            category: item.productCategory.productCategory,
            productCategoryId: item.productCategoryId,
            productCategoryName: item.productCategoryName,
            subCategory: item.productSubCategory.productSubCategory,
            productSubCategoryId: item.productSubCategoryId,
            productSubCategoryName: item.productSubCategoryName,
            hsnCode: item.hsnCode,
            productUnitId: item.productUnitId,
            productUnitName: item.productUnitName || "",
            product: item.product ? [item.product] : [],
            productPrice: item.productPrice,
            description: item.description || "",
            date: item.date,
        }));

        const sorted = mapped.sort((a, b) => b.id - a.id);
        dispatch({ type: GET_PRODUCT, payload: sorted });
    } catch (err) {
        console.error("Get Product Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to get products";
        dispatch({ type: PRODUCT_ERROR, payload: message });
    }
};

export const createProduct = (data) => async (dispatch, getState) => {
    dispatch({ type: PRODUCT_LOADING });
    try {
        const res = await api.post("/product/create", data);
        const brandList = getState().productBrand.productBrand;
        const brand = brandList.find((bran) => bran.id === data.productBrandId);
        const categoryList = getState().productCategory.productCategory;
        const category = categoryList.find((cat) => cat.id === data.productCategoryId);
        const subCategoryList = getState().productSubCategory.productSubCategory;
        const subCategory = subCategoryList.find((sub) => sub.id === data.productSubCategoryId);

        const formatted = {
            id: res.data.id,
            brand: brand ? brand.productBrand : "",
            productBrandId: data.productBrandId,
            category: category ? category.productCategory : "",
            productCategoryId: data.productCategoryId,
            productCategoryName: data.productCategoryName,
            subCategory: subCategory ? subCategory.productSubCategory : "",
            productSubCategoryId: data.productSubCategoryId,
            productSubCategoryName: data.productSubCategoryName,
            hsnCode: data.hsnCode,
            productUnitId: data.productUnitId,
            productUnitName: data.productUnitName || "",
            product: data.product ? [data.product] : [],
            productPrice: data.productPrice,
            description: res.data.description
                ? res.data.description.replace(/<[^>]+>/g, "")
                : "",
            date: data.date,
        };

        dispatch({ type: ADD_PRODUCT, payload: formatted });
        dispatch({ type: PRODUCT_SUCCESS, payload: "Product added successfully" });
    } catch (err) {
        console.error("Create Product Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to add product";
        dispatch({ type: PRODUCT_ERROR, payload: message });
    }
};

export const updateProduct = (id, data) => async (dispatch, getState) => {
    dispatch({ type: PRODUCT_LOADING });
    try {
        await api.put(`/product/edit/${id}`, data);
        const brandList = getState().productBrand.productBrand;
        const brand = brandList.find((bran) => bran.id === data.productBrandId);
        const categoryList = getState().productCategory.productCategory;
        const category = categoryList.find((cat) => cat.id === data.productCategoryId);
        const subCategoryList = getState().productSubCategory.productSubCategory;
        const subCategory = subCategoryList.find((sub) => sub.id === data.productSubCategoryId);

        const formatted = {
            id,
            brand: brand ? brand.productBrand : "",
            productBrandId: data.productBrandId,
            category: category ? category.productCategory : "",
            productCategoryId: data.productCategoryId,
            productCategoryName: data.productCategoryName,
            subCategory: subCategory ? subCategory.productSubCategory : "",
            productSubCategoryId: data.productSubCategoryId,
            productSubCategoryName: data.productSubCategoryName,
            hsnCode: data.hsnCode,
            productUnitId: data.productUnitId,
            productUnitName: data.productUnitName || "",
            product: data.product ? [data.product] : [],
            productPrice: data.productPrice,
            description: data.description
                ? data.description.replace(/<[^>]+>/g, "")
                : "",
            date: data.date,
        };

        dispatch({ type: UPDATE_PRODUCT, payload: { id, data: formatted } });
        dispatch({ type: PRODUCT_SUCCESS, payload: "Product updated successfully" });
    } catch (err) {
        console.error("Update Product Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update product";
        dispatch({ type: PRODUCT_ERROR, payload: message });
    }
};

export const deleteProduct = (id) => async (dispatch) => {
    dispatch({ type: PRODUCT_LOADING });
    try {
        await api.delete(`/product/${id}`);
        dispatch({ type: DELETE_PRODUCT, payload: id });
        dispatch({ type: PRODUCT_SUCCESS, payload: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete Product Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete product";
        dispatch({ type: PRODUCT_ERROR, payload: message });
    }
};

export const importProducts = (productsArray) => async (dispatch) => {
    dispatch({ type: PRODUCT_LOADING });

    try {
        const res = await api.post("/product/import", { products: productsArray });

        if (res.data.success) {
            dispatch({
                type: PRODUCT_SUCCESS,
                payload: res.data.message || `Imported ${res.data.imported} products successfully`,
            });
            dispatch(getProduct()); // refresh list
        } else {
            dispatch({
                type: PRODUCT_ERROR,
                payload: res.data.errors?.join?.("\n") || res.data.message || "Import failed",
            });
        }
    } catch (err) {
        const msg = err.response?.data?.errors?.join?.("\n")
            || err.response?.data?.message
            || "Bulk import failed. Check file format.";
        dispatch({ type: PRODUCT_ERROR, payload: msg });
    }
};