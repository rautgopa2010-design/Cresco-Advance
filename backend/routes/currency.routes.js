const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/currency.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, controller.getCurrencies);

router.post(
  "/create",
  auth,
  [
    check("Country", "Country is required").notEmpty(),
    check("currencyCode", "Currency code is required").notEmpty(),
    check("symbol", "Currency symbol is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  controller.createCurrency
);

router.put(
  "/edit/:id",
  auth,
  [
    check("Country", "Country is required").notEmpty(),
    check("currencyCode", "Currency code is required").notEmpty(),
    check("symbol", "Currency symbol is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  controller.updateCurrency
);

router.delete("/:id", auth, controller.deleteCurrency);

module.exports = router;
