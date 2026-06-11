import api from "../../utils/api";
import {
  GET_PACKAGES,
  ADD_PACKAGE,
  UPDATE_PACKAGE,
  DELETE_PACKAGE,
  PACKAGE_LOADING,
  PACKAGE_SUCCESS,
  PACKAGE_ERROR,
  GET_PACKAGE_BY_ID,
} from "../types";

// ✅ Get all packages
export const getPackages = () => async (dispatch) => {
  dispatch({ type: PACKAGE_LOADING });
  try {
    const res = await api.get("/package");
    // Sort by ID ascending (oldest first) — adjust if needed
    const sorted = res.data.sort((a, b) => a.id - b.id);
    dispatch({ type: GET_PACKAGES, payload: sorted });
  } catch (err) {
    console.error("Get Packages Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch packages";
    dispatch({ type: PACKAGE_ERROR, payload: message });
  }
};

// ✅ Create package
export const createPackage = (data) => async (dispatch) => {
  dispatch({ type: PACKAGE_LOADING });
  try {
    const res = await api.post("/package/create", data);

    // Since backend only returns { message, packageId }, refetch all packages for fresh data
    dispatch(getPackages()); // Best: ensures modules and full data are loaded

    dispatch({
      type: PACKAGE_SUCCESS,
      payload: res.data.message || "Package created successfully",
    });
  } catch (err) {
    console.error("Create Package Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to create package";
    dispatch({ type: PACKAGE_ERROR, payload: message });
  }
};

// ✅ Update package
export const updatePackage = (data) => async (dispatch) => {
  // Note: data now includes { id, ...formFields }
  const { id } = data;

  dispatch({ type: PACKAGE_LOADING });
  try {
    const res = await api.put(`/package/edit/${id}`, data);

    // Refetch all packages to get updated data with modules
    dispatch(getPackages());

    // Optionally refetch single if needed elsewhere
    // dispatch(getPackageById(id));

    dispatch({
      type: PACKAGE_SUCCESS,
      payload: res.data.message || "Package updated successfully",
    });
  } catch (err) {
    console.error("Update Package Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update package";
    dispatch({ type: PACKAGE_ERROR, payload: message });
  }
};

// ✅ Delete package
export const deletePackage = (id) => async (dispatch) => {
  dispatch({ type: PACKAGE_LOADING });
  try {
    await api.delete(`/package/${id}`);

    dispatch({ type: DELETE_PACKAGE, payload: id });
    dispatch({
      type: PACKAGE_SUCCESS,
      payload: "Package deleted successfully",
    });
  } catch (err) {
    console.error("Delete Package Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete package";
    dispatch({ type: PACKAGE_ERROR, payload: message });
  }
};

// ✅ Get single package by ID (for Edit form)
export const getPackageById = (id) => async (dispatch) => {
  dispatch({ type: PACKAGE_LOADING });
  try {
    const res = await api.get(`/package/${id}`);
    dispatch({
      type: GET_PACKAGE_BY_ID,
      payload: res.data, // Full package object with modules
    });
    return res.data;
  } catch (err) {
    console.error("Get Package By ID Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch package details";
    dispatch({ type: PACKAGE_ERROR, payload: message });
    throw err; // Let component handle redirect or error UI
  }
};

// Optional: Clear current package (useful when leaving edit page)
export const clearCurrentPackage = () => ({
  type: GET_PACKAGE_BY_ID,
  payload: null,
});