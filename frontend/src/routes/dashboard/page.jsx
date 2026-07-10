import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardData } from "../../redux/actions/dashboard";
import Cards from "./dashboardAdmin/AdminCards";
import HelpdeskCards from "./dashboardHelpdesk/HelpdeskCards";

const SkeletonBlock = ({ className = "" }) => (
    <div className={`relative overflow-hidden rounded-3xl bg-white shadow-sm ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
);

const DashboardSkeleton = () => (
    <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6">
        <SkeletonBlock className="h-64 bg-gradient-to-br from-blue-100 to-indigo-100" />
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-56" />
            ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
            <SkeletonBlock className="h-96" />
            <SkeletonBlock className="h-96" />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-80" />
            ))}
        </div>
    </div>
);

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { helpDeskMode } = useOutletContext();
    const { dashData, loading: dashLoading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(getDashboardData());
    }, [dispatch]);

    // Show full-screen centered loader while data is loading
    if (dashLoading) {
        return <DashboardSkeleton />;
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
