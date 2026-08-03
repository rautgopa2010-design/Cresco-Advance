const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");
const customerHelpdeskEntitlement = require("../middleware/customerHelpdeskEntitlement.middleware");
const customerPortalAuth = require("../middleware/customerPortalAuth.middleware");
const uploadCustomerHelpdeskFiles = require("../middleware/uploadCustomerHelpdeskFiles");
const controller = require("../controllers/customerHelpdesk.controller");

router.get("/foundation", auth, controller.getFoundationStatus);
router.post("/foundation/sync-permissions", auth, controller.syncPermissions);

router.put(
  "/provider/organizations/:orgId/entitlement",
  auth,
  controller.upsertEntitlement
);

router.post(
  "/invitations",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.customer_users.manage"),
  controller.createPortalInvitation
);

router.get(
  "/tickets",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.ticket.view"),
  controller.getTenantTickets
);

router.get(
  "/agent/workspace",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.dashboard.view"),
  controller.getAgentWorkspace
);
router.get(
  "/agent/resources",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.ticket.view"),
  controller.getAgentResources
);
router.get(
  "/agent/reports",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.reports.view"),
  controller.getAgentReports
);
router.get(
  "/agent/audit-logs",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.reports.view"),
  controller.getAgentAuditLogs
);
router.get(
  "/agent/tickets",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.ticket.view"),
  controller.listAgentTickets
);
router.get(
  "/agent/tickets/:ticketId",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: true }),
  checkPermission("customer_helpdesk.ticket.view"),
  controller.getAgentTicketDetails
);
router.post(
  "/agent/tickets/:ticketId/public-replies",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.ticket.reply"),
  uploadCustomerHelpdeskFiles.array("attachments", 5),
  controller.addAgentPublicReply
);
router.post(
  "/agent/tickets/:ticketId/internal-notes",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.internal_note.add"),
  uploadCustomerHelpdeskFiles.array("attachments", 5),
  controller.addAgentInternalNote
);
router.patch(
  "/agent/tickets/:ticketId/assignment",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.ticket.assign"),
  controller.assignAgentTicket
);
router.patch(
  "/agent/tickets/:ticketId",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.ticket.update"),
  controller.updateAgentTicket
);
router.post(
  "/agent/tickets/:ticketId/escalate-to-cresco",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.escalate_to_cresco"),
  controller.escalateAgentTicketToCresco
);
router.post(
  "/agent/categories",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.teams.manage"),
  controller.upsertAgentCategory
);
router.post(
  "/agent/priorities",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.teams.manage"),
  controller.upsertAgentPriority
);
router.post(
  "/agent/teams",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.teams.manage"),
  controller.upsertAgentTeam
);
router.post(
  "/agent/sla-policies",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.sla.manage"),
  controller.upsertAgentSlaPolicy
);
router.post(
  "/agent/assignment-rules",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.automation.manage"),
  controller.upsertAgentAssignmentRule
);
router.post(
  "/agent/knowledge-articles",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.knowledge.manage"),
  controller.upsertKnowledgeArticle
);
router.post(
  "/agent/sla-escalation-scan",
  auth,
  customerHelpdeskEntitlement({ allowReadOnly: false }),
  checkPermission("customer_helpdesk.sla.manage"),
  controller.runAgentSlaEscalationScan
);

router.get("/portal/:organizationKey/branding", controller.getPortalBranding);
router.post("/portal/:organizationKey/activate", controller.activatePortalAccount);
router.post("/portal/:organizationKey/login", controller.loginPortalUser);
router.post("/portal/:organizationKey/forgot-password", controller.forgotPortalPassword);
router.post("/portal/:organizationKey/reset-password", controller.resetPortalPassword);
router.get("/portal/me", customerPortalAuth, controller.getPortalMe);
router.put("/portal/profile", customerPortalAuth, controller.updatePortalProfile);
router.get("/portal/knowledge-suggestions", customerPortalAuth, controller.getPortalKnowledgeSuggestions);
router.post(
  "/portal/knowledge-articles/:articleId/deflected",
  customerPortalAuth,
  controller.markKnowledgeArticleDeflected
);
router.get("/portal/dashboard", customerPortalAuth, controller.getPortalDashboard);
router.get("/portal/tickets", customerPortalAuth, controller.listPortalTickets);
router.post(
  "/portal/tickets",
  customerPortalAuth,
  uploadCustomerHelpdeskFiles.array("attachments", 5),
  controller.createPortalTicket
);
router.get("/portal/tickets/:ticketId", customerPortalAuth, controller.getPortalTicketDetails);
router.post(
  "/portal/tickets/:ticketId/replies",
  customerPortalAuth,
  uploadCustomerHelpdeskFiles.array("attachments", 5),
  controller.addPortalTicketReply
);
router.patch(
  "/portal/tickets/:ticketId/status",
  customerPortalAuth,
  controller.updatePortalTicketStatus
);
router.post(
  "/portal/tickets/:ticketId/satisfaction",
  customerPortalAuth,
  controller.submitPortalSatisfaction
);

module.exports = router;
