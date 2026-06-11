const express = require("express");
const { check } = require("express-validator");
const prefixController = require("../controllers/prefix.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, prefixController.getPrefix);

router.post(
  "/",
  auth,
  [
    check("orderPrefix", "Order prefix is required")
      .optional()
      .trim()
      .notEmpty(),
    check("quotationPrefix", "Quotation prefix is required")
      .optional()
      .trim()
      .notEmpty(),
    check("invoicePrefix", "Invoice prefix is required")
      .optional()
      .trim()
      .notEmpty(),
  ],
  prefixController.createOrUpdatePrefix
);

router.delete("/", auth, prefixController.deletePrefix);

module.exports = router;
