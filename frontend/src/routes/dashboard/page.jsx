import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardData } from "../../redux/actions/dashboard";
import Cards from "./dashboardAdmin/AdminCards";
import HelpdeskCards from "./dashboardHelpdesk/HelpdeskCards";
import { CircularProgress } from "@mui/material";

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { helpDeskMode } = useOutletContext();
    const { dashData, loading: dashLoading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(getDashboardData());
    }, [dispatch]);

    // Show full-screen centered loader while data is loading
    if (dashLoading) {
        return (
            <div className="flex h-full min-h-[420px] w-full items-center justify-center">
                <CircularProgress size={60} thickness={5} />
            </div>
        );
    }

    // Once loaded, render the appropriate dashboard
    return helpDeskMode ? (
        <div className="flex flex-col gap-y-4">
            {/* Help Desk Dashboard */}
            <HelpdeskCards dashData={dashData} />
        </div>
    ) : (
        <div className="flex flex-col gap-y-4">
            {/* Admin Dashboard */}
            <Cards dashData={dashData} />
        </div>
    );
};

export default DashboardPage;
