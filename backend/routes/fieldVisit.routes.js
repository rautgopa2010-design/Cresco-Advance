const router = require("express").Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/fieldVisit.controller");

router.get("/", auth, controller.getVisits);
router.get("/summary", auth, controller.getVisitSummary);
router.post(
  "/check-in",
  auth,
  [
    check("latitude", "Latitude is required").notEmpty(),
    check("longitude", "Longitude is required").notEmpty(),
  ],
  controller.createVisit
);

module.exports = router;
