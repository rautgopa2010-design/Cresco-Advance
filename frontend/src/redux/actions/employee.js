import api from "../../utils/api";
import {
  GET_EMPLOYEES,
  ADD_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  EMPLOYEE_ERROR,
  EMPLOYEE_SUCCESS,
  EMPLOYEE_LOADING,
} from "../types";

// Get all employees
export const getEmployees = () => async (dispatch) => {
  dispatch({ type: EMPLOYEE_LOADING });
  try {
    const res = await api.get("/employee");
    const sorted = res.data.sort((a, b) => b.id - a.id);
    dispatch({ type: GET_EMPLOYEES, payload: sorted });
  } catch (err) {
    console.error("Get Employees Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to fetch employees";
    dispatch({ type: EMPLOYEE_ERROR, payload: message });
  }
};

// // Create employee
// export const createEmployee = (data) => async (dispatch) => {
//   dispatch({ type: EMPLOYEE_LOADING });
//   try {
//     const res = await api.post("/employee/create", data);
//     dispatch({ type: ADD_EMPLOYEE, payload: { ...data, id: res.data.employeeId } });
//     dispatch({ type: EMPLOYEE_SUCCESS, payload: "Employee created successfully" });
//   } catch (err) {
//     console.error("Create Employee Error:", err);
//     const message =
//       err.response?.data?.errors?.[0]?.msg ||
//       err.response?.data?.message ||
//       "Failed to create employee";
//     dispatch({ type: EMPLOYEE_ERROR, payload: message });
//   }
// };

// Create employee
export const createEmployee = (data) => async (dispatch) => {
  dispatch({ type: EMPLOYEE_LOADING });
  try {
    const res = await api.post("/employee/create", data);
    dispatch({ type: ADD_EMPLOYEE, payload: { ...data, id: res.data.employeeId } });
    dispatch({ type: EMPLOYEE_SUCCESS, payload: "Employee created successfully" });
  } catch (err) {
    console.error("Create Employee Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to create employee";
    
    // Check if this is a max users error
    const isMaxUsersError = message.includes("maximum number of users");
    
    dispatch({ 
      type: EMPLOYEE_ERROR, 
      payload: message,
      meta: { isMaxUsersError }
    });
  }
};

// Update employee
export const updateEmployee = (id, data) => async (dispatch) => {
  dispatch({ type: EMPLOYEE_LOADING });
  try {
    await api.put(`/employee/edit/${id}`, data);
    dispatch({ type: UPDATE_EMPLOYEE, payload: { id, data } });
    dispatch({ type: EMPLOYEE_SUCCESS, payload: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to update employee";
    dispatch({ type: EMPLOYEE_ERROR, payload: message });
  }
};

// Delete employee
export const deleteEmployee = (id) => async (dispatch) => {
  dispatch({ type: EMPLOYEE_LOADING });
  try {
    await api.delete(`/employee/${id}`);
    dispatch({ type: DELETE_EMPLOYEE, payload: id });
    dispatch({ type: EMPLOYEE_SUCCESS, payload: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete Employee Error:", err);
    const message =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      "Failed to delete employee";
    dispatch({ type: EMPLOYEE_ERROR, payload: message });
  }
};
