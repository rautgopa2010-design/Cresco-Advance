const db = require("../models");
const { Op } = require("sequelize");

const PackageModules = db.packageModules;
const Modules = db.modules;
const Roles = db.roles;
const RolePermissions = db.rolePermissions;
const Permissions = db.permissions;

const DEFAULT_PERMISSIONS = ["view", "create", "edit", "delete", "print"];

exports.createDefaultModules = async (org_id, package_id) => {
  try {
    const superAdminRole = await Roles.findOne({
      where: { org_id, role_name: "Super Admin" },
    });

    if (!superAdminRole) {
      console.error("Super Admin role not found for org:", org_id);
      return;
    }

    const pkgModules = await PackageModules.findAll({
      where: { package_id },
      attributes: ["module"],
    });
    const moduleNames = pkgModules.map((m) => m.module);

    const disallowedModules = await Modules.findAll({
      where: {
        org_id,
        ...(moduleNames.length
          ? { module_name: { [Op.notIn]: moduleNames } }
          : {}),
      },
      attributes: ["id"],
    });

    if (disallowedModules.length) {
      const disallowedPermissions = await Permissions.findAll({
        where: {
          org_id,
          module_id: { [Op.in]: disallowedModules.map((module) => module.id) },
        },
        attributes: ["id"],
      });

      if (disallowedPermissions.length) {
        await RolePermissions.destroy({
          where: {
            org_id,
            permission_id: {
              [Op.in]: disallowedPermissions.map((permission) => permission.id),
            },
          },
        });
      }
    }

    if (!moduleNames.length) {
      console.warn("No modules found for package:", package_id);
      return;
    }

    const existingModules = await Modules.findAll({
      where: { org_id, module_name: { [Op.in]: moduleNames } },
    });

    const existingModuleNames = existingModules.map((m) => m.module_name);
    const missingModules = moduleNames.filter(
      (name) => !existingModuleNames.includes(name)
    );

    for (const modName of missingModules) {
      await Modules.create({ org_id, module_name: modName });
    }

    const allModules = await Modules.findAll({
      where: { org_id, module_name: { [Op.in]: moduleNames } },
    });

    for (const module of allModules) {
      const existingPermissions = await Permissions.findAll({
        where: { org_id, module_id: module.id },
      });

      if (existingPermissions.length === 0) {
        const permissionRows = DEFAULT_PERMISSIONS.map((type) => ({
          org_id,
          module_id: module.id,
          permission_type: type,
          permission_code: `${module.module_name
            .toLowerCase()
            .replace(/\s+/g, "_")}_${type}`,
        }));

        const createdPermissions = await Permissions.bulkCreate(permissionRows, {
          returning: true,
        });

        const rolePermissionRows = createdPermissions.map((p) => ({
          org_id,
          role_id: superAdminRole.id,
          permission_id: p.id,
        }));

        await RolePermissions.bulkCreate(rolePermissionRows);
      } else {
        const existingRolePermissionIds = await RolePermissions.findAll({
          where: {
            org_id,
            role_id: superAdminRole.id,
            permission_id: { [Op.in]: existingPermissions.map((p) => p.id) },
          },
          attributes: ["permission_id"],
        });
        const linkedPermissionIds = new Set(
          existingRolePermissionIds.map((rp) => rp.permission_id)
        );
        const missingRolePermissions = existingPermissions
          .filter((p) => !linkedPermissionIds.has(p.id))
          .map((p) => ({
            org_id,
            role_id: superAdminRole.id,
            permission_id: p.id,
          }));

        if (missingRolePermissions.length) {
          await RolePermissions.bulkCreate(missingRolePermissions);
        }
      }
    }

    console.log(
      `Default modules and permissions synced for org_id=${org_id} package=${package_id}`
    );
  } catch (error) {
    console.error("Error creating default modules:", error);
  }
};
