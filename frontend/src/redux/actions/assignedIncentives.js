import api from "../../utils/api";
import {
  GET_ASSIGNED_INCENTIVES,
  CREATE_ASSIGNED_INCENTIVE,
  UPDATE_ASSIGNED_INCENTIVE,
  DELETE_ASSIGNED_INCENTIVE,
  ASSIGNED_INCENTIVES_LOADING,
  ASSIGNED_INCENTIVES_SUCCESS,
  ASSIGNED_INCENTIVES_ERROR,
} from "../types";

// ✅ Get all assigned incentives
export const getAssignedIncentives = () => async (dispatch) => {
  dispatch({ type: ASSIGNED_INCENTIVES_LOADING });
  try {
    const res = await api.get("/assigned-incentives");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_ASSIGNED_INCENTIVES, payload: sorted });
    return res.data;
  } catch (err) {
    console.error("Get Assigned Incentives Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch assigned incentives";
    dispatch({ type: ASSIGNED_INCENTIVES_ERROR, payload: message });
    return null;
  }
};

// ✅ Create new assigned incentive
export const createAssignedIncentive = (formData) => async (dispatch) => {
  dispatch({ type: ASSIGNED_INCENTIVES_LOADING });
  try {
    const res = await api.post("/assigned-incentives/create", formData);
    dispatch({ type: CREATE_ASSIGNED_INCENTIVE, payload: res.data.assigned });
    dispatch({
      type: ASSIGNED_INCENTIVES_SUCCESS,
      payload: "Incentive assigned successfully",
    });
    return res.data;
  } catch (err) {
    console.error("Create Assigned Incentive Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to assign incentive";
    dispatch({ type: ASSIGNED_INCENTIVES_ERROR, payload: message });
    return null;
  }
};

// ✅ Update assigned incentive
export const updateAssignedIncentive = (id, formData) => async (dispatch) => {
  dispatch({ type: ASSIGNED_INCENTIVES_LOADING });
  try {
    await api.put(`/assigned-incentives/edit/${id}`, formData);
    dispatch({ type: UPDATE_ASSIGNED_INCENTIVE, payload: { id, data: formData } });
    dispatch({
      type: ASSIGNED_INCENTIVES_SUCCESS,
      payload: "Assigned incentive updated successfully",
    });
  } catch (err) {
    console.error("Update Assigned Incentive Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update assigned incentive";
    dispatch({ type: ASSIGNED_INCENTIVES_ERROR, payload: message });
  }
};

// ✅ Delete assigned incentive
export const deleteAssignedIncentive = (id) => async (dispatch) => {
  dispatch({ type: ASSIGNED_INCENTIVES_LOADING });
  try {
    await api.delete(`/assigned-incentives/${id}`);
    dispatch({ type: DELETE_ASSIGNED_INCENTIVE, payload: id });
    dispatch({
      type: ASSIGNED_INCENTIVES_SUCCESS,
      payload: "Assigned incentive deleted successfully",
    });
  } catch (err) {
    console.error("Delete Assigned Incentive Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete assigned incentive";
    dispatch({ type: ASSIGNED_INCENTIVES_ERROR, payload: message });
  }
};
