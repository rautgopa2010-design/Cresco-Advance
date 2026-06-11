const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/invoice.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

// ✅ Validation rules
const invoiceValidation = [
  check("customerPerson", "Customer person is required").notEmpty(),
  check("date", "Date is required").notEmpty(),
  check("productInvoiceDetails", "Product invoice details are required").notEmpty(),
  check("finalAmt", "Final amount is required").notEmpty(),
];

// ✅ Routes
router.post(
  "/create",
  auth,
  checkPermission("invoice_create"),
  invoiceValidation,
  controller.createInvoice
);

router.get(
  "/",
  auth,
  checkPermission("invoice_view"),
  controller.getAllInvoices
);

router.put(
  "/edit/:id",
  auth,
  checkPermission("invoice_edit"),
  invoiceValidation,
  controller.updateInvoice
);

router.delete(
  "/:id",
  auth,
  checkPermission("invoice_delete"),
  controller.deleteInvoice
);

module.exports = router;
