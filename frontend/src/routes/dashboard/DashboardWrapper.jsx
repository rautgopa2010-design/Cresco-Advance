import { useSelector } from "react-redux";
import DashboardProvider from "../providerRoutes/dashboardProvider/DashboardProvider";
import DashboardPage from "./page";

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);
  if (!user) return null;

  return user.user_type === "provider" ? <DashboardProvider /> : <DashboardPage />;
};

export default DashboardWrapper;
