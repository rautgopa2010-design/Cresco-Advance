import {
  GET_PACKAGES,
  ADD_PACKAGE,
  UPDATE_PACKAGE,
  DELETE_PACKAGE,
  GET_PACKAGE_BY_ID,
  PACKAGE_LOADING,
  PACKAGE_SUCCESS,
  PACKAGE_ERROR,
  CLEAR_SNACKBAR,
} from "../types";

const initialState = {
  packages: [],
  currentPackage: null,        // For edit form
  snackbarMessage: "",
  snackbarSeverity: "",       // "success" | "error" | "info" | "warning"
  loading: false,
};

const packageReducer = (state = initialState, action) => {
  switch (action.type) {
    case PACKAGE_LOADING:
      return {
        ...state,
        loading: true,
        snackbarMessage: "", // Optional: clear message on new loading
      };

    case GET_PACKAGES:
      return {
        ...state,
        packages: action.payload,
        loading: false,
      };

    case GET_PACKAGE_BY_ID:
      return {
        ...state,
        currentPackage: action.payload, // Expecting the full package object
        loading: false,
      };

    case ADD_PACKAGE:
      // Assuming action.payload is the newly created package object
      return {
        ...state,
        packages: [action.payload, ...state.packages],
        loading: false,
      };

    case UPDATE_PACKAGE:
      // Two common patterns:
      // 1. Payload is the updated package → update list + current
      // 2. Payload is just { message }, but we optimistically update from state
      const updatedPackage = action.payload.package || action.payload;

      return {
        ...state,
        packages: state.packages.map((pkg) =>
          pkg.id === updatedPackage.id ? { ...pkg, ...updatedPackage } : pkg
        ),
        currentPackage:
          state.currentPackage?.id === updatedPackage.id
            ? { ...state.currentPackage, ...updatedPackage }
            : state.currentPackage,
        loading: false,
      };

    case DELETE_PACKAGE:
      return {
        ...state,
        packages: state.packages.filter((p) => p.id !== action.payload),
        currentPackage: state.currentPackage?.id === action.payload ? null : state.currentPackage,
        loading: false,
      };

    case PACKAGE_SUCCESS:
      return {
        ...state,
        snackbarMessage: action.payload, // e.g., "Package created successfully"
        snackbarSeverity: "success",
        loading: false,
      };

    case PACKAGE_ERROR:
      return {
        ...state,
        snackbarMessage: action.payload, // error message string
        snackbarSeverity: "error",
        loading: false,
      };

    case CLEAR_SNACKBAR:
      return {
        ...state,
        snackbarMessage: "",
        snackbarSeverity: "",
      };

    default:
      return state;
  }
};

export default packageReducer;