import api from "../../utils/api";
import {
  ADD_TICKET_SERVICE,
  GET_TICKET_SERVICE,
  UPDATE_TICKET_SERVICE,
  DELETE_TICKET_SERVICE,
  TICKET_SERVICE_ERROR,
  TICKET_SERVICE_SUCCESS,
  TICKET_SERVICE_LOADING,
} from "../types";

// Get all ticket services
export const getTicketService = () => async (dispatch) => {
  dispatch({ type: TICKET_SERVICE_LOADING });
  try {
    const res = await api.get("/ticket-service");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_TICKET_SERVICE, payload: sorted });
  } catch (err) {
    console.error("Get Ticket Service Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get ticket service";
    dispatch({ type: TICKET_SERVICE_ERROR, payload: message });
  }
};

// Create new ticket servie
export const createTicketService = (data) => async (dispatch) => {
  dispatch({ type: TICKET_SERVICE_LOADING });
  try {
    const res = await api.post("/ticket-service/create", data);
    dispatch({ type: ADD_TICKET_SERVICE, payload: res.data });
    dispatch({ type: TICKET_SERVICE_SUCCESS, payload: "Ticket Service created successfully" });
  } catch (err) {
    console.error("Create Ticket Service Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add ticket service";
    dispatch({ type: TICKET_SERVICE_ERROR, payload: message });
  }
};

// Update ticket service
export const updateTicketService = (id, data) => async (dispatch) => {
  dispatch({ type: TICKET_SERVICE_LOADING });
  try {
    await api.put(`/ticket-service/edit/${id}`, data);
    dispatch({ type: UPDATE_TICKET_SERVICE, payload: { id, data } });
    dispatch({ type: TICKET_SERVICE_SUCCESS, payload: "Ticket Service updated successfully" });
  } catch (err) {
    console.error("Update Ticket Service Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update ticket service";
    dispatch({ type: TICKET_SERVICE_ERROR, payload: message });
  }
};

// Delete ticket service
export const deleteTicketService = (id) => async (dispatch) => {
  dispatch({ type: TICKET_SERVICE_LOADING });
  try {
    await api.delete(`/ticket-service/${id}`);
    dispatch({ type: DELETE_TICKET_SERVICE, payload: id });
    dispatch({ type: TICKET_SERVICE_SUCCESS, payload: "Ticket Service deleted successfully" });
  } catch (err) {
    console.error("Delete Ticket Service Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete ticket service";
    dispatch({ type: TICKET_SERVICE_ERROR, payload: message });
  }
};
