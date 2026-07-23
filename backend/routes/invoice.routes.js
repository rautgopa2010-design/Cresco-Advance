const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/invoice.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

const invoicePermission = (action) => (req, res, next) => {
  const invoiceType = req.body?.invoiceType || req.query?.invoiceType;
  const modulePrefix = invoiceType === "proforma" ? "proforma_invoice" : "invoice";
  return checkPermission(`${modulePrefix}_${action}`)(req, res, next);
};

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
  invoicePermission("create"),
  invoiceValidation,
  controller.createInvoice
);

router.get(
  "/",
  auth,
  invoicePermission("view"),
  controller.getAllInvoices
);

router.put(
  "/edit/:id",
  auth,
  invoicePermission("edit"),
  invoiceValidation,
  controller.updateInvoice
);

router.delete(
  "/:id",
  auth,
  invoicePermission("delete"),
  controller.deleteInvoice
);

module.exports = router;
