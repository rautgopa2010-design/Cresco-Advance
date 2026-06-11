const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const {
  roles: Roles,
  permissions: Permissions,
  rolePermissions: RolePermissions,
  modules: Modules,
} = db;

// Utility: recursively update inherited permissions for child roles
const propagatePermissionsToChildren = async (
  org_id,
  parentRoleId,
  permissionIds
) => {
  const childRoles = await Roles.findAll({
    where: { org_id, parent_role_id: parentRoleId, inherit_permissions: true },
  });

  for (const child of childRoles) {
    const rolePermissions = permissionIds.map((pid) => ({
      org_id,
      role_id: child.id,
      permission_id: pid,
    }));

    await RolePermissions.bulkCreate(rolePermissions);
    await propagatePermissionsToChildren(org_id, child.id, permissionIds);
  }
};

// Create Module
exports.createModule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { module_name } = req.body;
  const { org_id } = req.user;

  try {
    const [module, created] = await Modules.findOrCreate({
      where: { org_id, module_name },
      defaults: { org_id, module_name },
    });

    if (!created) {
      return sendErrorResponse(res, 409, `Module '${module_name}' already exists.`);
    }

    const permissionsData = ["view", "create", "edit", "delete", "print"].map(
      (type) => ({
        org_id,
        module_id: module.id,
        permission_type: type,
        permission_code: `${module_name.toLowerCase().replace(/\s+/g, "_")}_${type}`,
      })
    );

    const createdPermissions = await Permissions.bulkCreate(permissionsData, {
      returning: true,
    });

    const superAdminRole = await Roles.findOne({
      where: { org_id, role_name: "Super Admin" },
    });

    if (superAdminRole) {
      const rolePermissions = createdPermissions.map((perm) => ({
        org_id,
        role_id: superAdminRole.id,
        permission_id: perm.id,
      }));

      await RolePermissions.bulkCreate(rolePermissions);

      const permissionIds = createdPermissions.map((p) => p.id);
      await propagatePermissionsToChildren(
        org_id,
        superAdminRole.id,
        permissionIds
      );
    }

    return res.status(201).json({
      message: "Module and permissions created successfully",
      module,
    });
  } catch (err) {
    console.error("Error in createModule:", err);
    return sendErrorResponse(res, 500, "Server Error");
  }
};

// Get Modules
exports.getModules = async (req, res) => {
  const { org_id } = req.user;

  try {
    const modules = await Modules.findAll({ where: { org_id } });
    res.status(200).json({ modules });
  } catch (err) {
    console.error("Get Modules Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch modules");
  }
};

// Update Module
exports.updateModule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { org_id } = req.user;
  const { module_id } = req.params;
  const { module_name } = req.body;

  try {
    const module = await Modules.findOne({ where: { id: module_id, org_id } });

    if (!module) {
      return sendErrorResponse(res, 404, "Module not found.");
    }

    if (module.is_default) {
      return sendErrorResponse(
        res,
        400,
        `Cannot update default module '${module.module_name}'`
      );
    }

    await Modules.update({ module_name }, { where: { id: module_id, org_id } });

    const permissions = await Permissions.findAll({
      where: { org_id, module_id },
    });

    const updatedPermissions = permissions.map((p) => {
      const newCode = `${module_name.toLowerCase().replace(/\s+/g, "_")}_${p.permission_type}`;
      return { id: p.id, permission_code: newCode };
    });

    for (const perm of updatedPermissions) {
      await Permissions.update(
        { permission_code: perm.permission_code },
        { where: { id: perm.id } }
      );
    }

    return res.status(200).json({
      message: "Module and permissions updated successfully",
    });
  } catch (err) {
    console.error("Update Module Error:", err);
    return sendErrorResponse(res, 500, "Failed to update module");
  }
};

