import api from "../../utils/api";
import {
  GET_ZONES,
  ADD_ZONES,
  UPDATE_ZONES,
  DELETE_ZONES,
  ZONE_SUCCESS,
  ZONE_ERROR,
  ZONE_LOADING
} from "../types";

// Get all zones
export const getZones = () => async (dispatch) => {
  dispatch({ type: ZONE_LOADING });
  try {
    const res = await api.get("/zones");
    const mapped = res.data.map(item => ({
      id: item.id,
      Country: item.country.country,
      countryId: item.countryId,
      zones: item.zones.split(",").map(z => z.trim()),
      date: item.date,
    }));
    dispatch({ type: GET_ZONES, payload: mapped });
  } catch (err) {
    console.error("Get Zones Error:", err);
    const errorMsg =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get zones.";
    dispatch({ type: ZONE_ERROR, payload: errorMsg });
  }
};

// Create zones
export const createZones = (data) => async (dispatch, getState) => {
  dispatch({ type: ZONE_LOADING });
  try {
    const res = await api.post("/zones/create", data);
    const countryList = getState().country.country;
    const country = countryList.find(c => c.id === data.countryId);

    dispatch({
      type: ADD_ZONES,
      payload: {
        id: res.data.id,
        Country: country ? country.country : "",
        countryId: data.countryId,
        zones: data.zones,
        date: data.date,
      },
    });
    dispatch({ type: ZONE_SUCCESS, payload: "Zones added successfully" });
  } catch (err) {
    console.error("Create Zones Error:", err);
    const errorMsg =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to create zones.";
    dispatch({ type: ZONE_ERROR, payload: errorMsg });
  }
};

// Update zones
export const updateZones = (id, data) => async (dispatch, getState) => {
  dispatch({ type: ZONE_LOADING });
  try {
    await api.put(`/zones/edit/${id}`, data);
    const countryList = getState().country.country;
    const country = countryList.find(c => c.id === data.countryId);

    dispatch({
      type: UPDATE_ZONES,
      payload: {
        id,
        data: {
          id,
          Country: country ? country.country : "",
          countryId: data.countryId,
          zones: data.zones,
          date: data.date,
        },
      },
    });
    dispatch({ type: ZONE_SUCCESS, payload: "Zones updated successfully" });
  } catch (err) {
    console.error("Update Zones Error:", err);
    const errorMsg =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update zones.";
    dispatch({ type: ZONE_ERROR, payload: errorMsg });
  }
};

// Delete zones
export const deleteZones = (id) => async (dispatch) => {
  dispatch({ type: ZONE_LOADING });
  try {
    await api.delete(`/zones/${id}`);
    dispatch({ type: DELETE_ZONES, payload: id });
    dispatch({ type: ZONE_SUCCESS, payload: "Zones deleted successfully" });
  } catch (err) {
    console.error("Delete Zones Error:", err);
    const errorMsg =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete zones.";
    dispatch({ type: ZONE_ERROR, payload: errorMsg });
  }
};
