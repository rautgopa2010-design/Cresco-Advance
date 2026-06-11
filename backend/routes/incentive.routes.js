const router = require("express").Router();
const controller = require("../controllers/incentive.controller");
const auth = require("../middleware/auth.middleware");

// GET incentives (with filters: employee_id, type, period)
router.get("/", auth, controller.getEmployeeIncentives);

router.post("/pay", auth, controller.payIncentive);

module.exports = router;