// Delete Modules
exports.deleteModule = async (req, res) => {
  const { org_id } = req.user;
  const { module_id } = req.params;

  try {
    const module = await Modules.findOne({ where: { id: module_id, org_id } });

    if (!module) {
      return sendErrorResponse(res, 404, "Module not found.");
    }

    if (module.is_default) {
      return sendErrorResponse(res, 400, `Cannot delete default module '${module.module_name}'.`);
    }

    const modulePermissions = await Permissions.findAll({
      where: { org_id, module_id },
      attributes: ["id"],
    });

    const permissionIds = modulePermissions.map((p) => p.id);

    if (!permissionIds.length) {
      await Modules.destroy({ where: { id: module_id, org_id } });
      return res.status(200).json({
        message: `Module '${module.module_name}' deleted (no permissions found).`,
      });
    }

    const superAdmin = await Roles.findOne({
      where: { org_id, role_name: "Super Admin" },
    });

    const rolePermissions = await RolePermissions.findAll({
      where: {
        org_id,
        permission_id: permissionIds,
        role_id: {
          [db.Sequelize.Op.not]: superAdmin ? superAdmin.id : null,
        },
      },
      include: [{ model: Roles, as: "role" }],
    });

    const roleNames = [...new Set(rolePermissions.map((rp) => rp.role.role_name))];

    if (roleNames.length > 0) {
      return sendErrorResponse(
        res,
        400,
        `Cannot delete module '${module.module_name}' because it is used in roles: ${roleNames.join(", ")}`
      );
    }

    await RolePermissions.destroy({ where: { org_id, permission_id: permissionIds } });
    await Permissions.destroy({ where: { org_id, module_id } });
    await Modules.destroy({ where: { id: module_id, org_id } });

    return res.status(200).json({
      message: `Module '${module.module_name}' deleted successfully.`,
    });
  } catch (err) {
    console.error("Delete Module Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete module");
  }
};

// Get All Permissions
exports.getPermissions = async (req, res) => {
  const { org_id } = req.user;

  try {
    const permissions = await Permissions.findAll({
      where: { org_id },
      include: [{ model: Modules, as: "module" }],
    });

    if (!permissions.length) {
      return sendErrorResponse(res, 404, "No permissions found in this organization.");
    }

    return res.status(200).json({ permissions });
  } catch (err) {
    console.error("Get Permissions Error:", err);
    return sendErrorResponse(res, 500, "Server error while fetching permissions");
  }
};

// Get Permissions of Role
exports.getPermissionsOfRole = async (req, res) => {
  const { org_id } = req.user;
  const { role_id } = req.params;

  try {
    const role = await Roles.findOne({ where: { id: role_id, org_id } });
    if (!role) {
      return sendErrorResponse(res, 404, `Role ID ${role_id} not found in this organization.`);
    }

    const permissions = await RolePermissions.findAll({
      where: { role_id, org_id },
      include: [
        {
          model: Permissions,
          as: "permission",
          include: [{ model: Modules, as: "module" }],
        },
      ],
    });

    if (!permissions.length) {
      return sendErrorResponse(res, 404, "No permissions assigned to this role.");
    }

    const grouped = {};
    permissions.forEach(({ permission }) => {
      const moduleId = permission.module.id;
      const type = permission.permission_type;
      if (!grouped[moduleId]) grouped[moduleId] = {};
      grouped[moduleId][type] = true;
    });

    return res.status(200).json({
      role: role.role_name,
      permissions: grouped,
    });
  } catch (err) {
    console.error("Get Permissions of Role Error:", err);
    return sendErrorResponse(res, 500, "Server error while fetching role permissions");
  }
};

// Utility: Get permissions map for a role
exports.getPermissionsMapped = async (req, res) => {
  const { org_id } = req.user;
  const { role_id } = req.params;

  try {
    const role = await Roles.findOne({ where: { id: role_id, org_id } });
    if (!role) return sendErrorResponse(res, 404, "Role not found");

    const rows = await RolePermissions.findAll({
      where: { org_id, role_id },
      include: [{ model: Permissions, as: "permission" }],
    });

    const result = {};
    rows.forEach(({ permission }) => {
      const modId = permission.module_id;
      result[modId] = result[modId] || {};
      result[modId][permission.permission_type] = true;
    });

    return res.status(200).json({ role: role.role_name, permissions: result });
  } catch (err) {
    console.error("Get Permissions Mapped Error:", err);
    return sendErrorResponse(res, 500, "Server error while mapping permissions");
  }
};

