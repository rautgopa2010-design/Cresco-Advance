import {
    GET_EMPLOYEES,
    ADD_EMPLOYEE,
    UPDATE_EMPLOYEE,
    DELETE_EMPLOYEE,
    EMPLOYEE_ERROR,
    EMPLOYEE_SUCCESS,
    EMPLOYEE_LOADING,
    CLEAR_SNACKBAR,
  } from "../types";
  
  const initialState = {
    employees: [],
    snackbarMessage: "",
    snackbarSeverity: "",
    loading: false,
    isMaxUsersError: false,
  };
  
  const employeeReducer = (state = initialState, action) => {
    switch (action.type) {
      case EMPLOYEE_LOADING:
        return { ...state, loading: true };
  
      case GET_EMPLOYEES:
        return { ...state, employees: action.payload, loading: false };
  
      case ADD_EMPLOYEE:
        return {
          ...state,
          employees: [action.payload, ...state.employees],
          loading: false,
        };
  
      case UPDATE_EMPLOYEE:
        return {
          ...state,
          employees: state.employees.map((emp) =>
            emp.id === action.payload.id ? { ...emp, ...action.payload.data } : emp
          ),
          loading: false,
        };
  
      case DELETE_EMPLOYEE:
        return {
          ...state,
          employees: state.employees.filter((emp) => emp.id !== action.payload),
          loading: false,
        };
  
      case EMPLOYEE_SUCCESS:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "success",
          loading: false,
        };
  
      case EMPLOYEE_ERROR:
        return {
          ...state,
          snackbarMessage: action.payload,
          snackbarSeverity: "error",
          loading: false,
          isMaxUsersError: action.meta?.isMaxUsersError || false,
        };
  
      case CLEAR_SNACKBAR:
        return {
          ...state,
          snackbarMessage: "",
          snackbarSeverity: "",
          isMaxUsersError: false,
        };
  
      default:
        return state;
    }
  };
  
  export default employeeReducer;
  