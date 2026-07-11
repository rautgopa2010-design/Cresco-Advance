import React from "react";
import NotFoundPage from "./NotFoundPage";
import { hasModulePermission } from "@/utils/hasModulePermission";

const PermissionRoute = ({ element, moduleName }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = user?.permissions || {};
  const isSuperAdmin = user?.role_name === "Super Admin" || user?.role_name === "Super Provider Admin";

  const allowed = isSuperAdmin || hasModulePermission(permissions, moduleName);

  return allowed ? element : <NotFoundPage />;
};

export default PermissionRoute;