// Create Role
exports.createRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const {
    role_name,
    parent_role_id,
    inherit_permissions = false,
    permissions,
  } = req.body;
  const { org_id, role_id: created_by_role_id } = req.user;

  try {
    const currentRole = await Roles.findOne({
      where: { id: created_by_role_id, org_id },
    });

    if (!currentRole || currentRole.role_name !== "Super Admin") {
      return sendErrorResponse(res, 403, "Only Super Admin can create roles");
    }

    const [role, created] = await Roles.findOrCreate({
      where: { org_id, role_name },
      defaults: {
        org_id,
        role_name,
        created_by_role_id,
        parent_role_id: parent_role_id || null,
        inherit_permissions,
      },
    });

    if (!created) {
      return sendErrorResponse(res, 409, `Role '${role_name}' already exists.`);
    }

    // Handle inherited or custom permissions
    let finalPermissionIds = [];

    if (inherit_permissions && parent_role_id) {
      const inherited = await RolePermissions.findAll({
        where: { org_id, role_id: parent_role_id },
        attributes: ["permission_id"],
      });
      finalPermissionIds = inherited.map((r) => r.permission_id);
    } else {
      for (const [moduleId, perms] of Object.entries(permissions || {})) {
        const modulePermissions = await Permissions.findAll({
          where: { org_id, module_id: moduleId },
        });
        for (const p of modulePermissions) {
          if (perms[p.permission_type]) {
            finalPermissionIds.push(p.id);
          }
        }
      }
    }

    const bulk = finalPermissionIds.map((pid) => ({
      org_id,
      role_id: role.id,
      permission_id: pid,
    }));

    await RolePermissions.bulkCreate(bulk);

    return res.status(201).json({ message: "Role created successfully", role });
  } catch (err) {
    console.error("Create Role Error:", err);
    return sendErrorResponse(res, 500, "Server Error");
  }
};

// Get All Roles
exports.getRoles = async (req, res) => {
  const { org_id } = req.user;

  try {
    const roles = await Roles.findAll({
      where: { org_id },
      include: [
        {
          model: RolePermissions,
          as: "rolePermissionList",
          include: [
            {
              model: Permissions,
              as: "permission",
              include: [{ model: Modules, as: "module" }],
            },
          ],
        },
      ],
    });

    if (!roles.length) {
      return sendErrorResponse(res, 404, "No roles found in this organization.");
    }

    const formattedRoles = roles.map((role) => {
      const permissionsMap = {};
      role.rolePermissionList.forEach(({ permission }) => {
        const modId = permission.module.id;
        const type = permission.permission_type;
        if (!permissionsMap[modId]) permissionsMap[modId] = {};
        permissionsMap[modId][type] = true;
      });
      return {
        id: role.id,
        orgId: role.org_id,
        name: role.role_name,
        parentRoleId: role.parent_role_id,
        inheritPermissions: role.inherit_permissions,
        permissions: permissionsMap,
      };
    });

    return res.status(200).json({ roles: formattedRoles });
  } catch (err) {
    console.error("Get Roles Error:", err);
    return sendErrorResponse(res, 500, "Server Error");
  }
};

