const express = require("express");
const { check } = require("express-validator");
const productCategoryController = require("../controllers/productCategory.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, productCategoryController.getProductCategories);

router.post(
  "/create",
  auth,
  [
    check("productBrandId", "Product Brand is required").notEmpty(),
    check("productCategory", "Product Category is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  productCategoryController.createProductCategory
);

router.put(
  "/edit/:id",
  auth,
  [
    check("productBrandId", "Product Brand is required").notEmpty(),
    check("productCategory", "Product Category is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  productCategoryController.updateProductCategory
);

router.delete("/:id", auth, productCategoryController.deleteProductCategory);

module.exports = router;
