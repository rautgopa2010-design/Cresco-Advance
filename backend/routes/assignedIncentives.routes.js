const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/assignedIncentives.controller");
const auth = require("../middleware/auth.middleware");

const assignedIncentiveValidation = [
  check("employeeId", "Employee is required").notEmpty(),
  check("product", "Product is required").notEmpty(),
  check("formulaId", "Formula is required").notEmpty(),
  check("month", "Month is required").notEmpty(),
  check("targetedAmount", "Targeted amount is required").isNumeric(),
  check("elligibleAmount", "Eligible amount is required").isNumeric(),
  check("date", "Date is required").notEmpty(),
];

router.get("/", auth, controller.getAssignedIncentives);
router.post("/create", auth, assignedIncentiveValidation, controller.createAssignedIncentive);
router.put("/edit/:id", auth, assignedIncentiveValidation, controller.updateAssignedIncentive);
router.delete("/:id", auth, controller.deleteAssignedIncentive);

module.exports = router;
