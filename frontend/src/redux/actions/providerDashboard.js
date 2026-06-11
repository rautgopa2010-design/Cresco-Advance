import api from "../../utils/api";
import {
    GET_PROVIDER_DASHBOARD_DATA,
    PROVIDER_DASHBOARD_LOADING
} from "../types";


// Get all enquirys
export const getProviderDashboardData= () => async (dispatch) => {
  dispatch({ type: PROVIDER_DASHBOARD_LOADING });
  try {
    const res = await api.get("/provider-dashboard");
    dispatch({ type: GET_PROVIDER_DASHBOARD_DATA, payload: res.data });
  } catch (err) {
    console.log(err);
  }
};