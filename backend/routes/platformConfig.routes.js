const express = require("express");
const router = express.Router();

const isEnabled = (value) => ["true", "1", "yes", "on"].includes(String(value || "").toLowerCase());

router.get("/", (_req, res) => {
  res.json({
    hrmsEnabled: isEnabled(process.env.HRMS_ENABLED),
  });
});

module.exports = router;
