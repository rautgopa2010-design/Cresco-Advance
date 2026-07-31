const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const prospectingAccess = require("../middleware/prospectingAccess.middleware");
const controller = require("../controllers/prospecting.controller");

router.get("/summary", auth, prospectingAccess("prospect_agent.view"), controller.getSummary);
router.put("/settings", auth, prospectingAccess("prospect_agent.configure"), controller.updateSettings);
router.post(
  "/research",
  auth,
  prospectingAccess("prospect_agent.research", { requireResearchCapacity: true }),
  controller.createResearchRequest
);
router.get("/requests", auth, prospectingAccess("prospect_agent.view"), controller.getRequests);
router.get("/prospects", auth, prospectingAccess("prospect_agent.review"), controller.getProspects);
router.get("/prospects/:id/evidence", auth, prospectingAccess("prospect_agent.review"), controller.getProspectEvidence);
router.post("/prospects/:id/approve", auth, prospectingAccess("prospect_agent.approve"), controller.approveProspect);
router.post("/prospects/:id/reject", auth, prospectingAccess("prospect_agent.reject"), controller.rejectProspect);
router.post(
  "/prospects/:id/create-enquiry",
  auth,
  prospectingAccess("prospect_agent.create_enquiry"),
  controller.createEnquiryFromProspect
);
router.get("/audit", auth, prospectingAccess("prospect_agent.view_audit"), controller.getAudit);

module.exports = router;
