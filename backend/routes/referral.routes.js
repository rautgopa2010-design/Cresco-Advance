const router = require("express").Router();
const controller = require("../controllers/referral.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", controller.createReferral);
router.get("/", auth, controller.getReferrals);
router.put("/:id", auth, controller.updateReferral);

module.exports = router;
