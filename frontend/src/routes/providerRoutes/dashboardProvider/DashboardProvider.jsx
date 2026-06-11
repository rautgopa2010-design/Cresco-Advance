import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProviderDashboardData } from "../../../redux/actions/providerDashboard";
import ProviderCards from "./ProviderCards";
import { CircularProgress } from "@mui/material";

const DashboardProvider = () => {
    const dispatch = useDispatch();
    const { providerDashData, loading } = useSelector(
        (state) => state.providerDashboard
    );

    useEffect(() => {
        dispatch(getProviderDashboardData());
    }, [dispatch]);

    // Show full-screen centered loader while data is loading
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <CircularProgress size={60} thickness={5} />
            </div>
        );
    }

    // Once loaded, render the provider dashboard
    return (
        <div className="flex flex-col gap-y-4">
            <ProviderCards providerDashData={providerDashData} />
        </div>
    );
};

export default DashboardProvider;