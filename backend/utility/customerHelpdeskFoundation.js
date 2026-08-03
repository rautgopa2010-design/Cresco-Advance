const CUSTOMER_HELPDESK_MODULE = "Customer Helpdesk";

const TICKET_SCOPES = Object.freeze({
  PLATFORM_SUPPORT: "PLATFORM_SUPPORT",
  ORGANIZATION_CUSTOMER_SUPPORT: "ORGANIZATION_CUSTOMER_SUPPORT",
});

const CUSTOMER_HELPDESK_PERMISSION_CODES = Object.freeze([
  "customer_helpdesk.dashboard.view",
  "customer_helpdesk.ticket.view",
  "customer_helpdesk.ticket.create",
  "customer_helpdesk.ticket.reply",
  "customer_helpdesk.ticket.assign",
  "customer_helpdesk.ticket.update",
  "customer_helpdesk.internal_note.add",
  "customer_helpdesk.customer_users.manage",
  "customer_helpdesk.teams.manage",
  "customer_helpdesk.sla.manage",
  "customer_helpdesk.automation.manage",
  "customer_helpdesk.knowledge.manage",
  "customer_helpdesk.reports.view",
  "customer_helpdesk.portal.configure",
  "customer_helpdesk.escalate_to_cresco",
]);

const DEFAULT_CUSTOMER_HELPDESK_LIMITS = Object.freeze({
  supportAgents: 0,
  portalUsers: 0,
  monthlyTickets: 0,
  attachmentStorageMb: 0,
  slaEnabled: false,
  automationEnabled: false,
  knowledgeBaseEnabled: false,
  customBrandingEnabled: false,
  reportingEnabled: false,
  customerAccountVisibilityEnabled: false,
  ticketRetentionDays: 365,
});

const normalizeEntitlementStatus = (status) => {
  const normalized = String(status || "trial").toLowerCase();
  return ["trial", "active", "suspended", "expired"].includes(normalized)
    ? normalized
    : "trial";
};

module.exports = {
  CUSTOMER_HELPDESK_MODULE,
  CUSTOMER_HELPDESK_PERMISSION_CODES,
  DEFAULT_CUSTOMER_HELPDESK_LIMITS,
  TICKET_SCOPES,
  normalizeEntitlementStatus,
};
