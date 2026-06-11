const router = require("express").Router();
const controller = require("../controllers/providerDashboard.controller");
const auth = require("../middleware/auth.middleware");

router.get(
  "/",
  auth,
  controller.getProviderDashboardData
);

module.exports = router;