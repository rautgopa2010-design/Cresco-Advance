import api from "../../utils/api";
import { GET_TICKETS, ADD_TICKET, UPDATE_TICKET, DELETE_TICKET, TICKET_LOADING, TICKET_SUCCESS, TICKET_ERROR } from "../types";

// Get all tickets
export const getTickets = () => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        const res = await api.get("/ticket");
        // server already returns enriched and sorted, but ensure sorting client-side:
        const sorted = res.data.sort((a, b) => b.id - a.id);
        dispatch({ type: GET_TICKETS, payload: sorted });
    } catch (err) {
        console.error("Get Tickets Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch tickets";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};

// Create ticket
export const createTicket = (data) => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        const res = await api.post("/ticket/create", data);
        // payload should include server id
        dispatch({ type: ADD_TICKET, payload: { ...data, id: res.data.ticketId } });
        dispatch({ type: TICKET_SUCCESS, payload: "Ticket created successfully" });
    } catch (err) {
        console.error("Create Ticket Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to create ticket";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};

// Update ticket
export const updateTicket = (id, data) => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        await api.put(`/ticket/edit/${id}`, data);

        // construct updated object
        const updatedTicket = { ...data, id };

        dispatch({ type: UPDATE_TICKET, payload: updatedTicket });
        dispatch({ type: TICKET_SUCCESS, payload: "Ticket updated successfully" });
    } catch (err) {
        console.error("Update Ticket Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update ticket";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};

// Update ticket status by company user
export const updateTicketStatus = (id, status) => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        await api.patch(`/ticket/status/${id}`, { status }); 
        dispatch({ type: UPDATE_TICKET, payload: { id, data: { status } } });
        dispatch({ type: TICKET_SUCCESS, payload: "Ticket status updated successfully" });
    } catch (err) {
        console.error("Update Ticket Status Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update ticket status";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};

// // Update escalated ticket status by provider
// export const updateEscalatedTicketStatus = (id, status) => async (dispatch) => {
//     dispatch({ type: TICKET_LOADING });
//     try {
//         await api.patch(`/ticket/provider/update/${id}`, { status });

//         dispatch({
//             type: UPDATE_TICKET,
//             payload: { id, data: { status } }
//         });

//         dispatch({
//             type: TICKET_SUCCESS,
//             payload: "Ticket status updated successfully by Cresco team"
//         });
//     } catch (err) {
//         console.error("Update Escalated Ticket Status Error:", err);
//         const message = err.response?.data?.message || "Failed to update ticket status";
//         dispatch({ type: TICKET_ERROR, payload: message });
//     }
// };

// Update escalated ticket status by provider with remark
export const updateEscalatedTicketStatus = (id, status, remark = "") => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        await api.patch(`/ticket/provider/update/${id}`, { status, remark });

        dispatch({
            type: UPDATE_TICKET,
            payload: { id, data: { status, remark } }
        });

        dispatch({
            type: TICKET_SUCCESS,
            payload: "Ticket status updated successfully by Cresco team"
        });
    } catch (err) {
        console.error("Update Escalated Ticket Status Error:", err);
        const message = err.response?.data?.message || "Failed to update ticket status";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};

// Escalate ticket to cresco
export const escalateTicket = (id) => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        await api.post(`/ticket/escalate/${id}`);
        dispatch({ type: TICKET_SUCCESS, payload: "Ticket escalated to Cresco successfully" });
        dispatch(getTickets());
    } catch (err) {
        console.error("Create Ticket Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to escalate";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};

// Delete ticket
export const deleteTicket = (id) => async (dispatch) => {
    dispatch({ type: TICKET_LOADING });
    try {
        await api.delete(`/ticket/${id}`);
        dispatch({ type: DELETE_TICKET, payload: id });
        dispatch({ type: TICKET_SUCCESS, payload: "Ticket deleted successfully" });
    } catch (err) {
        console.error("Delete Ticket Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete ticket";
        dispatch({ type: TICKET_ERROR, payload: message });
    }
};
