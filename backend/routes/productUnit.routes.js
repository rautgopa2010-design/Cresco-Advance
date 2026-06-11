const express = require("express");
const { check } = require("express-validator");
const productUnitController = require("../controllers/productUnit.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, productUnitController.getProductUnits);

router.post(
  "/create",
  auth,
  [
    check("productUnit", "Product Unit is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  productUnitController.createProductUnit
);

router.put(
  "/edit/:id",
  auth,
  [
    check("productUnit", "Product Unit is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  productUnitController.updateProductUnit
);

router.delete("/:id", auth, productUnitController.deleteProductUnit);

module.exports = router;
