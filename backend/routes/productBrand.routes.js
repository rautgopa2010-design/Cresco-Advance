const express = require("express");
const { check } = require("express-validator");
const productBrandController = require("../controllers/productBrand.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, productBrandController.getProductBrands);

router.post(
  "/create",
  auth,
  [
    check("productBrand", "Product Brand is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  productBrandController.createProductBrand
);

router.put(
  "/edit/:id",
  auth,
  [
    check("productBrand", "Product Brand is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  productBrandController.updateProductBrand
);

router.delete("/:id", auth, productBrandController.deleteProductBrand);

module.exports = router;
