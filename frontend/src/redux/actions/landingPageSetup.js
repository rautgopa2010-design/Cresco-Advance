import api from "../../utils/api";
import {
    GET_LANDING_PAGE_SETUP,
    UPDATE_LANDING_PAGE_SETUP,
    LANDING_PAGE_SETUP_LOADING,
    LANDING_PAGE_SETUP_SUCCESS,
    LANDING_PAGE_SETUP_ERROR,
} from "../types";

const getOrgId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.org_id;
};

export const getLandingPageSetup = () => async (dispatch) => {
    const org_id = getOrgId();
    if (!org_id) {
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: "org_id is required" });
        return;
    }

    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        const res = await api.get(`/landing-page-setup?org_id=${org_id}`);
        dispatch({ type: GET_LANDING_PAGE_SETUP, payload: res.data });
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch landing page setup";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const updateLandingPageSetup = (formData) => async (dispatch) => {
    const org_id = getOrgId();
    if (!org_id) {
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: "org_id is required" });
        return;
    }

    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.put("/landing-page-setup/edit", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        dispatch({ type: UPDATE_LANDING_PAGE_SETUP });
        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Landing page updated successfully" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to update landing page setup";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const removeTrustedLogo = (index) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.delete(`/landing-page-setup/trusted-logo/${index}`);
        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Logo removed" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove logo";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const removeService = (index) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.delete(`/landing-page-setup/service/${index}`);
        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Service removed" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove service";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const removeWork = (index) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.delete(`/landing-page-setup/work/${index}`);
        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Work removed" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove work";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const removeTestimonial = (index) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.delete(`/landing-page-setup/testimonial/${index}`);
        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Testimonial removed" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove testimonial";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const uploadHeroImage = (file) => async (dispatch) => {
    const org_id = getOrgId();
    if (!org_id) {
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: "org_id is required" });
        return;
    }

    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        const formData = new FormData();
        formData.append("hero_image", file);

        await api.post("/landing-page-setup/upload-hero-image", formData);

        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Hero image uploaded successfully" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload hero image";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const removeHeroImage = () => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.delete("/landing-page-setup/remove-hero-image");
        dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "Hero image removed successfully" });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove hero image";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const uploadExpertiseImage = (file) => async (dispatch) => {
    const org_id = getOrgId();

    if (!org_id) {
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: "org_id is required" });
        return;
    }

    dispatch({ type: LANDING_PAGE_SETUP_LOADING });

    try {
        const formData = new FormData();
        formData.append("expertise_image", file);

        await api.post("/landing-page-setup/upload-expertise-image", formData);

        // FIXED: Correct message
        dispatch({
            type: LANDING_PAGE_SETUP_SUCCESS,
            payload: "Expertise image uploaded successfully",
        });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload expertise image";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const removeExpertiseImage = () => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
        await api.delete("/landing-page-setup/remove-expertise-image");

        // FIXED: Use correct action type and message
        dispatch({
            type: LANDING_PAGE_SETUP_SUCCESS, // This should match your reducer's success handler
            payload: "Expertise image removed successfully",
        });
        dispatch(getLandingPageSetup());
    } catch (err) {
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove expertise image";
        dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
};

export const uploadAboutImage1 = (file) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
      const formData = new FormData();
      formData.append("about_image1", file);
  
      await api.post("/landing-page-setup/upload-about-image1", formData);
      dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "About image 1 uploaded" });
      dispatch(getLandingPageSetup());
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload about image 1";
      dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
  };
  
  export const uploadAboutImage2 = (file) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
      const formData = new FormData();
      formData.append("about_image2", file);
  
      await api.post("/landing-page-setup/upload-about-image2", formData);
      dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "About image 2 uploaded" });
      dispatch(getLandingPageSetup());
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload about image 2";
      dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
  };
  
  export const uploadAboutImage3 = (file) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
      const formData = new FormData();
      formData.append("about_image3", file);
  
      await api.post("/landing-page-setup/upload-about-image3", formData);
      dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: "About image 3 uploaded" });
      dispatch(getLandingPageSetup());
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to upload about image 3";
      dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
  };
  
  export const removeAboutImage = (field) => async (dispatch) => {
    dispatch({ type: LANDING_PAGE_SETUP_LOADING });
    try {
      await api.delete(`/landing-page-setup/remove-about-image/${field}`);
      dispatch({ type: LANDING_PAGE_SETUP_SUCCESS, payload: `About image ${field} removed` });
      dispatch(getLandingPageSetup());
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to remove image";
      dispatch({ type: LANDING_PAGE_SETUP_ERROR, payload: message });
    }
  };