const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/countryCode.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, controller.getCountryCodes);

router.post(
  "/create",
  auth,
  [
    check("Country", "Country is required").notEmpty(),
    check("countryCode", "Country Code is required").notEmpty(),
  ],
  controller.createCountryCode
);

router.put(
  "/edit/:id",
  auth,
  [
    check("Country", "Country is required").notEmpty(),
    check("countryCode", "Country Code is required").notEmpty(),
  ],
  controller.updateCountryCode
);

router.delete("/:id", auth, controller.deleteCountryCode);

module.exports = router;
