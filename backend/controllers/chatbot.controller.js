const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { writeAudit } = require("../utility/chatbotAuthorization");

exports.getSummary = async (req, res) => {
  try {
    res.json({
      entitlement: req.chatbotEntitlement,
      usage: req.chatbotUsage.usage,
      limits: req.chatbotUsage.limits,
      status: req.chatbotUsage.status,
      active: req.chatbotUsage.active,
      exhausted: req.chatbotUsage.exhausted,
      reason: req.chatbotUsage.reason,
      phase: "phase-2-foundation",
      message: "Website AI Chatbot foundation is enabled for this organization.",
    });
  } catch (error) {
    console.error("Get chatbot summary error:", error);
    return sendErrorResponse(res, 500, "Failed to load Website AI Chatbot summary.");
  }
};

exports.auditAccess = async (req, res) => {
  try {
    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "chatbot.module.viewed",
      entityType: "chatbot_entitlement",
      entityId: req.chatbotEntitlement?.id,
      metadata: { phase: "phase-2-foundation" },
    });
    res.json({ message: "Website AI Chatbot access verified." });
  } catch (error) {
    console.error("Audit chatbot access error:", error);
    return sendErrorResponse(res, 500, "Failed to write Website AI Chatbot audit.");
  }
};
