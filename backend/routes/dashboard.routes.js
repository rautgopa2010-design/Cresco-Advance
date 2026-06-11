const router = require("express").Router();
const controller = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth.middleware");

router.get(
  "/",
  auth,
  controller.getDashboardData
);

module.exports = router;