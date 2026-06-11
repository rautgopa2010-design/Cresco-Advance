const express = require("express");
const { check } = require("express-validator");
const salutationController = require("../controllers/salutation.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, salutationController.getSalutations);

router.post(
  "/create",
  auth,
  [
    check("salutation", "Salutation is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  salutationController.createSalutation
);

router.put(
  "/edit/:id",
  auth,
  [
    check("salutation", "Salutation is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  salutationController.updateSalutation
);

router.delete("/:id", auth, salutationController.deleteSalutation);

module.exports = router;
