import api from "../../utils/api";
import {
  GET_INVOICES,
  ADD_INVOICE,
  UPDATE_INVOICE,
  DELETE_INVOICE,
  INVOICE_LOADING,
  INVOICE_SUCCESS,
  INVOICE_ERROR,
} from "../types";

// Get all invoices
export const getInvoices = (invoiceType = "final") => async (dispatch) => {
  dispatch({ type: INVOICE_LOADING });
  try {
    const res = await api.get(`/invoice?invoiceType=${encodeURIComponent(invoiceType)}`);
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_INVOICES, payload: sorted });
  } catch (err) {
    console.error("Get Invoices Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch invoices";
    dispatch({ type: INVOICE_ERROR, payload: message });
  }
};

// Create invoice
export const createInvoice = (data) => async (dispatch) => {
  dispatch({ type: INVOICE_LOADING });
  try {
    const res = await api.post("/invoice/create", data);
    dispatch({ type: ADD_INVOICE, payload: { ...data, id: res.data.invoiceId } });
    dispatch({ type: INVOICE_SUCCESS, payload: "Invoice created successfully" });
  } catch (err) {
    console.error("Create Invoice Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to create invoice";
    dispatch({ type: INVOICE_ERROR, payload: message });
  }
};

// Update invoice
export const updateInvoice = (id, data) => async (dispatch) => {
  dispatch({ type: INVOICE_LOADING });
  try {
    const res = await api.put(`/invoice/edit/${id}`, data);

    dispatch({
      type: UPDATE_INVOICE,
      payload: res.data.updatedInvoice,
    });

    dispatch({
      type: INVOICE_SUCCESS,
      payload: res.data.message || "Invoice updated successfully",
    });
  } catch (err) {
    console.error("Update Invoice Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update invoice";
    dispatch({ type: INVOICE_ERROR, payload: message });
  }
};

// Delete invoice
export const deleteInvoice = (id, invoiceType = "final") => async (dispatch) => {
  dispatch({ type: INVOICE_LOADING });
  try {
    await api.delete(`/invoice/${id}?invoiceType=${encodeURIComponent(invoiceType)}`);
    dispatch({ type: DELETE_INVOICE, payload: id });
    dispatch({ type: INVOICE_SUCCESS, payload: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete invoice";
    dispatch({ type: INVOICE_ERROR, payload: message });
  }
};
