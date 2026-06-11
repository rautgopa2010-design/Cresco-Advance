import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Navigate to="/marketing-website" replace />;
  }

  // Check if company + super admin + no package
  const needsPackage =
    user?.user_type === "company" &&
    user?.role_name === "Super Admin" &&
    !user?.packageId;

    console.log(user);

  if (needsPackage && location.pathname !== "/choose-package") {
    return <Navigate to="/choose-package" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
