const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");

const productValidation = [
  check("productBrandId", "Product Brand is required").notEmpty(),
  check("productCategoryId", "Product Category is required").notEmpty(),
  check("productSubCategoryId", "Product Sub Category is required").notEmpty(),
  check("productUnitName", "Product Unit is required").notEmpty(),
  check("hsnCode", "HSN Code is required").notEmpty(),
  check("product", "Product name is required").notEmpty().trim(),
];

router.get("/", auth, controller.getAllProducts);

router.post("/create", auth, productValidation, controller.createProduct);

router.put("/edit/:id", auth, productValidation, controller.updateProduct);

router.delete("/:id", auth, controller.deleteProduct);

router.post("/import", auth, controller.importProducts);

module.exports = router;
