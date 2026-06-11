const express = require("express");
const { check } = require("express-validator");
const leadStatusController = require("../controllers/leadStatus.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, leadStatusController.getLeadStatuses);

router.post(
  "/create",
  auth,
  [
    check("leadStatus", "Lead Status is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  leadStatusController.createLeadStatus
);

router.put(
  "/edit/:id",
  auth,
  [
    check("leadStatus", "Lead Status is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  leadStatusController.updateLeadStatus
);

router.delete("/:id", auth, leadStatusController.deleteLeadStatus);

module.exports = router;
