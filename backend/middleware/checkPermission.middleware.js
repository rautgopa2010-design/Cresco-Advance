const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { getParentRoles } = require("../utility/roleHelper");

module.exports = (permissionName) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return sendErrorResponse(res, 401, "Unauthorized");

      // PROVIDER USERS (Cresco Panel) BYPASS ALL PERMISSION CHECKS
      if (user.user_type === "provider") {
        return next(); // Full access for provider
      }

      // Super Admin (company side) also bypasses
      if (user.role_name === "Super Admin") {
        return next();
      }

      const Role = db.roles;
      const Permission = db.permissions;

      // Fetch role with its permissions
      const role = await Role.findByPk(user.role_id, {
        include: [{ model: Permission, as: "permissions" }],
      });

      if (!role) return sendErrorResponse(res, 403, "Role not found");

      // Direct permission check for this role
      let hasPermission = role.permissions?.some(
        (p) => p.permission_code === permissionName
      );

      // If not found, check if the role has parent roles with this permission
      if (!hasPermission) {
        const parentRoleIds = await getParentRoles(user.role_id, user.org_id);

        if (parentRoleIds && parentRoleIds.length > 0) {
          const parentRoles = await Role.findAll({
            where: { id: parentRoleIds },
            include: [{ model: Permission, as: "permissions" }],
          });

          for (const parent of parentRoles) {
            if (
              parent.permissions?.some(
                (p) => p.permission_code === permissionName
              )
            ) {
              hasPermission = true;
              break;
            }
          }
        }
      }

      // 🧩 If still not found and role is a leaf role (no child roles)
      // allow check only if role itself has permission
      if (!hasPermission) {
        const childRoles = await Role.findAll({
          where: { parent_role_id: user.role_id },
        });

        // if this role has no child roles → leaf role
        if (childRoles.length === 0) {
          // Leaf role, rely only on its own permission set
          if (
            role.permissions?.some(
              (p) => p.permission_code === permissionName
            )
          ) {
            hasPermission = true;
          }
        }
      }

      if (!hasPermission)
        return sendErrorResponse(res, 403, "Permission denied");

      next();
    } catch (err) {
      console.error("checkPermission Error:", err);
      return sendErrorResponse(res, 500, "Permission check failed");
    }
  };
};
