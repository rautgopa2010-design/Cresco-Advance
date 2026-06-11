const express = require("express");
const { check } = require("express-validator");
const industryController = require("../controllers/industry.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, industryController.getIndustry);

router.post(
  "/create",
  auth,
  [
    check("industry", "Industry is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  industryController.createIndustry
);

router.put(
  "/edit/:id",
  auth,
  [
    check("industry", "Industry is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  industryController.updateIndustry
);

router.delete("/:id", auth, industryController.deleteIndustry);

module.exports = router;
