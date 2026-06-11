import api from "../../utils/api";
import {
  GET_LANDING_LEADS,
  UPDATE_LANDING_LEAD_STATUS,
  LANDING_LEAD_LOADING,
  LANDING_LEAD_SUCCESS,
  LANDING_LEAD_ERROR,
} from "../types";

// Fetch all landing page leads
export const getLandingLeads = () => async (dispatch) => {
  dispatch({ type: LANDING_LEAD_LOADING });
  try {
    const res = await api.get("/landing-page-lead");
    const sorted = res.data.sort((a, b) => b.id - a.id); // newest first
    dispatch({ type: GET_LANDING_LEADS, payload: sorted });
  } catch (err) {
    console.error("Get Landing Leads Error:", err);
    const message =
      err.response?.data?.message || "Failed to fetch landing page leads";
    dispatch({ type: LANDING_LEAD_ERROR, payload: message });
  }
};

// Update status (Pending → Converted)
export const updateLandingLeadStatus = (id, status) => async (dispatch) => {
  dispatch({ type: LANDING_LEAD_LOADING });
  try {
    await api.put(`/landing-page-lead/lead/${id}/status`, { status });
    dispatch({
      type: UPDATE_LANDING_LEAD_STATUS,
      payload: { id, status },
    });
    dispatch({
      type: LANDING_LEAD_SUCCESS,
      payload: "Enquiry and Lead status generated successfully",
    });
  } catch (err) {
    console.error("Update Landing Lead Status Error:", err);
    const message =
      err.response?.data?.message || "Failed to update lead status";
    dispatch({ type: LANDING_LEAD_ERROR, payload: message });
  }
};