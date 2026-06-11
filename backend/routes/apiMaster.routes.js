const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/apiMaster.controller");
const auth = require("../middleware/auth.middleware");

const apiValidation = [
  check("api_name", "API Name is required").notEmpty(),
  check("api_url", "API URL is required").notEmpty(),
  check("api_key", "API Key is required").notEmpty(),
  check("start_date", "Start date is required").notEmpty(),
  check("end_date", "End date is required").notEmpty(),
];

router.post("/create", auth, apiValidation, controller.createAPI);
router.get("/", auth, controller.getAllAPIs);
router.put("/edit/:id", auth, apiValidation, controller.updateAPI);
router.delete("/:id", auth, controller.deleteAPI);

// ✅ Hit API and store leads
router.get("/hit/:id", auth, controller.hitAPI);

// ✅ Get all leads for an API
router.get("/leads/:apiId", auth, controller.getAPILeads);

// ✅ Update lead status (Pending → Converted)
router.put("/lead/:id/status", auth, controller.updateLeadStatus);

module.exports = router;
