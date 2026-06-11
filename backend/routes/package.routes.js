const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/package.controller");
const auth = require("../middleware/auth.middleware");

const packageValidation = [
  check("packageName", "Package name is required").notEmpty(),
  check("maxUsers", "Max users is required").isInt({ min: 1 }),
  check("durationType", "Duration type is required").notEmpty(),
  check("durationValue", "Duration value is required").isInt({ min: 1 }),
  check("price", "Price is required").isFloat({ min: 0 }),
  check("currency", "Currency is required").notEmpty(),
];

router.post("/create", auth, packageValidation, controller.createPackage);
router.get("/", auth, controller.getAllPackages);
router.put("/edit/:id", auth, packageValidation, controller.updatePackage);
router.delete("/:id", auth, controller.deletePackage);
router.get("/public", controller.getPublicPackages);
router.get("/:id", auth, controller.getPackageById);


module.exports = router;
