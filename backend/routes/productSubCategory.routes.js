const { check } = require("express-validator");
const router = require("express").Router();
const controller = require("../controllers/productSubCategory.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, controller.getAllSubCategories);

router.post(
  "/create",
  auth,
  [
    check("productCategoryId", "Product Category is required").notEmpty(),
    check("productBrandId", "Product Brand is required").notEmpty(),
    check("productSubCategories", "Sub-Categories are required")
      .isArray({ min: 1 }),
    check("date", "Date is required").notEmpty(),
  ],
  controller.createProductSubCategories
);

router.put(
  "/edit/:id",
  auth,
  [
    check("productCategoryId", "Product Category is required").notEmpty(),
    check("productBrandId", "Product Brand is required").notEmpty(),
    check("productSubCategories", "Sub-Categories are required")
      .isArray({ min: 1 }),
    check("date", "Date is required").notEmpty(),
  ],
  controller.updateProductSubCategories
);

router.delete("/:id", auth, controller.deleteSubCategory);

module.exports = router;
