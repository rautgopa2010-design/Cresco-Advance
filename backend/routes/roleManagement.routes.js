const express = require("express");
const { check } = require("express-validator");
const ctrl = require("../controllers/roleManagement.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

// Module
router.get("/modules", auth, ctrl.getModules);
router.post(
  "/module",
  auth,
  [check("module_name", "Module name is required").notEmpty()],
  ctrl.createModule
);

router.put(
  "/module/:module_id",
  auth,
  [check("module_name", "Module name is required").notEmpty()],
  ctrl.updateModule
);

router.delete("/module/:module_id", auth, ctrl.deleteModule);

// Permissions
router.get("/permissions", auth, ctrl.getPermissions);
router.get("/role/:role_id/permissions", auth, ctrl.getPermissionsOfRole);
router.get("/role/:role_id/permissions-map", auth, ctrl.getPermissionsMapped);

// Role
router.get("/roles", auth, ctrl.getRoles);
router.post(
  "/role",
  auth,
  [check("role_name", "Role name is required").notEmpty()],
  ctrl.createRole
);

router.put(
  "/role",
  auth,
  [
    check("role_id", "Role ID is required").notEmpty(),
    check("role_name", "Role name is required").notEmpty(),
  ],
  ctrl.updateRole
);

router.delete("/role/:role_id", auth, ctrl.deleteRole);

module.exports = router;
