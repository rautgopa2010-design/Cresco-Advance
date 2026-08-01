const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const chatbotAccess = require("../middleware/chatbotAccess.middleware");
const controller = require("../controllers/chatbot.controller");

router.get("/summary", auth, chatbotAccess("chatbot.view"), controller.getSummary);
router.post("/audit-access", auth, chatbotAccess("chatbot.view"), controller.auditAccess);

module.exports = router;
