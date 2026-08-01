const { sendErrorResponse } = require("../utility/sendErrorResponse");
const {
  getEntitlementState,
  hasEmployeePermission,
  ensureProspectingModuleForOrg,
} = require("../utility/prospectingAuthorization");

module.exports = (permissionCode, options = {}) => {
  const { requireResearchCapacity = false } = options;
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
      if (bucket.count > rateMax) return sendErrorResponse(res, 429, "Too many AI Prospecting requests. Please retry shortly.");
      if (req.user.user_type === "provider") {
        return sendErrorResponse(res, 403, "Organization prospecting APIs are not available in Super Master mode.");
      }

      await ensureProspectingModuleForOrg(req.user.org_id);

      const entitlementState = await getEntitlementState(req.user.org_id);
      if (!entitlementState.entitlement) {
        return sendErrorResponse(res, 402, "AI Prospecting is not subscribed for this organization.");
      }

      if (!entitlementState.active && requireResearchCapacity) {
        return sendErrorResponse(res, 403, "AI Prospecting is expired or suspended. Historical records remain available.");
      }

      if (requireResearchCapacity && entitlementState.exhausted) {
        return sendErrorResponse(res, 429, "AI Prospecting usage is exhausted for this organization.");
      }

      const allowed = await hasEmployeePermission(req.user, permissionCode);
      if (!allowed) return sendErrorResponse(res, 403, "Permission denied");

      req.prospectingEntitlement = entitlementState.entitlement;
      req.prospectingUsage = entitlementState;
      next();
    } catch (error) {
      console.error("Prospecting access error:", error);
      return sendErrorResponse(res, 500, "AI Prospecting access check failed.");
    }
  };
};
