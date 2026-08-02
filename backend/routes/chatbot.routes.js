const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const chatbotAccess = require("../middleware/chatbotAccess.middleware");
const controller = require("../controllers/chatbot.controller");
const uploadKnowledge = require("../middleware/uploadChatbotKnowledge");

router.get("/summary", auth, chatbotAccess("chatbot.view"), controller.getSummary);
router.post("/audit-access", auth, chatbotAccess("chatbot.view"), controller.auditAccess);
router.put("/configuration", auth, chatbotAccess("chatbot.configure"), controller.updateConfiguration);
router.put("/lead-form", auth, chatbotAccess("chatbot.configure"), controller.updateLeadForm);
router.post("/domains", auth, chatbotAccess("chatbot.install.manage"), controller.addDomain);
router.delete("/domains/:id", auth, chatbotAccess("chatbot.install.manage"), controller.archiveDomain);
router.post("/faqs", auth, chatbotAccess("chatbot.knowledge.manage"), controller.createFaq);
router.put("/faqs/:id", auth, chatbotAccess("chatbot.knowledge.manage"), controller.updateFaq);
router.delete("/faqs/:id", auth, chatbotAccess("chatbot.knowledge.manage"), controller.archiveFaq);
router.post("/knowledge/text", auth, chatbotAccess("chatbot.knowledge.manage", { requireCapacity: true }), controller.createTextKnowledge);
router.post("/knowledge/url", auth, chatbotAccess("chatbot.knowledge.manage", { requireCapacity: true }), controller.createUrlKnowledge);
router.post("/knowledge/document", auth, chatbotAccess("chatbot.knowledge.manage", { requireCapacity: true }), uploadKnowledge.single("document"), controller.uploadDocumentKnowledge);
router.delete("/knowledge/:id", auth, chatbotAccess("chatbot.knowledge.manage"), controller.archiveKnowledge);
router.post("/widget/rotate", auth, chatbotAccess("chatbot.install.manage"), controller.rotateWidgetIdentifier);

router.get("/public/:widgetIdentifier/config", controller.getPublicConfig);
router.post("/public/:widgetIdentifier/message", controller.publicMessage);
router.post("/public/:widgetIdentifier/enquiry", controller.publicEnquiryCapture);
router.post("/public/:widgetIdentifier/support", controller.publicSupportRequest);

module.exports = router;
