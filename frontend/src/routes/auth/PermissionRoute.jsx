import React from "react";
import NotFoundPage from "./NotFoundPage";
import { hasModulePermission } from "@/utils/hasModulePermission";

const normalizeRole = (roleName = "") => roleName.toString().trim().toLowerCase();

const PermissionRoute = ({ element, moduleName }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = user?.permissions || {};
  const roleName = normalizeRole(user?.role_name || user?.role?.role_name || user?.sa_role_name);
  const isSuperAdmin = roleName === "super admin" || roleName === "super provider admin";

  const allowed = isSuperAdmin || hasModulePermission(permissions, moduleName);

  return allowed ? element : <NotFoundPage />;
};

export default PermissionRoute;