// Utility: recursively update children with inherited permissions
const updateChildrenWithInheritedPermissions = async (org_id, parentRoleId) => {
  const parentPermissions = await RolePermissions.findAll({
    where: { org_id, role_id: parentRoleId },
    attributes: ["permission_id"],
  });

  const permissionIds = parentPermissions.map((r) => r.permission_id);

  const childRoles = await Roles.findAll({
    where: { org_id, parent_role_id: parentRoleId, inherit_permissions: true },
  });

  for (const child of childRoles) {
    await RolePermissions.destroy({ where: { org_id, role_id: child.id } });

    const bulk = permissionIds.map((pid) => ({
      org_id,
      role_id: child.id,
      permission_id: pid,
    }));
    await RolePermissions.bulkCreate(bulk);

    await updateChildrenWithInheritedPermissions(org_id, child.id);
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const {
    role_id,
    role_name,
    parent_role_id,
    inherit_permissions,
    permissions,
  } = req.body;

  const { org_id, role_id: requesterRoleId } = req.user;

  try {
    const current = await Roles.findOne({
      where: { id: requesterRoleId, org_id },
    });

    if (!current || current.role_name !== "Super Admin") {
      return sendErrorResponse(res, 403, "Only Super Admin can update roles");
    }

    if (role_id === parent_role_id) {
      return sendErrorResponse(res, 400, "Role cannot be its own parent");
    }

    const role = await Roles.findOne({ where: { id: role_id, org_id } });
    if (!role) return sendErrorResponse(res, 404, "Role not found");

    await Roles.update(
      {
        role_name,
        parent_role_id: parent_role_id || null,
        inherit_permissions,
      },
      { where: { id: role_id } }
    );

    let finalPermissionIds = [];

    if (inherit_permissions && parent_role_id) {
      const inherited = await RolePermissions.findAll({
        where: { org_id, role_id: parent_role_id },
        attributes: ["permission_id"],
      });
      finalPermissionIds = inherited.map((r) => r.permission_id);
    } else {
      for (const [modId, perms] of Object.entries(permissions || {})) {
        const modulePerms = await Permissions.findAll({
          where: { org_id, module_id: modId },
        });
        modulePerms.forEach((p) => {
          if (perms[p.permission_type]) finalPermissionIds.push(p.id);
        });
      }
    }

    const existingRolePermissions = await RolePermissions.findAll({
      where: { org_id, role_id },
      attributes: ["permission_id"],
    });

    const existingIds = existingRolePermissions.map((rp) => rp.permission_id);
    const toAdd = finalPermissionIds.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !finalPermissionIds.includes(id));

    if (toAdd.length) {
      const bulk = toAdd.map((pid) => ({
        org_id,
        role_id,
        permission_id: pid,
      }));
      await RolePermissions.bulkCreate(bulk);
    }

    if (toRemove.length) {
      await RolePermissions.destroy({
        where: {
          org_id,
          role_id,
          permission_id: toRemove,
        },
      });
    }

    await updateChildrenWithInheritedPermissions(org_id, role_id);

    return res.status(200).json({ message: "Role updated successfully", role });
  } catch (err) {
    console.error("Update Role Error:", err);
    return sendErrorResponse(res, 500, "Server Error");
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  const { org_id, role_id: requesterRoleId } = req.user;
  const { role_id } = req.params;

  try {
    const requester = await Roles.findOne({
      where: { id: requesterRoleId, org_id },
    });
    if (!requester || requester.role_name !== "Super Admin") {
      return sendErrorResponse(res, 403, "Only Super Admin can delete roles");
    }

    const roleToDelete = await Roles.findOne({
      where: { id: role_id, org_id },
    });

    if (!roleToDelete) {
      return sendErrorResponse(res, 404, "Role not found");
    }

    if (roleToDelete.role_name === "Super Admin") {
      return sendErrorResponse(res, 403, "Super Admin role cannot be deleted");
    }

    const childRoles = await Roles.findAll({
      where: { parent_role_id: role_id, org_id },
    });

    if (childRoles.length > 0) {
      const childNames = childRoles.map((r) => `'${r.role_name}'`).join(", ");
      return sendErrorResponse(
        res,
        400,
        `Cannot delete parent role '${roleToDelete.role_name}' because it has child role's: ${childNames}`
      );
    }

    await RolePermissions.destroy({ where: { role_id, org_id } });
    await Roles.destroy({ where: { id: role_id, org_id } });

    return res.status(200).json({ message: "Role deleted successfully", role_id });
  } catch (err) {
    console.error("Delete Role Error:", err);
    return sendErrorResponse(res, 500, "Server Error");
  }
};
