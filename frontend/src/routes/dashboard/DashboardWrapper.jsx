import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import DashboardProvider from "../providerRoutes/dashboardProvider/DashboardProvider";
import DashboardPage from "./page";
import HRMSDashboard from "../hrms/HRMSDashboard";

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);
  const { activeWorkspace } = useOutletContext();
  if (!user) return null;

  if (user.user_type === "provider") return <DashboardProvider />;
  if (activeWorkspace === "hrms") return <HRMSDashboard />;

  return <DashboardPage />;
};

export default DashboardWrapper;
