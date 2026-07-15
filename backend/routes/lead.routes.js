const express = require("express");
const { check } = require("express-validator");
const leadController = require("../controllers/lead.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadLeadFiles");
const checkPermission = require("../middleware/checkPermission.middleware");

const router = express.Router();

router.post(
  "/create",
  auth,
  checkPermission("leads_create"),
  upload.array("leadFiles"),
  [check("data").notEmpty().withMessage("Form data is required")],
  leadController.createLead
);

router.get(
  "/",
  auth,
  checkPermission("leads_view"),
  leadController.getAllLeads
);

router.put(
  "/update/:lead_id",
  auth,
  checkPermission("leads_edit"),
  upload.array("leadFiles"),
  [check("data").notEmpty().withMessage("Form data is required")],
  leadController.updateLead
);

router.patch(
  "/pipeline/:lead_id",
  auth,
  checkPermission("leads_edit"),
  [
    check("leadStage", "Lead stage is required").notEmpty(),
    check("leadStatus", "Lead status is required").notEmpty(),
  ],
  leadController.updateLeadPipeline
);

router.delete(
  "/:lead_id",
  auth,
  checkPermission("leads_delete"),
  leadController.deleteLead
);

router.delete("/:lead_id/file/:filename", auth, leadController.deleteLeadFile);

router.post(
  "/followup",
  auth,
  checkPermission("followup_create"),
  [
    check("lead_id", "Lead ID is required").notEmpty(),
    check("leadStage", "Lead stage is required").notEmpty(),
    check("leadStatus", "Lead status is required").notEmpty(),
    check("nextFollowUpDate", "Next follow-up date is required").notEmpty(),
  ],
  leadController.addFollowup
);

router.get("/followup/:lead_id", auth, leadController.getFollowupsByLead);

router.put(
  "/followup/:id",
  auth,
  checkPermission("followup_edit"),
  [
    check("leadStage").notEmpty(),
    check("leadStatus").notEmpty(),
    check("nextFollowUpDate").notEmpty(),
  ],
  leadController.updateFollowup
);

router.delete("/followup/:id", auth, checkPermission("followup_delete"), leadController.deleteFollowup);

router.put(
  "/followup/:id/complete",
  auth,
  checkPermission("followup_edit"),
  leadController.markFollowupCompleted
);

module.exports = router;
