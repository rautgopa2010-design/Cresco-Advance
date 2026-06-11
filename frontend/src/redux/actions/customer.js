import api from "../../utils/api";
import { GET_CUSTOMERS, ADD_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER, CUSTOMER_LOADING, CUSTOMER_SUCCESS, CUSTOMER_ERROR } from "../types";

// Get all enquirys
export const getCustomers = () => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        const res = await api.get("/customer");
        const sorted = res.data.sort((a, b) => b.id - a.id);
        dispatch({ type: GET_CUSTOMERS, payload: sorted });
    } catch (err) {
        console.error("Get Enquirys Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch enquirys";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Create enquiry
export const createCustomer = (data) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        const res = await api.post("/customer/create", data);
        dispatch({ type: ADD_CUSTOMER, payload: { ...data, id: res.data.customerId } });
        dispatch({ type: CUSTOMER_SUCCESS, payload: "Enquiry created successfully" });
    } catch (err) {
        console.error("Create Enquiry Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to create enquiry";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Create contact for a enquiry
export const addCustomerContact = (customerId, data) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        const res = await api.post(`/customer/${customerId}/contact`, data);
        dispatch({ type: CUSTOMER_SUCCESS, payload: "Contact added successfully" });
        // Optionally refetch contacts or customers
        dispatch(getCustomers());
    } catch (err) {
        console.error("Add Contact Error:", err);
        const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to add contact";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Update enquiry
export const updateCustomer = (id, data) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        await api.put(`/customer/edit/${id}`, data);

        // Construct updated enquiry object with id
        const updatedCustomer = { ...data, id };

        dispatch({ type: UPDATE_CUSTOMER, payload: updatedCustomer });
        dispatch({ type: CUSTOMER_SUCCESS, payload: "Enquiry updated successfully" });
    } catch (err) {
        console.error("Update Enquiry Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update enquiry";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Update contact for a enquiry
export const updateCustomerContact = (customerId, contactId, data) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        await api.put(`/customer/${customerId}/contact/${contactId}`, data);
        dispatch({ type: CUSTOMER_SUCCESS, payload: "Contact updated successfully" });
        // Refresh full list to get updated contacts
        dispatch(getCustomers());
    } catch (err) {
        console.error("Update Contact Error:", err);
        const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update contact";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Delete enquiry
export const deleteCustomer = (id) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        await api.delete(`/customer/${id}`);
        dispatch({ type: DELETE_CUSTOMER, payload: id });
        dispatch({ type: CUSTOMER_SUCCESS, payload: "Enquiry deleted successfully" });
    } catch (err) {
        console.error("Delete Enquiry Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to delete enquiry";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Delete contact for a enquiry
export const deleteCustomerContact = (customerId, contactId) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        await api.delete(`/customer/${customerId}/contact/${contactId}`);
        dispatch({ type: CUSTOMER_SUCCESS, payload: "Contact deleted successfully" });
        dispatch(getCustomers()); // Refresh list
    } catch (err) {
        console.error("Delete Contact Error:", err);
        const message = err.response?.data?.message || err.response?.data?.message || "Failed to delete contact";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

// Bulk import customers
export const importCustomers = (customersData) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });

    try {
        const response = await api.post("/customer/import", { customers: customersData });

        if (response.data.success) {
            dispatch({
                type: CUSTOMER_SUCCESS,
                payload: response.data.message || `Successfully imported ${response.data.imported} customers`,
            });
            dispatch(getCustomers()); // refresh
        } else {
            // ── Show detailed per-row errors ────────────────────────────────
            const errorMsg = response.data.errors?.length > 0
                ? response.data.errors.join("\n")
                : response.data.message || "Import failed – check the file";

            dispatch({
                type: CUSTOMER_ERROR,
                payload: errorMsg,
            });
        }
    } catch (err) {
        console.error("Bulk import error:", err);
        const message =
            err.response?.data?.errors?.join?.("\n") ||
            err.response?.data?.message ||
            "Failed to import customers. Please check file format.";

        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};

export const bulkAssignCustomers = (customerIds, employeeIds) => async (dispatch) => {
    dispatch({ type: CUSTOMER_LOADING });
    try {
        const res = await api.post("/customer/bulk-assign", {
            customerIds,
            employeeIds,
            mode: "append", // or "replace" – decide your preference
        });

        dispatch({
            type: CUSTOMER_SUCCESS,
            payload: res.data.message || "Bulk assignment successful",
        });

        // Refresh list
        dispatch(getCustomers());
    } catch (err) {
        console.error("Bulk assign error:", err);
        const message =
            err.response?.data?.message ||
            err.response?.data?.errors?.[0]?.msg ||
            "Failed to assign employees";
        dispatch({ type: CUSTOMER_ERROR, payload: message });
    }
};