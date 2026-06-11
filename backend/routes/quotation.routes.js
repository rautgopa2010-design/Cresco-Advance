const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/quotation.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

const quotationValidation = [
  check("assignedTo", "AssignedTo must be an array of employee IDs").isArray({ min: 1 }),
  check("customerPerson", "Customer person is required").notEmpty(),
  check("date", "Date is required").notEmpty(),
  check("productQuotationDetails", "Product quotation details are required").isObject(),
  check("finalAmt", "Final amount is required").notEmpty(),
];

// Routes
router.post("/create", auth, checkPermission("quotations_create"), quotationValidation, controller.createQuotation);
router.get("/", auth, checkPermission("quotations_view"), controller.getAllQuotations);
router.put("/edit/:id", auth, checkPermission("quotations_edit"), quotationValidation, controller.updateQuotation);
router.delete("/:id", auth, checkPermission("quotations_delete"), controller.deleteQuotation);

module.exports = router;
