// const db = require("../models");

// const {
//   modules: Modules,
//   permissions: Permissions,
//   rolePermissions: RolePermissions,
//   roles: Roles,
// } = db;

// const DEFAULT_MODULES = [
//   "Enquiry",
//   "Leads",
//   "API Leads",
//   "Followup",
//   "Quotations",
//   "Orders",
//   "Customer",
//   "Invoice",
//   "Reports",
//   "Master",
//   "Tickets",
// ];
// const DEFAULT_PERMISSIONS = ["view", "create", "edit", "delete", "print"];

// const createDefaultModules = async (org_id) => {
//   const superAdminRole = await Roles.findOne({
//     where: { org_id, role_name: "Super Admin" },
//   });

//   if (!superAdminRole) return;

//   for (const module_name of DEFAULT_MODULES) {
//     const [module, created] = await Modules.findOrCreate({
//       where: { org_id, module_name },
//       defaults: { org_id, module_name, is_default: true },
//     });

//     // If permissions already exist, skip
//     const existingPermissions = await Permissions.findAll({
//       where: { org_id, module_id: module.id },
//     });

//     if (existingPermissions.length === 0) {
//       const permissionRows = DEFAULT_PERMISSIONS.map((type) => ({
//         org_id,
//         module_id: module.id,
//         permission_type: type,
//         permission_code: `${module_name
//           .toLowerCase()
//           .replace(/\s+/g, "_")}_${type}`,
//       }));

//       const createdPermissions = await Permissions.bulkCreate(permissionRows, {
//         returning: true,
//       });

//       const rolePermissionRows = createdPermissions.map((p) => ({
//         org_id,
//         role_id: superAdminRole.id,
//         permission_id: p.id,
//       }));

//       await RolePermissions.bulkCreate(rolePermissionRows);
//     }
//   }
// };

// module.exports = { createDefaultModules };

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
    // 🧱 1️⃣ Get Super Admin role for this org
    const superAdminRole = await Roles.findOne({
      where: { org_id, role_name: "Super Admin" },
    });

    if (!superAdminRole) {
      console.error("❌ Super Admin role not found for org:", org_id);
      return;
    }

    // 🧩 2️⃣ Fetch modules linked to the selected package
    const pkgModules = await PackageModules.findAll({
      where: { package_id },
      attributes: ["module"],
    });

    if (!pkgModules.length) {
      console.warn("⚠️ No modules found for package:", package_id);
      return;
    }

    // 🧠 3️⃣ Ensure each module exists per org
    const moduleNames = pkgModules.map((m) => m.module);

    const existingModules = await Modules.findAll({
      where: { org_id, module_name: { [Op.in]: moduleNames } },
    });

    const existingModuleNames = existingModules.map((m) => m.module_name);
    const missingModules = moduleNames.filter(
      (name) => !existingModuleNames.includes(name)
    );

    // 🆕 4️⃣ Create missing modules for this org
    for (const modName of missingModules) {
      await Modules.create({ org_id, module_name: modName });
    }

    // 🔄 5️⃣ Reload all org-specific modules
    const allModules = await Modules.findAll({
      where: { org_id, module_name: { [Op.in]: moduleNames } },
    });

    // 🧾 6️⃣ Create default permissions for each module for this org
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

        // 7️⃣ Link permissions with Super Admin role
        const rolePermissionRows = createdPermissions.map((p) => ({
          org_id,
          role_id: superAdminRole.id,
          permission_id: p.id,
        }));

        await RolePermissions.bulkCreate(rolePermissionRows);
      }
    }

    console.log(
      `✅ Default modules & permissions created for org_id=${org_id} (package=${package_id})`
    );
  } catch (error) {
    console.error("❌ Error creating default modules:", error);
  }
};
