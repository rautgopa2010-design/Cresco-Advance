const express = require("express");
const { check } = require("express-validator");
const tAndCAndDecController = require("../controllers/tAndCAndDec.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

// Get all entries (with optional type filter)
router.get("/", auth, tAndCAndDecController.getAll);

// Get default entry by type
router.get("/default/:type", auth, tAndCAndDecController.getDefaultByType);

// Get single entry by ID
router.get("/:id", auth, tAndCAndDecController.getById);

// Create new entry
router.post(
  "/create",
  auth,
  [
    check("type", "Type is required").isIn(['quotation_description', 'quotation_terms', 'invoice_terms']),
    check("title", "Title is required").notEmpty(),
    check("content", "Content is required").notEmpty(),
  ],
  tAndCAndDecController.create
);

// Update entry
router.put(
  "/edit/:id",
  auth,
  [
    check("type", "Type is required").isIn(['quotation_description', 'quotation_terms', 'invoice_terms']),
    check("title", "Title is required").notEmpty(),
    check("content", "Content is required").notEmpty(),
  ],
  tAndCAndDecController.update
);

// Delete entry
router.delete("/:id", auth, tAndCAndDecController.delete);

module.exports = router;