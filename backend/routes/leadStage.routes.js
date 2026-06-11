const express = require("express");
const { check } = require("express-validator");
const leadStageController = require("../controllers/leadStage.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, leadStageController.getLeadStages);

router.post(
  "/create",
  auth,
  [
    check("leadStage", "Lead Stage is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  leadStageController.createLeadStage
);

router.put(
  "/edit/:id",
  auth,
  [
    check("leadStage", "Lead Stage is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  leadStageController.updateLeadStage
);

router.delete("/:id", auth, leadStageController.deleteLeadStage);

module.exports = router;
