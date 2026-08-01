const { sendErrorResponse } = require("../utility/sendErrorResponse");
const {
  ensureChatbotModuleForOrg,
  getEntitlementState,
  hasEmployeePermission,
} = require("../utility/chatbotAuthorization");

module.exports = (permissionCode, options = {}) => {
  const { requireCapacity = false } = options;
  const rateWindowMs = 60 * 1000;
  const rateMax = 120;
  const buckets = module.exports.__buckets || (module.exports.__buckets = new Map());

  return async (req, res, next) => {
    try {
      if (!req.user) return sendErrorResponse(res, 401, "Unauthorized");

      const rateKey = `${req.user.org_id || "provider"}:${req.user.id || "anonymous"}`;
      const now = Date.now();
      const bucket = buckets.get(rateKey) || { count: 0, resetAt: now + rateWindowMs };
      if (bucket.resetAt < now) {
        bucket.count = 0;
        bucket.resetAt = now + rateWindowMs;
      }
      bucket.count += 1;
      buckets.set(rateKey, bucket);
      if (bucket.count > rateMax) return sendErrorResponse(res, 429, "Too many Website AI Chatbot requests. Please retry shortly.");

      if (req.user.user_type === "provider") {
        return sendErrorResponse(res, 403, "Organization chatbot APIs are not available in Super Master mode.");
      }

      await ensureChatbotModuleForOrg(req.user.org_id);

      const entitlementState = await getEntitlementState(req.user.org_id);
      if (!entitlementState.entitlement) {
        return sendErrorResponse(res, 402, "Website AI Chatbot is not subscribed for this organization.");
      }
      if (!entitlementState.active && requireCapacity) {
        return sendErrorResponse(res, 403, "Website AI Chatbot is expired or suspended. Historical records remain available.");
      }
      if (requireCapacity && entitlementState.exhausted) {
        return sendErrorResponse(res, 429, "Website AI Chatbot usage is exhausted for this organization.");
      }

      const allowed = await hasEmployeePermission(req.user, permissionCode);
      if (!allowed) return sendErrorResponse(res, 403, "Permission denied");

      req.chatbotEntitlement = entitlementState.entitlement;
      req.chatbotUsage = entitlementState;
      next();
    } catch (error) {
      console.error("Chatbot access error:", error);
      return sendErrorResponse(res, 500, "Website AI Chatbot access check failed.");
    }
  };
};
