const express = require("express");
const { check } = require("express-validator");
const leadSourceController = require("../controllers/leadSource.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, leadSourceController.getLeadSources);

router.post(
  "/create",
  auth,
  [
    check("leadSource", "Lead Source is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  leadSourceController.createLeadSource
);

router.put(
  "/edit/:id",
  auth,
  [
    check("leadSource", "Lead Source is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  leadSourceController.updateLeadSource
);

router.delete("/:id", auth, leadSourceController.deleteLeadSource);

module.exports = router;
