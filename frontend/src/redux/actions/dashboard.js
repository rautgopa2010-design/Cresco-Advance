import api from "../../utils/api";
import {
  GET_DASHBOARD_DATA,
  DASHBOARD_LOADING
} from "../types";


// Get all enquirys
export const getDashboardData= () => async (dispatch) => {
  dispatch({ type: DASHBOARD_LOADING });
  try {
    const res = await api.get("/dashboard");
    dispatch({ type: GET_DASHBOARD_DATA, payload: res.data });
  } catch (err) {
    console.log(err);
  }
};