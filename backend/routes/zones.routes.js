const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/zones.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, controller.getAllZones);

router.post(
  "/create",
  auth,
  [
    check("countryId", "Country is required").notEmpty(),
    check("zones", "Zones must be a non-empty array").isArray({ min: 1 }),
    check("date", "Date is required").notEmpty(),
  ],
  controller.createZones
);

router.put(
  "/edit/:id",
  auth,
  [
    check("countryId", "Country is required").notEmpty(),
    check("zones", "Zones must be a non-empty array").isArray({ min: 1 }),
    check("date", "Date is required").notEmpty(),
  ],
  controller.updateZones
);

router.delete("/:id", auth, controller.deleteZones);

module.exports = router;
