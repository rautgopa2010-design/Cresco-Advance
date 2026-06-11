const express = require("express");
const { check } = require("express-validator");
const countryController = require("../controllers/country.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, countryController.getCountries);

router.post(
  "/create",
  auth,
  [
    check("country", "Country is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  countryController.createCountry
);

router.put(
  "/edit/:id",
  auth,
  [
    check("country", "Country is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  countryController.updateCountry
);

router.delete("/:id", auth, countryController.deleteCountry);

module.exports = router;
