const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const checks = [
  {
    name: "CRM auth blocks customer portal JWTs",
    pass: () =>
      read("middleware/auth.middleware.js").includes(
        "Customer portal users cannot access CRM routes"
      ),
  },
  {
    name: "Portal routes use customerPortalAuth",
    pass: () => {
      const routes = read("routes/customerHelpdesk.routes.js");
      return [
        "/portal/me",
        "/portal/tickets",
        "/portal/knowledge-suggestions",
      ].every((needle) => routes.includes(needle)) &&
        routes.includes("customerPortalAuth");
    },
  },
  {
    name: "Agent routes require CRM auth, entitlement and permissions",
    pass: () => {
      const routes = read("routes/customerHelpdesk.routes.js");
      return [
        "auth",
        "customerHelpdeskEntitlement",
        "checkPermission(\"customer_helpdesk.ticket.view\")",
        "checkPermission(\"customer_helpdesk.reports.view\")",
      ].every((needle) => routes.includes(needle));
    },
  },
  {
    name: "Customer portal ticket queries are org/customer scoped",
    pass: () => {
      const controller = read("controllers/customerHelpdesk.controller.js");
      return (
        controller.includes("const portalTicketWhere") &&
        controller.includes("org_id: portalUser.org_id") &&
        controller.includes("customer_id: portalUser.customer_id")
      );
    },
  },
  {
    name: "Internal notes are filtered from customer portal ticket details",
    pass: () =>
      read("controllers/customerHelpdesk.controller.js").includes(
        "where: { visibility: \"public\" }"
      ),
  },
  {
    name: "Crescosoft Support remains scoped to PLATFORM_SUPPORT",
    pass: () => {
      const controller = read("controllers/ticket.controller.js");
      return controller.includes("TICKET_SCOPES.PLATFORM_SUPPORT");
    },
  },
  {
    name: "Customer Helpdesk audit and CSAT models are registered",
    pass: () => {
      const index = read("models/index.js");
      return (
        index.includes("customerHelpdeskAuditLog") &&
        index.includes("customerHelpdeskSatisfaction")
      );
    },
  },
  {
    name: "Optional Crescosoft escalation creates a separate PLATFORM_SUPPORT ticket",
    pass: () => {
      const controller = read("controllers/customerHelpdesk.controller.js");
      const routes = read("routes/customerHelpdesk.routes.js");
      return (
        controller.includes("exports.escalateAgentTicketToCresco") &&
        controller.includes("ticketScope: TICKET_SCOPES.PLATFORM_SUPPORT") &&
        routes.includes("customer_helpdesk.escalate_to_cresco")
      );
    },
  },
];

let failed = 0;
for (const check of checks) {
  const ok = check.pass();
  console.log(`${ok ? "PASS" : "FAIL"} - ${check.name}`);
  if (!ok) failed += 1;
}

if (failed) {
  process.exitCode = 1;
}
