const express = require("express");
const automationController = require("../controllers/automation.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

const router = express.Router();

router.get(
  "/sales-summary",
  auth,
  checkPermission("leads_view"),
  automationController.getSalesAutomationSummary
);

router.post(
  "/run",
  auth,
  checkPermission("leads_view"),
  automationController.runSalesAutomation
);

module.exports = router;
