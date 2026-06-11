import api from "../../utils/api";
import { GET_INCENTIVES, INCENTIVE_LOADING, INCENTIVE_ERROR } from "../types";

// Get incentives with filters
export const getIncentives = (employee_id, type, period) => async (dispatch) => {
    dispatch({ type: INCENTIVE_LOADING });
    try {
        const params = new URLSearchParams();
        if (employee_id) params.append("employee_id", employee_id);
        if (type) params.append("type", type);
        if (period) params.append("period", period);

        const res = await api.get(`/incentives?${params.toString()}`);
        dispatch({ type: GET_INCENTIVES, payload: res.data });
    } catch (err) {
        console.error("Get Incentives Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Failed to fetch incentives";
        dispatch({ type: INCENTIVE_ERROR, payload: message });
    }
};

export const payIncentive = (incentive_id, pay_amount) => async (dispatch) => {
    dispatch({ type: INCENTIVE_LOADING });

    try {
        const res = await api.post("/incentives/pay", {
            incentive_id,
            pay_amount,
        });

        dispatch({
            type: "INCENTIVE_SUCCESS",
            payload: res.data.message || "Payment recorded successfully"
          });

        // Refetch incentives to update the list
        dispatch(getIncentives());

    } catch (err) {
        console.error("Get Incentives Error:", err);
        const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Payment failed";

        dispatch({
            type: INCENTIVE_ERROR,
            payload: message
          });
    }
};
