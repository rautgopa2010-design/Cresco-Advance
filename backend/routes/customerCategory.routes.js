const express = require("express");
const { check } = require("express-validator");
const customerCategoryController = require("../controllers/customerCategory.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, customerCategoryController.getCustomerCategory);

router.post(
  "/create",
  auth,
  [
    check("customerCategory", "Customer Category is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  customerCategoryController.createCustomerCategory
);

router.put(
  "/edit/:id",
  auth,
  [
    check("customerCategory", "Customer Category is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  customerCategoryController.updateCustomerCategory
);

router.delete("/:id", auth, customerCategoryController.deleteCustomerCategory);

module.exports = router;
