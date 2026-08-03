const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { CUSTOMER_HELPDESK_MODULE } = require("../utility/customerHelpdeskFoundation");

module.exports = ({ allowReadOnly = true } = {}) => {
  return async (req, res, next) => {
    try {
      const org_id = Number(req.user?.org_id);
      if (!org_id) {
        return sendErrorResponse(res, 400, "Organization could not be resolved.");
      }

      const org = await db.register.findByPk(org_id, {
        attributes: ["id", "packageId", "paymentStatus", "accountActivity"],
      });

      if (!org || org.accountActivity === "Deactivate") {
        return sendErrorResponse(res, 403, "Organization account is not active.");
      }

      const packageModule = org.packageId
        ? await db.packageModules.findOne({
            where: {
              package_id: org.packageId,
              module: CUSTOMER_HELPDESK_MODULE,
            },
          })
        : null;

      if (!packageModule) {
        return sendErrorResponse(res, 403, "Customer Helpdesk is not enabled for this organization.");
      }

      const entitlement = await db.customerHelpdeskEntitlement.findOne({
        where: { org_id },
      });

      if (!entitlement) {
        return sendErrorResponse(res, 403, "Customer Helpdesk entitlement is not configured.");
      }

      if (["suspended", "expired"].includes(entitlement.status)) {
        if (allowReadOnly && req.method === "GET") {
          req.customerHelpdeskEntitlement = entitlement;
          return next();
        }
        return sendErrorResponse(res, 403, `Customer Helpdesk is ${entitlement.status}.`);
      }

      req.customerHelpdeskEntitlement = entitlement;
      return next();
    } catch (error) {
      console.error("Customer Helpdesk entitlement middleware error:", error);
      return sendErrorResponse(res, 500, "Customer Helpdesk entitlement check failed.");
    }
  };
};
