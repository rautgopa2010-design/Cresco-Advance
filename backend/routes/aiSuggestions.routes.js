const express = require("express");
const aiSuggestionsController = require("../controllers/aiSuggestions.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

const router = express.Router();

router.get(
  "/",
  auth,
  checkPermission("leads_view"),
  aiSuggestionsController.getAiSuggestions
);

module.exports = router;
