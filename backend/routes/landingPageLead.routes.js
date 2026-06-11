const router = require("express").Router();
const controller = require("../controllers/landingPageLead.controller");
const auth = require("../middleware/auth.middleware");

// Public – from landing page
router.post("/create", controller.createLandingLead);

// Protected
router.get("/", auth, controller.getLandingLeads);
router.put("/lead/:id/status", auth, controller.updateLandingLeadStatus);

module.exports = router;