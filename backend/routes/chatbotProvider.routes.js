const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/chatbotProvider.controller");

router.get("/overview", auth, controller.getOverview);
router.post("/plans", auth, controller.createPlan);
router.put("/orgs/:orgId/entitlement", auth, controller.upsertEntitlement);
router.post("/orgs/:orgId/suspend", auth, controller.suspendOrg);
router.get("/orgs/:orgId/usage", auth, controller.getOrgAggregateUsage);
router.post("/orgs/:orgId/permissions", auth, controller.seedPermissionsForOrg);

module.exports = router;
