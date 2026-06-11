import api from "../../utils/api";
import {
  ADD_TICKET_PRIORITY,
  GET_TICKET_PRIORITY,
  UPDATE_TICKET_PRIORITY,
  DELETE_TICKET_PRIORITY,
  TICKET_PRIORITY_ERROR,
  TICKET_PRIORITY_SUCCESS,
  TICKET_PRIORITY_LOADING,
} from "../types";

// Get all ticket priorities
export const getTicketPriority = () => async (dispatch) => {
  dispatch({ type: TICKET_PRIORITY_LOADING });
  try {
    const res = await api.get("/ticket-priority");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_TICKET_PRIORITY, payload: sorted });
  } catch (err) {
    console.error("Get Ticket Priority Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to get ticket priority";
    dispatch({ type: TICKET_PRIORITY_ERROR, payload: message });
  }
};

// Create new ticket servie
export const createTicketPriority = (data) => async (dispatch) => {
  dispatch({ type: TICKET_PRIORITY_LOADING });
  try {
    const res = await api.post("/ticket-priority/create", data);
    dispatch({ type: ADD_TICKET_PRIORITY, payload: res.data });
    dispatch({ type: TICKET_PRIORITY_SUCCESS, payload: "Ticket Priority created successfully" });
  } catch (err) {
    console.error("Create Ticket Priority Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to add ticket priority";
    dispatch({ type: TICKET_PRIORITY_ERROR, payload: message });
  }
};

// Update ticket priority
export const updateTicketPriority = (id, data) => async (dispatch) => {
  dispatch({ type: TICKET_PRIORITY_LOADING });
  try {
    await api.put(`/ticket-priority/edit/${id}`, data);
    dispatch({ type: UPDATE_TICKET_PRIORITY, payload: { id, data } });
    dispatch({ type: TICKET_PRIORITY_SUCCESS, payload: "Ticket Priority updated successfully" });
  } catch (err) {
    console.error("Update Ticket Priority Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update ticket priority";
    dispatch({ type: TICKET_PRIORITY_ERROR, payload: message });
  }
};

// Delete ticket priority
export const deleteTicketPriority = (id) => async (dispatch) => {
  dispatch({ type: TICKET_PRIORITY_LOADING });
  try {
    await api.delete(`/ticket-priority/${id}`);
    dispatch({ type: DELETE_TICKET_PRIORITY, payload: id });
    dispatch({ type: TICKET_PRIORITY_SUCCESS, payload: "Ticket Priority deleted successfully" });
  } catch (err) {
    console.error("Delete Ticket Priority Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete ticket priority";
    dispatch({ type: TICKET_PRIORITY_ERROR, payload: message });
  }
};
