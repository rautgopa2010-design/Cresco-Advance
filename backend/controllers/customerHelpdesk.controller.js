const db = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const brevoEmail = require("../utility/brevoEmail");
const { createNotification } = require("../utility/createNotification");
const {
  CUSTOMER_HELPDESK_MODULE,
  CUSTOMER_HELPDESK_PERMISSION_CODES,
  DEFAULT_CUSTOMER_HELPDESK_LIMITS,
  TICKET_SCOPES,
  normalizeEntitlementStatus,
} = require("../utility/customerHelpdeskFoundation");

const {
  customerHelpdeskEntitlement: CustomerHelpdeskEntitlement,
  customerHelpdeskTicket: CustomerHelpdeskTicket,
  customerHelpdeskTicketReply: CustomerHelpdeskTicketReply,
  customerHelpdeskTicketAttachment: CustomerHelpdeskTicketAttachment,
  customerHelpdeskTeam: CustomerHelpdeskTeam,
  customerHelpdeskTeamMember: CustomerHelpdeskTeamMember,
  customerHelpdeskCategory: CustomerHelpdeskCategory,
  customerHelpdeskPriority: CustomerHelpdeskPriority,
  customerHelpdeskSlaPolicy: CustomerHelpdeskSlaPolicy,
  customerHelpdeskAssignmentRule: CustomerHelpdeskAssignmentRule,
  customerHelpdeskKnowledgeArticle: CustomerHelpdeskKnowledgeArticle,
  customerHelpdeskAuditLog: CustomerHelpdeskAuditLog,
  customerHelpdeskSatisfaction: CustomerHelpdeskSatisfaction,
  ticket: PlatformTicket,
  customerPortal: CustomerPortal,
  customerPortalUser: CustomerPortalUser,
  customerPortalInvitation: CustomerPortalInvitation,
  customer: Customer,
  customerContact: CustomerContact,
  employee: Employee,
  modules: Modules,
  permissions: Permissions,
  roles: Roles,
  rolePermissions: RolePermissions,
  packageModules: PackageModules,
  register: Register,
  companySetup: CompanySetup,
} = db;

const requireProvider = (req, res) => {
  if (
    req.user?.user_type !== "provider" ||
    req.user?.role_name !== "Super Provider Admin"
  ) {
    sendErrorResponse(res, 403, "Only Super Provider Admin can manage Customer Helpdesk entitlements.");
    return false;
  }
  return true;
};

const canSyncFoundation = (req) => {
  return (
    (req.user?.user_type === "provider" &&
      req.user?.role_name === "Super Provider Admin") ||
    req.user?.role_name === "Super Admin"
  );
};

const resolveOrgId = (req) => {
  if (req.user?.user_type === "provider" && req.params.orgId) {
    return Number(req.params.orgId);
  }
  return Number(req.user?.org_id);
};

const slugify = (value) =>
  String(value || "support")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "support";

const ensureCustomerPortal = async (org, transaction = null) => {
  const baseSlug = slugify(org.company);
  const [portal] = await CustomerPortal.findOrCreate({
    where: { org_id: org.id },
    defaults: {
      org_id: org.id,
      publicKey: crypto.randomBytes(12).toString("hex"),
      portalSlug: `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`,
      branding: { organizationName: org.company },
    },
    transaction,
  });
  return portal;
};

const findPortalByKey = async (organizationKey) => {
  return CustomerPortal.findOne({
    where: {
      [db.Sequelize.Op.or]: [
        { publicKey: organizationKey },
        { portalSlug: organizationKey },
      ],
      isActive: true,
    },
    include: [
      {
        model: Register,
        as: "organization",
        attributes: ["id", "company", "accountActivity", "paymentStatus", "packageId"],
      },
    ],
  });
};

const buildPortalUserPayload = (portalUser) => ({
  id: portalUser.id,
  org_id: portalUser.org_id,
  customer_id: portalUser.customer_id,
  contact_id: portalUser.contact_id,
  name: portalUser.name,
  email: portalUser.email,
  mobile: portalUser.mobile,
  isCustomerAccountAdmin: portalUser.isCustomerAccountAdmin,
});

const buildPortalBranding = (portal) => ({
  publicKey: portal.publicKey,
  portalSlug: portal.portalSlug,
  organizationName:
    portal.branding?.organizationName || portal.organization?.company || "Support Portal",
  logo: portal.branding?.logo || null,
  primaryColor: portal.branding?.primaryColor || "#10253f",
  accentColor: portal.branding?.accentColor || "#14765f",
});

const getPortalBrandingPayload = async (portal) => {
  const companySetup = await CompanySetup.findOne({
    where: { org_id: portal.org_id },
    attributes: ["companyName", "companyLogo"],
  });
  const branding = buildPortalBranding(portal);
  return {
    ...branding,
    organizationName:
      companySetup?.companyName ||
      branding.organizationName ||
      portal.organization?.company ||
      "Support Portal",
    logo: companySetup?.companyLogo || branding.logo || null,
  };
};

const fullName = (record) =>
  [record?.firstName, record?.middleName, record?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

const sendPortalInvitationEmail = async ({
  to,
  toName,
  organizationName,
  activationUrl,
}) => {
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2>${organizationName} Support Portal Invitation</h2>
      <p>Hello ${toName},</p>
      <p>You have been invited to activate your ${organizationName} support portal account.</p>
      <p><a href="${activationUrl}" style="background:#053054;color:#fff;padding:12px 18px;text-decoration:none;border-radius:5px">Activate Account</a></p>
      <p>This invitation link expires in 48 hours.</p>
    </div>
  `;

  await brevoEmail.sendEmail({
    to,
    toName,
    subject: `${organizationName} Support Portal Invitation`,
    htmlContent,
  });
};

const sendPortalResetEmail = async ({ to, toName, organizationName, resetUrl }) => {
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2>Reset Your ${organizationName} Support Portal Password</h2>
      <p>Hello ${toName},</p>
      <p>Use the link below to reset your support portal password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#053054;color:#fff;padding:12px 18px;text-decoration:none;border-radius:5px">Reset Password</a></p>
    </div>
  `;

  await brevoEmail.sendEmail({
    to,
    toName,
    subject: `${organizationName} Support Portal Password Reset`,
    htmlContent,
  });
};

const getPortalBaseUrl = (portal) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${frontendUrl}/support/${portal.portalSlug}`;
};

const isOrganizationActive = (org) =>
  org && org.accountActivity !== "Deactivate" && org.paymentStatus !== "Overdue";

const assertPublicPortalAccess = async (portal) => {
  if (!portal || !isOrganizationActive(portal.organization)) {
    return "Support portal is not available.";
  }

  const packageModule = portal.organization.packageId
    ? await PackageModules.findOne({
        where: {
          package_id: portal.organization.packageId,
          module: CUSTOMER_HELPDESK_MODULE,
        },
      })
    : null;

  if (!packageModule) {
    return "Customer Helpdesk is not enabled for this organization.";
  }

  const entitlement = await CustomerHelpdeskEntitlement.findOne({
    where: { org_id: portal.org_id },
  });

  if (!entitlement || ["suspended", "expired"].includes(entitlement.status)) {
    return "Customer Helpdesk is not currently active.";
  }

  return null;
};

const getPortalSessionContext = async (req) => {
  const portalUser = await CustomerPortalUser.findOne({
    where: {
      id: req.portalUser.portal_user_id,
      org_id: req.portalUser.org_id,
      portalStatus: "active",
      activationStatus: "activated",
    },
    include: [
      { model: Customer, as: "customer" },
      { model: CustomerContact, as: "contact" },
    ],
  });

  if (!portalUser) {
    return { error: "Portal user not found." };
  }

  const portal = await CustomerPortal.findOne({
    where: { org_id: portalUser.org_id, isActive: true },
    include: [
      {
        model: Register,
        as: "organization",
        attributes: ["id", "company", "accountActivity", "paymentStatus", "packageId"],
      },
    ],
  });
  const accessError = await assertPublicPortalAccess(portal);

  return { portalUser, portal, accessError };
};

const portalTicketWhere = (portalUser, extra = {}) => ({
  org_id: portalUser.org_id,
  ...(portalUser.customer_id && { customer_id: portalUser.customer_id }),
  ticketScope: TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT,
  ...extra,
});

const mapUploadedFiles = ({
  files = [],
  ticketId,
  replyId = null,
  org_id,
  portalUserId,
}) =>
  files.map((file) => ({
    org_id,
    ticketId,
    replyId,
    uploadedByType: "customer_portal",
    uploadedByPortalUserId: portalUserId,
    originalName: file.originalname,
    fileName: file.filename,
    filePath: `/uploads/customer-helpdesk/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
  }));

const formatTicket = (ticket) => ({
  id: ticket.id,
  publicReference: ticket.publicReference,
  subject: ticket.subject,
  description: ticket.description,
  status: ticket.status,
  priority: ticket.priority,
  category: ticket.category,
  supportTeamId: ticket.supportTeamId,
  assignedTo: ticket.assignedTo,
  slaPolicyId: ticket.slaPolicyId,
  firstResponseDueAt: ticket.firstResponseDueAt,
  firstResponseAt: ticket.firstResponseAt,
  resolutionDueAt: ticket.resolutionDueAt,
  escalatedAt: ticket.escalatedAt,
  escalationLevel: ticket.escalationLevel,
  crescoSupportTicketId: ticket.crescoSupportTicketId,
  escalatedToCrescoAt: ticket.escalatedToCrescoAt,
  deflectedByArticleIds: ticket.deflectedByArticleIds,
  supportTeam: ticket.supportTeam,
  customer: ticket.customer,
  contact: ticket.contact,
  requester: ticket.requester,
  source: ticket.source,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  closedAt: ticket.closedAt,
  replies: ticket.replies || [],
  attachments: ticket.attachments || [],
});

const formatAgentTicket = (ticket) => ({
  ...formatTicket(ticket),
  internalNotes: (ticket.replies || []).filter(
    (reply) => reply.visibility === "internal"
  ),
  publicReplies: (ticket.replies || []).filter(
    (reply) => reply.visibility === "public"
  ),
});

const buildPublicReference = () =>
  `CHD-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const addMinutes = (date, minutes) =>
  new Date(date.getTime() + Number(minutes || 0) * 60 * 1000);

const findMatchingSlaPolicy = async ({ org_id, priority, category }) => {
  const policies = await CustomerHelpdeskSlaPolicy.findAll({
    where: { org_id, isActive: true },
    order: [["isDefault", "DESC"], ["id", "ASC"]],
  });

  return (
    policies.find(
      (policy) =>
        (!policy.priority || policy.priority === priority) &&
        (!policy.category || policy.category === category)
    ) ||
    policies.find((policy) => policy.isDefault) ||
    policies[0] ||
    null
  );
};

const ruleMatchesTicket = (rule, ticketData) => {
  const conditions = rule.conditions || {};
  return Object.entries(conditions).every(([key, expected]) => {
    if (expected === undefined || expected === null || expected === "") return true;
    const actual = String(ticketData[key] || "").toLowerCase();
    return Array.isArray(expected)
      ? expected.map((item) => String(item).toLowerCase()).includes(actual)
      : actual === String(expected).toLowerCase();
  });
};

const findMatchingAssignmentRule = async ({ org_id, priority, category }) => {
  const rules = await CustomerHelpdeskAssignmentRule.findAll({
    where: { org_id, isActive: true },
    order: [["priority", "DESC"], ["id", "ASC"]],
  });
  return rules.find((rule) => ruleMatchesTicket(rule, { priority, category })) || null;
};

const resolveAssignedEmployees = async (org_id, employeeIds = []) => {
  const normalizedIds = [...new Set((employeeIds || []).map(Number).filter(Boolean))];
  if (!normalizedIds.length) return [];

  const employees = await Employee.findAll({
    where: { id: normalizedIds, org_id, isDeleted: false },
    attributes: ["id", "user_id", "firstName", "lastName", "email"],
  });

  return employees.map((employee) => ({
    employeeId: employee.id,
    user_id: employee.user_id,
    name: fullName(employee),
    email: employee.email,
  }));
};

const applySlaAndAssignment = async ({ org_id, priority, category }) => {
  const now = new Date();
  const [slaPolicy, assignmentRule] = await Promise.all([
    findMatchingSlaPolicy({ org_id, priority, category }),
    findMatchingAssignmentRule({ org_id, priority, category }),
  ]);
  const assignedTo = assignmentRule
    ? await resolveAssignedEmployees(org_id, assignmentRule.assignEmployeeIds || [])
    : [];

  return {
    slaPolicyId: slaPolicy?.id || null,
    firstResponseDueAt: slaPolicy ? addMinutes(now, slaPolicy.firstResponseMinutes) : null,
    resolutionDueAt: slaPolicy ? addMinutes(now, slaPolicy.resolutionMinutes) : null,
    supportTeamId: assignmentRule?.supportTeamId || null,
    assignedTo,
    status: assignedTo.length || assignmentRule?.supportTeamId ? "Assigned" : "New",
  };
};

const notifyAgentUsers = async ({ org_id, assignedTo = [], type, title, message, ticket }) => {
  const targets = assignedTo.length
    ? assignedTo.map((assignee) => assignee.user_id).filter(Boolean)
    : [null];

  await Promise.all(
    targets.map((user_id) =>
      createNotification({
        org_id,
        user_id,
        type,
        title,
        message,
        data: { ticketId: ticket.id, publicReference: ticket.publicReference },
        broadcast_to: user_id ? "user" : "org",
      })
    )
  );
};

const recordAudit = async ({
  req,
  org_id,
  ticketId = null,
  action,
  entityType,
  entityId = null,
  metadata = {},
  actorType = null,
}) => {
  try {
    await CustomerHelpdeskAuditLog.create({
      org_id,
      ticketId,
      actorType:
        actorType ||
        (req.portalUser ? "customer_portal" : req.user?.user_type === "provider" ? "provider" : "employee"),
      actorUserId: req.user?.id || null,
      actorPortalUserId: req.portalUser?.portal_user_id || null,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get?.("user-agent") || null,
    });
  } catch (error) {
    console.error("Customer Helpdesk audit log failed:", error.message);
  }
};

const sendPortalTicketEmail = async ({ portalUser, subject, htmlContent }) => {
  if (!portalUser?.email) return;
  try {
    await brevoEmail.sendEmail({
      to: portalUser.email,
      toName: portalUser.name,
      subject,
      htmlContent,
    });
  } catch (error) {
    console.error("Customer Helpdesk email notification failed:", error.message);
  }
};

const findKnowledgeSuggestions = async ({ org_id, query, limit = 5 }) => {
  const normalized = String(query || "").toLowerCase();
  const words = normalized.match(/[a-z0-9]{3,}/g) || [];
  const articles = await CustomerHelpdeskKnowledgeArticle.findAll({
    where: { org_id, isPublished: true },
    order: [["updatedAt", "DESC"]],
    limit: 50,
  });

  return articles
    .map((article) => {
      const haystack = [
        article.title,
        article.summary,
        article.content,
        article.category,
        ...(article.keywords || []),
      ]
        .join(" ")
        .toLowerCase();
      const score = words.reduce(
        (total, word) => total + (haystack.includes(word) ? 1 : 0),
        0
      );
      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article, score }) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      category: article.category,
      score,
    }));
};

const ensureCustomerHelpdeskPermissions = async (org_id, transaction = null) => {
  const [module] = await Modules.findOrCreate({
    where: { org_id, module_name: CUSTOMER_HELPDESK_MODULE },
    defaults: { org_id, module_name: CUSTOMER_HELPDESK_MODULE, is_default: true },
    transaction,
  });

  const existingPermissions = await Permissions.findAll({
    where: { org_id, module_id: module.id },
    transaction,
  });
  const existingCodes = new Set(
    existingPermissions.map((permission) => permission.permission_code)
  );

  const missingRows = CUSTOMER_HELPDESK_PERMISSION_CODES.filter(
    (code) => !existingCodes.has(code)
  ).map((code) => ({
    org_id,
    module_id: module.id,
    permission_type: code.replace("customer_helpdesk.", ""),
    permission_code: code,
  }));

  const createdPermissions = missingRows.length
    ? await Permissions.bulkCreate(missingRows, { returning: true, transaction })
    : [];

  const allPermissions = existingPermissions.concat(createdPermissions);
  const superAdminRole = await Roles.findOne({
    where: { org_id, role_name: "Super Admin" },
    transaction,
  });

  if (superAdminRole && allPermissions.length) {
    const existingRolePermissions = await RolePermissions.findAll({
      where: {
        org_id,
        role_id: superAdminRole.id,
        permission_id: allPermissions.map((permission) => permission.id),
      },
      transaction,
    });
    const linkedIds = new Set(
      existingRolePermissions.map((rolePermission) => rolePermission.permission_id)
    );
    const missingRoleRows = allPermissions
      .filter((permission) => !linkedIds.has(permission.id))
      .map((permission) => ({
        org_id,
        role_id: superAdminRole.id,
        permission_id: permission.id,
      }));

    if (missingRoleRows.length) {
      await RolePermissions.bulkCreate(missingRoleRows, { transaction });
    }
  }

  return {
    module,
    permissionCodes: CUSTOMER_HELPDESK_PERMISSION_CODES,
  };
};

const buildEntitlementPayload = (entitlement, packageModuleEnabled) => ({
  module: CUSTOMER_HELPDESK_MODULE,
  packageModuleEnabled,
  entitlement: entitlement
    ? {
        status: entitlement.status,
        limits: entitlement.limits,
        startsAt: entitlement.startsAt,
        expiresAt: entitlement.expiresAt,
      }
    : null,
});

exports.getFoundationStatus = async (req, res) => {
  const org_id = resolveOrgId(req);

  if (!org_id) {
    return sendErrorResponse(res, 400, "Organization could not be resolved.");
  }

  try {
    const org = await Register.findByPk(org_id, {
      attributes: ["id", "packageId", "paymentStatus", "accountActivity"],
    });

    if (!org) {
      return sendErrorResponse(res, 404, "Organization not found.");
    }

    const [entitlement, packageModule] = await Promise.all([
      CustomerHelpdeskEntitlement.findOne({ where: { org_id } }),
      org.packageId
        ? PackageModules.findOne({
            where: {
              package_id: org.packageId,
              module: CUSTOMER_HELPDESK_MODULE,
            },
          })
        : null,
    ]);

    return res.status(200).json({
      ...buildEntitlementPayload(entitlement, Boolean(packageModule)),
      organization: {
        id: org.id,
        paymentStatus: org.paymentStatus,
        accountActivity: org.accountActivity,
      },
    });
  } catch (error) {
    console.error("Customer Helpdesk foundation status error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch Customer Helpdesk foundation status.");
  }
};

exports.upsertEntitlement = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const org_id = Number(req.params.orgId);
  if (!org_id) {
    return sendErrorResponse(res, 400, "Organization ID is required.");
  }

  const status = normalizeEntitlementStatus(req.body.status);
  const limits = {
    ...DEFAULT_CUSTOMER_HELPDESK_LIMITS,
    ...(req.body.limits || {}),
  };

  try {
    const org = await Register.findByPk(org_id);
    if (!org) {
      return sendErrorResponse(res, 404, "Organization not found.");
    }

    const entitlement = await db.sequelize.transaction(async (transaction) => {
      const [record] = await CustomerHelpdeskEntitlement.findOrCreate({
        where: { org_id },
        defaults: {
          org_id,
          status,
          limits,
          startsAt: req.body.startsAt || new Date(),
          expiresAt: req.body.expiresAt || null,
          configuredBy: req.user.id,
        },
        transaction,
      });

      await record.update(
        {
          status,
          limits,
          startsAt: req.body.startsAt || record.startsAt || new Date(),
          expiresAt: req.body.expiresAt || null,
          configuredBy: req.user.id,
        },
        { transaction }
      );

      await ensureCustomerHelpdeskPermissions(org_id, transaction);

      return record;
    });

    return res.status(200).json({
      message: "Customer Helpdesk entitlement saved.",
      entitlement,
    });
  } catch (error) {
    console.error("Customer Helpdesk entitlement error:", error);
    return sendErrorResponse(res, 500, "Failed to save Customer Helpdesk entitlement.");
  }
};

exports.syncPermissions = async (req, res) => {
  if (!canSyncFoundation(req)) {
    return sendErrorResponse(res, 403, "Only Super Admin can sync Customer Helpdesk permissions.");
  }

  const org_id = resolveOrgId(req);

  if (!org_id) {
    return sendErrorResponse(res, 400, "Organization could not be resolved.");
  }

  try {
    const result = await ensureCustomerHelpdeskPermissions(org_id);
    return res.status(200).json({
      message: "Customer Helpdesk permissions synced.",
      moduleId: result.module.id,
      permissionCodes: result.permissionCodes,
    });
  } catch (error) {
    console.error("Customer Helpdesk permission sync error:", error);
    return sendErrorResponse(res, 500, "Failed to sync Customer Helpdesk permissions.");
  }
};

exports.getTenantTickets = async (req, res) => {
  const org_id = Number(req.user?.org_id);

  if (!org_id) {
    return sendErrorResponse(res, 400, "Organization could not be resolved.");
  }

  try {
    const tickets = await CustomerHelpdeskTicket.findAll({
      where: {
        org_id,
        ticketScope: TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT,
      },
      order: [["id", "DESC"]],
    });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Customer Helpdesk tickets error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch Customer Helpdesk tickets.");
  }
};

exports.createPortalInvitation = async (req, res) => {
  const org_id = Number(req.user?.org_id);
  const {
    customer_id,
    contact_id,
    email,
    name,
    mobile,
    isCustomerAccountAdmin = false,
  } = req.body;

  if (!org_id || !customer_id) {
    return sendErrorResponse(res, 400, "Organization and customer are required.");
  }

  try {
    const org = await Register.findByPk(org_id, {
      attributes: ["id", "company", "accountActivity", "paymentStatus", "packageId"],
    });
    if (!isOrganizationActive(org)) {
      return sendErrorResponse(res, 403, "Organization account is not active.");
    }

    const customer = await Customer.findOne({ where: { id: customer_id, org_id } });
    if (!customer) {
      return sendErrorResponse(res, 404, "Customer record not found.");
    }

    let contact = null;
    if (contact_id) {
      contact = await CustomerContact.findOne({
        where: { id: contact_id, org_id, customer_id },
      });
      if (!contact) {
        return sendErrorResponse(res, 404, "Customer contact record not found.");
      }
    }

    const inviteEmail = String(email || contact?.email || customer.email || "")
      .trim()
      .toLowerCase();
    const inviteName = name || fullName(contact) || fullName(customer) || inviteEmail;
    const inviteMobile = mobile || contact?.mobile || customer.mobile || null;

    if (!inviteEmail) {
      return sendErrorResponse(res, 400, "An invitation email is required.");
    }

    const result = await db.sequelize.transaction(async (transaction) => {
      const portal = await ensureCustomerPortal(org, transaction);
      const [portalUser] = await CustomerPortalUser.findOrCreate({
        where: { org_id, email: inviteEmail },
        defaults: {
          org_id,
          customer_id,
          contact_id: contact_id || null,
          name: inviteName,
          email: inviteEmail,
          mobile: inviteMobile,
          portalStatus: "invited",
          activationStatus: "pending",
          invitedBy: req.user.id,
          isCustomerAccountAdmin,
        },
        transaction,
      });

      if (portalUser.portalStatus === "disabled") {
        throw Object.assign(new Error("Portal user is disabled."), { statusCode: 409 });
      }

      await portalUser.update(
        {
          customer_id,
          contact_id: contact_id || null,
          name: inviteName,
          mobile: inviteMobile,
          portalStatus: portalUser.portalStatus === "active" ? "active" : "invited",
          activationStatus:
            portalUser.activationStatus === "activated" ? "activated" : "pending",
          invitedBy: req.user.id,
          isCustomerAccountAdmin,
        },
        { transaction }
      );

      await CustomerPortalInvitation.update(
        { status: "revoked" },
        {
          where: {
            org_id,
            portalUserId: portalUser.id,
            status: "pending",
          },
          transaction,
        }
      );

      const token = crypto.randomBytes(32).toString("hex");
      const invitation = await CustomerPortalInvitation.create(
        {
          org_id,
          portalUserId: portalUser.id,
          token,
          email: inviteEmail,
          status: "pending",
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          invitedBy: req.user.id,
        },
        { transaction }
      );

      return { portal, portalUser, invitation };
    });

    const activationUrl = `${getPortalBaseUrl(result.portal)}/activate?email=${encodeURIComponent(
      inviteEmail
    )}&token=${encodeURIComponent(result.invitation.token)}`;

    await sendPortalInvitationEmail({
      to: inviteEmail,
      toName: inviteName,
      organizationName: org.company,
      activationUrl,
    });

    return res.status(201).json({
      message: "Customer portal invitation sent.",
      portal: {
        publicKey: result.portal.publicKey,
        portalSlug: result.portal.portalSlug,
      },
      portalUser: buildPortalUserPayload(result.portalUser),
      activationUrl,
      expiresAt: result.invitation.expiresAt,
    });
  } catch (error) {
    if (error.statusCode) {
      return sendErrorResponse(res, error.statusCode, error.message);
    }
    console.error("Customer portal invitation error:", error);
    return sendErrorResponse(res, 500, "Failed to create customer portal invitation.");
  }
};

exports.activatePortalAccount = async (req, res) => {
  const { organizationKey } = req.params;
  const { email, token, password, confirmPassword } = req.body;

  if (!email || !token || !password) {
    return sendErrorResponse(res, 400, "Email, token and password are required.");
  }
  if (confirmPassword && password !== confirmPassword) {
    return sendErrorResponse(res, 400, "Passwords do not match.");
  }
  if (String(password).length < 8) {
    return sendErrorResponse(res, 400, "Password must be at least 8 characters.");
  }

  try {
    const portal = await findPortalByKey(organizationKey);
    const accessError = await assertPublicPortalAccess(portal);
    if (accessError) {
      return sendErrorResponse(res, 403, accessError);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const invitation = await CustomerPortalInvitation.findOne({
      where: {
        org_id: portal.org_id,
        email: normalizedEmail,
        token,
        status: "pending",
      },
    });

    if (!invitation || new Date(invitation.expiresAt) < new Date()) {
      return sendErrorResponse(res, 400, "Invitation token is invalid or expired.");
    }

    const portalUser = await CustomerPortalUser.findOne({
      where: {
        id: invitation.portalUserId,
        org_id: portal.org_id,
        email: normalizedEmail,
      },
    });
    if (!portalUser || portalUser.portalStatus === "disabled") {
      return sendErrorResponse(res, 403, "Portal user is not available.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.sequelize.transaction(async (transaction) => {
      await portalUser.update(
        {
          password: hashedPassword,
          portalStatus: "active",
          activationStatus: "activated",
          emailVerifiedAt: portalUser.emailVerifiedAt || new Date(),
          resetToken: null,
          resetTokenExpiresAt: null,
        },
        { transaction }
      );
      await invitation.update(
        { status: "accepted", acceptedAt: new Date() },
        { transaction }
      );
    });

    return res.status(200).json({ message: "Customer portal account activated." });
  } catch (error) {
    console.error("Customer portal activation error:", error);
    return sendErrorResponse(res, 500, "Failed to activate customer portal account.");
  }
};

exports.getPortalBranding = async (req, res) => {
  const { organizationKey } = req.params;

  try {
    const portal = await findPortalByKey(organizationKey);
    const accessError = await assertPublicPortalAccess(portal);
    if (accessError) {
      return sendErrorResponse(res, 404, "Support portal not found.");
    }

    const branding = await getPortalBrandingPayload(portal);
    return res.json({ branding });
  } catch (error) {
    console.error("Customer portal branding error:", error);
    return sendErrorResponse(res, 500, "Failed to load customer portal branding.");
  }
};

exports.loginPortalUser = async (req, res) => {
  const { organizationKey } = req.params;
  const { email, password } = req.body;

  if (!email || !password) {
    return sendErrorResponse(res, 400, "Email and password are required.");
  }

  try {
    const portal = await findPortalByKey(organizationKey);
    const accessError = await assertPublicPortalAccess(portal);
    if (accessError) {
      return sendErrorResponse(res, 403, accessError);
    }

    const portalUser = await CustomerPortalUser.findOne({
      where: {
        org_id: portal.org_id,
        email: String(email).trim().toLowerCase(),
        portalStatus: "active",
        activationStatus: "activated",
      },
    });

    if (!portalUser?.password) {
      return sendErrorResponse(res, 401, "Invalid portal credentials.");
    }

    const isMatch = await bcrypt.compare(password, portalUser.password);
    if (!isMatch) {
      return sendErrorResponse(res, 401, "Invalid portal credentials.");
    }

    await portalUser.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      {
        user_type: "customer_portal",
        portal_user_id: portalUser.id,
        id: portalUser.id,
        org_id: portalUser.org_id,
        customer_id: portalUser.customer_id,
        contact_id: portalUser.contact_id,
        email: portalUser.email,
        name: portalUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.status(200).json({
      message: "Customer portal login successful.",
      token,
      user: buildPortalUserPayload(portalUser),
      portal: {
        publicKey: portal.publicKey,
        portalSlug: portal.portalSlug,
        organizationName: portal.organization.company,
      },
    });
  } catch (error) {
    console.error("Customer portal login error:", error);
    return sendErrorResponse(res, 500, "Failed to login customer portal user.");
  }
};

exports.forgotPortalPassword = async (req, res) => {
  const { organizationKey } = req.params;
  const { email } = req.body;
  const genericResponse = {
    message: "If the portal account exists, a reset link has been sent.",
  };

  if (!email) {
    return sendErrorResponse(res, 400, "Email is required.");
  }

  try {
    const portal = await findPortalByKey(organizationKey);
    const accessError = await assertPublicPortalAccess(portal);
    if (accessError) {
      return sendErrorResponse(res, 403, accessError);
    }

    const portalUser = await CustomerPortalUser.findOne({
      where: {
        org_id: portal.org_id,
        email: String(email).trim().toLowerCase(),
        portalStatus: "active",
        activationStatus: "activated",
      },
    });

    if (!portalUser) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await portalUser.update({
      resetToken,
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetUrl = `${getPortalBaseUrl(portal)}/reset-password?email=${encodeURIComponent(
      portalUser.email
    )}&token=${encodeURIComponent(resetToken)}`;
    await sendPortalResetEmail({
      to: portalUser.email,
      toName: portalUser.name,
      organizationName: portal.organization.company,
      resetUrl,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Customer portal forgot password error:", error);
    return sendErrorResponse(res, 500, "Failed to process customer portal password reset.");
  }
};

exports.resetPortalPassword = async (req, res) => {
  const { organizationKey } = req.params;
  const { email, token, password, confirmPassword } = req.body;

  if (!email || !token || !password) {
    return sendErrorResponse(res, 400, "Email, token and password are required.");
  }
  if (confirmPassword && password !== confirmPassword) {
    return sendErrorResponse(res, 400, "Passwords do not match.");
  }
  if (String(password).length < 8) {
    return sendErrorResponse(res, 400, "Password must be at least 8 characters.");
  }

  try {
    const portal = await findPortalByKey(organizationKey);
    const accessError = await assertPublicPortalAccess(portal);
    if (accessError) {
      return sendErrorResponse(res, 403, accessError);
    }

    const portalUser = await CustomerPortalUser.findOne({
      where: {
        org_id: portal.org_id,
        email: String(email).trim().toLowerCase(),
        resetToken: token,
      },
    });

    if (!portalUser || new Date(portalUser.resetTokenExpiresAt) < new Date()) {
      return sendErrorResponse(res, 400, "Reset token is invalid or expired.");
    }

    await portalUser.update({
      password: await bcrypt.hash(password, 10),
      resetToken: null,
      resetTokenExpiresAt: null,
      portalStatus: "active",
      activationStatus: "activated",
    });

    return res.status(200).json({ message: "Customer portal password reset." });
  } catch (error) {
    console.error("Customer portal reset password error:", error);
    return sendErrorResponse(res, 500, "Failed to reset customer portal password.");
  }
};

exports.getPortalMe = async (req, res) => {
  try {
    const { portalUser, portal, accessError, error } = await getPortalSessionContext(req);
    if (error) {
      return sendErrorResponse(res, 404, error);
    }
    if (accessError) {
      return sendErrorResponse(res, 403, accessError);
    }

    return res.status(200).json({
      user: buildPortalUserPayload(portalUser),
      customer: portalUser.customer,
      contact: portalUser.contact,
      portal: buildPortalBranding(portal),
    });
  } catch (error) {
    console.error("Customer portal me error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch customer portal user.");
  }
};

exports.getPortalDashboard = async (req, res) => {
  try {
    const { portalUser, portal, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const tickets = await CustomerHelpdeskTicket.findAll({
      where: portalTicketWhere(portalUser),
      order: [["updatedAt", "DESC"]],
      limit: 5,
    });
    const allTickets = await CustomerHelpdeskTicket.findAll({
      where: portalTicketWhere(portalUser),
      attributes: ["status"],
    });

    const counts = allTickets.reduce(
      (acc, ticket) => {
        const normalizedStatus = String(ticket.status || "").toLowerCase();
        acc.total += 1;
        if (["closed", "resolved"].includes(normalizedStatus)) acc.closed += 1;
        else if (["waiting_customer", "waiting customer"].includes(normalizedStatus)) acc.waiting += 1;
        else acc.open += 1;
        return acc;
      },
      { total: 0, open: 0, waiting: 0, closed: 0 }
    );

    return res.status(200).json({
      portal: buildPortalBranding(portal),
      user: buildPortalUserPayload(portalUser),
      counts,
      recentTickets: tickets.map(formatTicket),
    });
  } catch (error) {
    console.error("Customer portal dashboard error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch customer portal dashboard.");
  }
};

exports.listPortalTickets = async (req, res) => {
  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const where = portalTicketWhere(portalUser);
    if (req.query.status) {
      where.status = req.query.status;
    }

    const tickets = await CustomerHelpdeskTicket.findAll({
      where,
      include: [
        {
          model: CustomerHelpdeskTicketAttachment,
          as: "attachments",
          required: false,
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json(tickets.map(formatTicket));
  } catch (error) {
    console.error("Customer portal ticket list error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch portal tickets.");
  }
};

exports.createPortalTicket = async (req, res) => {
  const { subject, description, priority, category } = req.body;

  if (!subject || !description) {
    return sendErrorResponse(res, 400, "Subject and description are required.");
  }

  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const automation = await applySlaAndAssignment({
      org_id: portalUser.org_id,
      priority: priority || "Medium",
      category: category || null,
    });
    const suggestions = await findKnowledgeSuggestions({
      org_id: portalUser.org_id,
      query: `${subject} ${description}`,
      limit: 3,
    });

    const ticket = await db.sequelize.transaction(async (transaction) => {
      const createdTicket = await CustomerHelpdeskTicket.create(
        {
          org_id: portalUser.org_id,
          ticketScope: TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT,
          publicReference: buildPublicReference(),
          customer_id: portalUser.customer_id,
          contact_id: portalUser.contact_id,
          requesterPortalUserId: portalUser.id,
          source: "customer_portal",
          subject,
          description,
          status: automation.status,
          priority: priority || "Medium",
          category: category || null,
          supportTeamId: automation.supportTeamId,
          assignedTo: automation.assignedTo,
          slaPolicyId: automation.slaPolicyId,
          firstResponseDueAt: automation.firstResponseDueAt,
          resolutionDueAt: automation.resolutionDueAt,
          deflectedByArticleIds: suggestions.map((article) => article.id),
        },
        { transaction }
      );

      const attachmentRows = mapUploadedFiles({
        files: req.files || [],
        ticketId: createdTicket.id,
        org_id: portalUser.org_id,
        portalUserId: portalUser.id,
      });
      if (attachmentRows.length) {
        await CustomerHelpdeskTicketAttachment.bulkCreate(attachmentRows, {
          transaction,
        });
      }
      return createdTicket;
    });

    const created = await CustomerHelpdeskTicket.findByPk(ticket.id, {
      include: [{ model: CustomerHelpdeskTicketAttachment, as: "attachments" }],
    });

    await notifyAgentUsers({
      org_id: portalUser.org_id,
      assignedTo: automation.assignedTo,
      type: "customer_helpdesk_ticket_created",
      title: "New customer helpdesk ticket",
      message: `${portalUser.name} created ${created.publicReference}.`,
      ticket: created,
    });
    await sendPortalTicketEmail({
      portalUser,
      subject: `Ticket received: ${created.publicReference}`,
      htmlContent: `<p>Hello ${portalUser.name},</p><p>Your support ticket <strong>${created.publicReference}</strong> has been received.</p>`,
    });
    await recordAudit({
      req,
      org_id: portalUser.org_id,
      ticketId: created.id,
      action: "ticket.created",
      entityType: "ticket",
      entityId: created.id,
      metadata: { publicReference: created.publicReference, suggestions: suggestions.map((article) => article.id) },
    });

    return res.status(201).json({
      message: "Support ticket created.",
      ticket: formatTicket(created),
      suggestions,
    });
  } catch (error) {
    console.error("Customer portal ticket create error:", error);
    return sendErrorResponse(res, 500, "Failed to create portal ticket.");
  }
};

exports.getPortalTicketDetails = async (req, res) => {
  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere(portalUser, { id: req.params.ticketId }),
      include: [
        {
          model: CustomerHelpdeskTicketAttachment,
          as: "attachments",
          required: false,
          where: { replyId: null },
        },
        {
          model: CustomerHelpdeskTicketReply,
          as: "replies",
          required: false,
          where: { visibility: "public" },
          include: [
            { model: CustomerPortalUser, as: "portalUser", required: false },
            { model: CustomerHelpdeskTicketAttachment, as: "attachments", required: false },
          ],
        },
      ],
      order: [[{ model: CustomerHelpdeskTicketReply, as: "replies" }, "createdAt", "ASC"]],
    });

    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    return res.status(200).json(formatTicket(ticket));
  } catch (error) {
    console.error("Customer portal ticket detail error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch portal ticket.");
  }
};

exports.addPortalTicketReply = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return sendErrorResponse(res, 400, "Reply message is required.");
  }

  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere(portalUser, { id: req.params.ticketId }),
    });
    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }
    if (["Closed", "Resolved"].includes(ticket.status)) {
      return sendErrorResponse(res, 400, "Closed tickets cannot accept replies.");
    }

    const reply = await db.sequelize.transaction(async (transaction) => {
      const createdReply = await CustomerHelpdeskTicketReply.create(
        {
          org_id: portalUser.org_id,
          ticketId: ticket.id,
          authorType: "customer_portal",
          visibility: "public",
          portalUserId: portalUser.id,
          message,
        },
        { transaction }
      );

      const attachmentRows = mapUploadedFiles({
        files: req.files || [],
        ticketId: ticket.id,
        replyId: createdReply.id,
        org_id: portalUser.org_id,
        portalUserId: portalUser.id,
      });
      if (attachmentRows.length) {
        await CustomerHelpdeskTicketAttachment.bulkCreate(attachmentRows, {
          transaction,
        });
      }

      await ticket.update({ status: "Customer Replied" }, { transaction });
      return createdReply;
    });

    await notifyAgentUsers({
      org_id: portalUser.org_id,
      assignedTo: ticket.assignedTo || [],
      type: "customer_helpdesk_ticket_replied",
      title: "Customer replied to ticket",
      message: `${portalUser.name} replied on ${ticket.publicReference}.`,
      ticket,
    });
    await recordAudit({
      req,
      org_id: portalUser.org_id,
      ticketId: ticket.id,
      action: "ticket.customer_replied",
      entityType: "ticketReply",
      entityId: reply.id,
      metadata: { visibility: "public" },
    });

    return res.status(201).json({
      message: "Reply added.",
      reply,
    });
  } catch (error) {
    console.error("Customer portal reply error:", error);
    return sendErrorResponse(res, 500, "Failed to add portal ticket reply.");
  }
};

exports.updatePortalTicketStatus = async (req, res) => {
  const allowedStatuses = ["Closed", "Resolved"];
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return sendErrorResponse(res, 400, "Only Closed or Resolved status can be set from the customer portal.");
  }

  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere(portalUser, { id: req.params.ticketId }),
    });
    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    await ticket.update({
      status,
      closedAt: status === "Closed" ? new Date() : ticket.closedAt,
    });
    await recordAudit({
      req,
      org_id: portalUser.org_id,
      ticketId: ticket.id,
      action: "ticket.customer_status_updated",
      entityType: "ticket",
      entityId: ticket.id,
      metadata: { status },
    });

    return res.status(200).json({
      message: "Ticket status updated.",
      ticket: formatTicket(ticket),
    });
  } catch (error) {
    console.error("Customer portal status update error:", error);
    return sendErrorResponse(res, 500, "Failed to update portal ticket status.");
  }
};

exports.updatePortalProfile = async (req, res) => {
  const { name, mobile } = req.body;

  try {
    const { portalUser, portal, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    await portalUser.update({
      ...(name && { name }),
      ...(mobile !== undefined && { mobile }),
    });

    return res.status(200).json({
      message: "Portal profile updated.",
      user: buildPortalUserPayload(portalUser),
      portal: buildPortalBranding(portal),
    });
  } catch (error) {
    console.error("Customer portal profile update error:", error);
    return sendErrorResponse(res, 500, "Failed to update portal profile.");
  }
};

const getAgentOrgId = (req) => Number(req.user?.org_id);

const getAgentTicketInclude = () => [
  { model: Customer, as: "customer", required: false },
  { model: CustomerContact, as: "contact", required: false },
  { model: CustomerPortalUser, as: "requester", required: false },
  { model: CustomerHelpdeskTeam, as: "supportTeam", required: false },
  { model: CustomerHelpdeskTicketAttachment, as: "attachments", required: false },
  {
    model: CustomerHelpdeskTicketReply,
    as: "replies",
    required: false,
    include: [
      { model: CustomerPortalUser, as: "portalUser", required: false },
      { model: db.users, as: "employeeUser", required: false },
      { model: CustomerHelpdeskTicketAttachment, as: "attachments", required: false },
    ],
  },
];

exports.getAgentWorkspace = async (req, res) => {
  const org_id = getAgentOrgId(req);

  try {
    const tickets = await CustomerHelpdeskTicket.findAll({
      where: portalTicketWhere({ org_id }),
      attributes: ["id", "status", "priority", "supportTeamId"],
    });

    const counts = tickets.reduce(
      (acc, ticket) => {
        const status = String(ticket.status || "New");
        acc.total += 1;
        acc.byStatus[status] = (acc.byStatus[status] || 0) + 1;
        if (ticket.assignedTo?.length) acc.assigned += 1;
        else acc.unassigned += 1;
        if (String(ticket.priority).toLowerCase() === "urgent") acc.urgent += 1;
        return acc;
      },
      { total: 0, assigned: 0, unassigned: 0, urgent: 0, byStatus: {} }
    );

    const recentTickets = await CustomerHelpdeskTicket.findAll({
      where: portalTicketWhere({ org_id }),
      include: [
        { model: Customer, as: "customer", required: false },
        { model: CustomerHelpdeskTeam, as: "supportTeam", required: false },
      ],
      order: [["updatedAt", "DESC"]],
      limit: 10,
    });

    return res.status(200).json({
      counts,
      recentTickets: recentTickets.map(formatTicket),
    });
  } catch (error) {
    console.error("Agent workspace error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch agent workspace.");
  }
};

exports.listAgentTickets = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const where = portalTicketWhere({ org_id });

  if (req.query.status) where.status = req.query.status;
  if (req.query.priority) where.priority = req.query.priority;
  if (req.query.teamId) where.supportTeamId = Number(req.query.teamId);
  if (req.query.unassigned === "true") where.assignedTo = null;

  try {
    const tickets = await CustomerHelpdeskTicket.findAll({
      where,
      include: [
        { model: Customer, as: "customer", required: false },
        { model: CustomerContact, as: "contact", required: false },
        { model: CustomerHelpdeskTeam, as: "supportTeam", required: false },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json(tickets.map(formatTicket));
  } catch (error) {
    console.error("Agent ticket list error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch customer helpdesk tickets.");
  }
};

exports.getAgentTicketDetails = async (req, res) => {
  const org_id = getAgentOrgId(req);

  try {
    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere({ org_id }, { id: req.params.ticketId }),
      include: getAgentTicketInclude(),
      order: [[{ model: CustomerHelpdeskTicketReply, as: "replies" }, "createdAt", "ASC"]],
    });

    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    return res.status(200).json(formatAgentTicket(ticket));
  } catch (error) {
    console.error("Agent ticket detail error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch ticket details.");
  }
};

const createAgentReply = async (req, res, visibility) => {
  const org_id = getAgentOrgId(req);
  const { message } = req.body;

  if (!message) {
    return sendErrorResponse(res, 400, "Message is required.");
  }

  try {
    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere({ org_id }, { id: req.params.ticketId }),
    });
    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    const reply = await db.sequelize.transaction(async (transaction) => {
      const createdReply = await CustomerHelpdeskTicketReply.create(
        {
          org_id,
          ticketId: ticket.id,
          authorType: "employee",
          visibility,
          user_id: req.user.id,
          message,
        },
        { transaction }
      );

      const attachmentRows = mapUploadedFiles({
        files: req.files || [],
        ticketId: ticket.id,
        replyId: createdReply.id,
        org_id,
        portalUserId: null,
      }).map((row) => ({
        ...row,
        uploadedByType: "employee",
        uploadedByPortalUserId: null,
        uploadedByUserId: req.user.id,
      }));

      if (attachmentRows.length) {
        await CustomerHelpdeskTicketAttachment.bulkCreate(attachmentRows, {
          transaction,
        });
      }

      await ticket.update(
        {
          status: visibility === "public" ? "Support Replied" : ticket.status,
          firstResponseAt:
            visibility === "public" && !ticket.firstResponseAt
              ? new Date()
              : ticket.firstResponseAt,
        },
        { transaction }
      );
      return createdReply;
    });

    if (visibility === "public") {
      const portalUser = await CustomerPortalUser.findByPk(ticket.requesterPortalUserId);
      await sendPortalTicketEmail({
        portalUser,
        subject: `Support replied: ${ticket.publicReference}`,
        htmlContent: `<p>Hello ${portalUser?.name || "there"},</p><p>Your support ticket <strong>${ticket.publicReference}</strong> has a new reply.</p>`,
      });
    }
    await recordAudit({
      req,
      org_id,
      ticketId: ticket.id,
      action: visibility === "internal" ? "ticket.internal_note_added" : "ticket.agent_replied",
      entityType: "ticketReply",
      entityId: reply.id,
      metadata: { visibility },
    });

    return res.status(201).json({
      message: visibility === "internal" ? "Internal note added." : "Public reply added.",
      reply,
    });
  } catch (error) {
    console.error("Agent reply error:", error);
    return sendErrorResponse(res, 500, "Failed to add ticket reply.");
  }
};

exports.addAgentPublicReply = (req, res) => createAgentReply(req, res, "public");
exports.addAgentInternalNote = (req, res) => createAgentReply(req, res, "internal");

exports.assignAgentTicket = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { employeeIds = [], supportTeamId = null } = req.body;

  try {
    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere({ org_id }, { id: req.params.ticketId }),
    });
    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    let supportTeam = null;
    if (supportTeamId) {
      supportTeam = await CustomerHelpdeskTeam.findOne({
        where: { id: supportTeamId, org_id, isActive: true },
      });
      if (!supportTeam) {
        return sendErrorResponse(res, 404, "Support team not found.");
      }
    }

    const employees = employeeIds.length
      ? await Employee.findAll({
          where: { id: employeeIds, org_id, isDeleted: false },
          attributes: ["id", "user_id", "firstName", "lastName", "email"],
        })
      : [];

    if (employeeIds.length && employees.length !== employeeIds.length) {
      return sendErrorResponse(res, 400, "One or more assigned employees are invalid.");
    }

    await ticket.update({
      assignedTo: employees.map((employee) => ({
        employeeId: employee.id,
        user_id: employee.user_id,
        name: fullName(employee),
        email: employee.email,
      })),
      supportTeamId: supportTeam?.id || null,
      status: ticket.status === "New" ? "Assigned" : ticket.status,
    });

    await notifyAgentUsers({
      org_id,
      assignedTo: ticket.assignedTo || [],
      type: "customer_helpdesk_ticket_assigned",
      title: "Customer helpdesk ticket assigned",
      message: `${ticket.publicReference} assignment was updated.`,
      ticket,
    });
    await recordAudit({
      req,
      org_id,
      ticketId: ticket.id,
      action: "ticket.assigned",
      entityType: "ticket",
      entityId: ticket.id,
      metadata: { assignedTo: ticket.assignedTo, supportTeamId: ticket.supportTeamId },
    });

    return res.status(200).json({
      message: "Ticket assignment updated.",
      ticket: formatTicket(ticket),
    });
  } catch (error) {
    console.error("Agent assignment error:", error);
    return sendErrorResponse(res, 500, "Failed to assign ticket.");
  }
};

exports.updateAgentTicket = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { status, priority, category } = req.body;

  try {
    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere({ org_id }, { id: req.params.ticketId }),
    });
    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    await ticket.update({
      ...(status && { status, closedAt: status === "Closed" ? new Date() : ticket.closedAt }),
      ...(priority && { priority }),
      ...(category !== undefined && { category }),
    });

    await notifyAgentUsers({
      org_id,
      assignedTo: ticket.assignedTo || [],
      type: "customer_helpdesk_ticket_updated",
      title: "Customer helpdesk ticket updated",
      message: `${ticket.publicReference} was updated.`,
      ticket,
    });
    await recordAudit({
      req,
      org_id,
      ticketId: ticket.id,
      action: "ticket.updated",
      entityType: "ticket",
      entityId: ticket.id,
      metadata: { status, priority, category },
    });

    return res.status(200).json({
      message: "Ticket updated.",
      ticket: formatTicket(ticket),
    });
  } catch (error) {
    console.error("Agent ticket update error:", error);
    return sendErrorResponse(res, 500, "Failed to update ticket.");
  }
};

exports.getAgentResources = async (req, res) => {
  const org_id = getAgentOrgId(req);

  try {
    const [
      employees,
      teams,
      categories,
      priorities,
      slaPolicies,
      assignmentRules,
      knowledgeArticles,
      portalUsers,
      customers,
    ] =
      await Promise.all([
        Employee.findAll({
          where: { org_id, isDeleted: false },
          attributes: ["id", "user_id", "firstName", "lastName", "email", "mobile"],
          order: [["firstName", "ASC"]],
        }),
        CustomerHelpdeskTeam.findAll({
          where: { org_id },
          include: [{ model: CustomerHelpdeskTeamMember, as: "members", required: false }],
          order: [["name", "ASC"]],
        }),
        CustomerHelpdeskCategory.findAll({
          where: { org_id },
          order: [["name", "ASC"]],
        }),
        CustomerHelpdeskPriority.findAll({
          where: { org_id },
          order: [["sortOrder", "ASC"], ["name", "ASC"]],
        }),
        CustomerHelpdeskSlaPolicy.findAll({
          where: { org_id },
          order: [["isDefault", "DESC"], ["name", "ASC"]],
        }),
        CustomerHelpdeskAssignmentRule.findAll({
          where: { org_id },
          order: [["priority", "DESC"], ["name", "ASC"]],
        }),
        CustomerHelpdeskKnowledgeArticle.findAll({
          where: { org_id },
          order: [["updatedAt", "DESC"]],
        }),
        CustomerPortalUser.findAll({
          where: { org_id },
          attributes: ["id", "customer_id", "contact_id", "name", "email", "mobile", "portalStatus", "activationStatus"],
          order: [["name", "ASC"]],
        }),
        Customer.findAll({
          where: { org_id },
          attributes: ["id", "firstName", "lastName", "companyName", "email", "mobile"],
          order: [["companyName", "ASC"], ["firstName", "ASC"]],
        }),
      ]);

    return res.status(200).json({
      employees,
      teams,
      categories,
      priorities,
      slaPolicies,
      assignmentRules,
      knowledgeArticles,
      portalUsers,
      customers,
    });
  } catch (error) {
    console.error("Agent resource error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch agent resources.");
  }
};

exports.upsertAgentCategory = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { id, name, description, isActive = true } = req.body;

  if (!name) return sendErrorResponse(res, 400, "Category name is required.");

  try {
    const category = id
      ? await CustomerHelpdeskCategory.findOne({ where: { id, org_id } })
      : await CustomerHelpdeskCategory.create({ org_id, name, description, isActive });
    if (!category) return sendErrorResponse(res, 404, "Category not found.");
    if (id) await category.update({ name, description, isActive });
    await recordAudit({ req, org_id, action: id ? "category.updated" : "category.created", entityType: "category", entityId: category.id });
    return res.status(200).json({ message: "Category saved.", category });
  } catch (error) {
    console.error("Category save error:", error);
    return sendErrorResponse(res, 500, "Failed to save category.");
  }
};

exports.upsertAgentPriority = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { id, name, color = "#64748b", sortOrder = 0, isActive = true } = req.body;

  if (!name) return sendErrorResponse(res, 400, "Priority name is required.");

  try {
    const priorityRecord = id
      ? await CustomerHelpdeskPriority.findOne({ where: { id, org_id } })
      : await CustomerHelpdeskPriority.create({ org_id, name, color, sortOrder, isActive });
    if (!priorityRecord) return sendErrorResponse(res, 404, "Priority not found.");
    if (id) await priorityRecord.update({ name, color, sortOrder, isActive });
    await recordAudit({ req, org_id, action: id ? "priority.updated" : "priority.created", entityType: "priority", entityId: priorityRecord.id });
    return res.status(200).json({ message: "Priority saved.", priority: priorityRecord });
  } catch (error) {
    console.error("Priority save error:", error);
    return sendErrorResponse(res, 500, "Failed to save priority.");
  }
};

exports.upsertAgentTeam = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { id, name, description, memberEmployeeIds = [], leadEmployeeId = null, isActive = true } = req.body;

  if (!name) return sendErrorResponse(res, 400, "Team name is required.");

  try {
    const team = await db.sequelize.transaction(async (transaction) => {
      const record = id
        ? await CustomerHelpdeskTeam.findOne({ where: { id, org_id }, transaction })
        : await CustomerHelpdeskTeam.create({ org_id, name, description, isActive }, { transaction });
      if (!record) throw Object.assign(new Error("Support team not found."), { statusCode: 404 });
      if (id) await record.update({ name, description, isActive }, { transaction });

      await CustomerHelpdeskTeamMember.destroy({
        where: { org_id, teamId: record.id },
        transaction,
      });

      if (memberEmployeeIds.length) {
        const employees = await Employee.findAll({
          where: { org_id, id: memberEmployeeIds, isDeleted: false },
          transaction,
        });
        const rows = employees.map((employee) => ({
          org_id,
          teamId: record.id,
          employeeId: employee.id,
          user_id: employee.user_id,
          isLead: Number(leadEmployeeId) === Number(employee.id),
        }));
        if (rows.length) {
          await CustomerHelpdeskTeamMember.bulkCreate(rows, { transaction });
        }
      }

      return record;
    });

    await recordAudit({ req, org_id, action: id ? "team.updated" : "team.created", entityType: "team", entityId: team.id });
    return res.status(200).json({ message: "Support team saved.", team });
  } catch (error) {
    if (error.statusCode) return sendErrorResponse(res, error.statusCode, error.message);
    console.error("Team save error:", error);
    return sendErrorResponse(res, 500, "Failed to save support team.");
  }
};

exports.upsertAgentSlaPolicy = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const {
    id,
    name,
    priority = null,
    category = null,
    firstResponseMinutes = 240,
    resolutionMinutes = 1440,
    escalationMinutes = 720,
    escalationTeamId = null,
    isDefault = false,
    isActive = true,
  } = req.body;

  if (!name) return sendErrorResponse(res, 400, "SLA policy name is required.");

  try {
    const policy = id
      ? await CustomerHelpdeskSlaPolicy.findOne({ where: { id, org_id } })
      : await CustomerHelpdeskSlaPolicy.create({ org_id, name });
    if (!policy) return sendErrorResponse(res, 404, "SLA policy not found.");

    if (isDefault) {
      await CustomerHelpdeskSlaPolicy.update(
        { isDefault: false },
        { where: { org_id } }
      );
    }

    await policy.update({
      name,
      priority,
      category,
      firstResponseMinutes,
      resolutionMinutes,
      escalationMinutes,
      escalationTeamId,
      isDefault,
      isActive,
    });

    await recordAudit({ req, org_id, action: id ? "sla_policy.updated" : "sla_policy.created", entityType: "slaPolicy", entityId: policy.id });
    return res.status(200).json({ message: "SLA policy saved.", policy });
  } catch (error) {
    console.error("SLA policy save error:", error);
    return sendErrorResponse(res, 500, "Failed to save SLA policy.");
  }
};

exports.upsertAgentAssignmentRule = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const {
    id,
    name,
    conditions = {},
    supportTeamId = null,
    assignEmployeeIds = [],
    priority = 0,
    isActive = true,
  } = req.body;

  if (!name) return sendErrorResponse(res, 400, "Assignment rule name is required.");

  try {
    const rule = id
      ? await CustomerHelpdeskAssignmentRule.findOne({ where: { id, org_id } })
      : await CustomerHelpdeskAssignmentRule.create({ org_id, name });
    if (!rule) return sendErrorResponse(res, 404, "Assignment rule not found.");
    await rule.update({
      name,
      conditions,
      supportTeamId,
      assignEmployeeIds,
      priority,
      isActive,
    });

    await recordAudit({ req, org_id, action: id ? "assignment_rule.updated" : "assignment_rule.created", entityType: "assignmentRule", entityId: rule.id });
    return res.status(200).json({ message: "Assignment rule saved.", rule });
  } catch (error) {
    console.error("Assignment rule save error:", error);
    return sendErrorResponse(res, 500, "Failed to save assignment rule.");
  }
};

exports.upsertKnowledgeArticle = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const {
    id,
    title,
    summary = null,
    content,
    category = null,
    keywords = [],
    isPublished = true,
  } = req.body;

  if (!title || !content) {
    return sendErrorResponse(res, 400, "Article title and content are required.");
  }

  try {
    const article = id
      ? await CustomerHelpdeskKnowledgeArticle.findOne({ where: { id, org_id } })
      : await CustomerHelpdeskKnowledgeArticle.create({ org_id, title, content });
    if (!article) return sendErrorResponse(res, 404, "Knowledge article not found.");
    await article.update({
      title,
      summary,
      content,
      category,
      keywords,
      isPublished,
    });

    await recordAudit({ req, org_id, action: id ? "knowledge_article.updated" : "knowledge_article.created", entityType: "knowledgeArticle", entityId: article.id });
    return res.status(200).json({ message: "Knowledge article saved.", article });
  } catch (error) {
    console.error("Knowledge article save error:", error);
    return sendErrorResponse(res, 500, "Failed to save knowledge article.");
  }
};

exports.getPortalKnowledgeSuggestions = async (req, res) => {
  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const suggestions = await findKnowledgeSuggestions({
      org_id: portalUser.org_id,
      query: `${req.query.subject || ""} ${req.query.description || ""}`,
      limit: 5,
    });

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Knowledge suggestion error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch knowledge suggestions.");
  }
};

exports.markKnowledgeArticleDeflected = async (req, res) => {
  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const article = await CustomerHelpdeskKnowledgeArticle.findOne({
      where: {
        id: req.params.articleId,
        org_id: portalUser.org_id,
        isPublished: true,
      },
    });
    if (!article) return sendErrorResponse(res, 404, "Article not found.");

    await article.increment("deflectionCount");
    await recordAudit({
      req,
      org_id: portalUser.org_id,
      action: "knowledge_article.deflected",
      entityType: "knowledgeArticle",
      entityId: article.id,
      metadata: { title: article.title },
    });
    return res.status(200).json({ message: "Deflection recorded." });
  } catch (error) {
    console.error("Knowledge deflection error:", error);
    return sendErrorResponse(res, 500, "Failed to record deflection.");
  }
};

exports.submitPortalSatisfaction = async (req, res) => {
  const { rating, comment = null } = req.body;
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return sendErrorResponse(res, 400, "Rating must be between 1 and 5.");
  }

  try {
    const { portalUser, accessError, error } = await getPortalSessionContext(req);
    if (error) return sendErrorResponse(res, 404, error);
    if (accessError) return sendErrorResponse(res, 403, accessError);

    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere(portalUser, { id: req.params.ticketId }),
    });
    if (!ticket) return sendErrorResponse(res, 404, "Ticket not found.");
    if (!["Closed", "Resolved"].includes(ticket.status)) {
      return sendErrorResponse(res, 400, "Satisfaction can be submitted after resolution or closure.");
    }

    const [satisfaction] = await CustomerHelpdeskSatisfaction.findOrCreate({
      where: {
        org_id: portalUser.org_id,
        ticketId: ticket.id,
        portalUserId: portalUser.id,
      },
      defaults: {
        org_id: portalUser.org_id,
        ticketId: ticket.id,
        portalUserId: portalUser.id,
        customer_id: portalUser.customer_id,
        rating: numericRating,
        comment,
        submittedAt: new Date(),
      },
    });

    await satisfaction.update({
      rating: numericRating,
      comment,
      submittedAt: new Date(),
    });

    await recordAudit({
      req,
      org_id: portalUser.org_id,
      ticketId: ticket.id,
      action: "satisfaction.submitted",
      entityType: "satisfaction",
      entityId: satisfaction.id,
      metadata: { rating: numericRating },
    });

    return res.status(200).json({
      message: "Satisfaction submitted.",
      satisfaction,
    });
  } catch (error) {
    console.error("Satisfaction submit error:", error);
    return sendErrorResponse(res, 500, "Failed to submit satisfaction.");
  }
};

exports.getAgentReports = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { from, to } = req.query;
  const createdAt = {};

  if (from) createdAt[db.Sequelize.Op.gte] = new Date(from);
  if (to) createdAt[db.Sequelize.Op.lte] = new Date(to);

  const ticketWhere = {
    org_id,
    ticketScope: TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT,
    ...(Object.keys(createdAt).length && { createdAt }),
  };

  try {
    const [tickets, satisfactions, articles] = await Promise.all([
      CustomerHelpdeskTicket.findAll({
        where: ticketWhere,
        attributes: [
          "id",
          "status",
          "priority",
          "category",
          "supportTeamId",
          "firstResponseDueAt",
          "firstResponseAt",
          "resolutionDueAt",
          "closedAt",
          "createdAt",
        ],
      }),
      CustomerHelpdeskSatisfaction.findAll({ where: { org_id } }),
      CustomerHelpdeskKnowledgeArticle.findAll({
        where: { org_id },
        attributes: ["id", "title", "deflectionCount"],
        order: [["deflectionCount", "DESC"]],
        limit: 10,
      }),
    ]);

    const report = tickets.reduce(
      (acc, ticket) => {
        acc.totalTickets += 1;
        acc.byStatus[ticket.status] = (acc.byStatus[ticket.status] || 0) + 1;
        acc.byPriority[ticket.priority || "Unspecified"] =
          (acc.byPriority[ticket.priority || "Unspecified"] || 0) + 1;
        acc.byCategory[ticket.category || "General"] =
          (acc.byCategory[ticket.category || "General"] || 0) + 1;

        const responseDue = ticket.firstResponseDueAt && new Date(ticket.firstResponseDueAt);
        const responseAt = ticket.firstResponseAt && new Date(ticket.firstResponseAt);
        if (responseDue && responseAt && responseAt <= responseDue) acc.firstResponseMet += 1;
        if (responseDue) acc.firstResponseTracked += 1;

        const resolutionDue = ticket.resolutionDueAt && new Date(ticket.resolutionDueAt);
        const closedAt = ticket.closedAt && new Date(ticket.closedAt);
        if (resolutionDue && closedAt && closedAt <= resolutionDue) acc.resolutionMet += 1;
        if (resolutionDue) acc.resolutionTracked += 1;

        return acc;
      },
      {
        totalTickets: 0,
        byStatus: {},
        byPriority: {},
        byCategory: {},
        firstResponseTracked: 0,
        firstResponseMet: 0,
        resolutionTracked: 0,
        resolutionMet: 0,
      }
    );

    const satisfactionTotal = satisfactions.reduce((sum, item) => sum + Number(item.rating || 0), 0);

    return res.status(200).json({
      ...report,
      firstResponseSlaPercent: report.firstResponseTracked
        ? Math.round((report.firstResponseMet / report.firstResponseTracked) * 100)
        : null,
      resolutionSlaPercent: report.resolutionTracked
        ? Math.round((report.resolutionMet / report.resolutionTracked) * 100)
        : null,
      satisfaction: {
        responses: satisfactions.length,
        average: satisfactions.length
          ? Number((satisfactionTotal / satisfactions.length).toFixed(2))
          : null,
      },
      topDeflectionArticles: articles,
    });
  } catch (error) {
    console.error("Customer Helpdesk report error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch Customer Helpdesk reports.");
  }
};

exports.getAgentAuditLogs = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { ticketId, limit = 100 } = req.query;

  try {
    const logs = await CustomerHelpdeskAuditLog.findAll({
      where: {
        org_id,
        ...(ticketId && { ticketId: Number(ticketId) }),
      },
      order: [["createdAt", "DESC"]],
      limit: Math.min(Number(limit) || 100, 500),
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error("Customer Helpdesk audit fetch error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch audit logs.");
  }
};

exports.escalateAgentTicketToCresco = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const { reason = "" } = req.body;

  try {
    const ticket = await CustomerHelpdeskTicket.findOne({
      where: portalTicketWhere({ org_id }, { id: req.params.ticketId }),
      include: [
        { model: Customer, as: "customer", required: false },
        { model: CustomerContact, as: "contact", required: false },
      ],
    });

    if (!ticket) return sendErrorResponse(res, 404, "Ticket not found.");
    if (ticket.crescoSupportTicketId) {
      return sendErrorResponse(res, 400, "Ticket is already escalated to Crescosoft Support.");
    }

    const today = new Date();
    const dueDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const platformTicket = await PlatformTicket.create({
      org_id,
      user_id: req.user.id,
      ticketScope: TICKET_SCOPES.PLATFORM_SUPPORT,
      createdDate: today.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      title: `[Customer Helpdesk] ${ticket.publicReference}: ${ticket.subject}`,
      assignedTo: [],
      assignedRoleIds: [],
      service: "Customer Helpdesk Escalation",
      priority: ticket.priority || "Medium",
      status: "Pending",
      description: [
        ticket.description,
        "",
        `Customer: ${ticket.customer?.companyName || ticket.customer?.email || ticket.customer_id || "Unknown"}`,
        `Contact: ${ticket.contact?.email || ticket.contact?.mobile || ticket.contact_id || "Primary"}`,
        reason ? `Escalation reason: ${reason}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      isEscalated: true,
      escalatedToProvider: true,
      escalatedAt: today,
      escalatedBy: req.user.id,
      remark: `Escalated from Customer Helpdesk ticket ${ticket.publicReference}`,
    });

    await ticket.update({
      crescoSupportTicketId: platformTicket.id,
      escalatedToCrescoAt: today,
      status: "Escalated to Cresco",
      escalationLevel: Number(ticket.escalationLevel || 0) + 1,
    });

    await recordAudit({
      req,
      org_id,
      ticketId: ticket.id,
      action: "ticket.escalated_to_cresco",
      entityType: "ticket",
      entityId: ticket.id,
      metadata: { crescoSupportTicketId: platformTicket.id, reason },
    });

    return res.status(201).json({
      message: "Ticket escalated to Crescosoft Support.",
      crescoSupportTicketId: platformTicket.id,
      ticket: formatTicket(ticket),
    });
  } catch (error) {
    console.error("Escalate to Cresco error:", error);
    return sendErrorResponse(res, 500, "Failed to escalate ticket to Crescosoft Support.");
  }
};

exports.runAgentSlaEscalationScan = async (req, res) => {
  const org_id = getAgentOrgId(req);
  const now = new Date();

  try {
    const tickets = await CustomerHelpdeskTicket.findAll({
      where: {
        org_id,
        ticketScope: TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT,
        status: { [db.Sequelize.Op.notIn]: ["Closed", "Resolved"] },
      },
      include: [{ model: CustomerHelpdeskSlaPolicy, as: "slaPolicy", required: false }],
    });

    let warned = 0;
    let escalated = 0;

    for (const ticket of tickets) {
      const responseDue = ticket.firstResponseDueAt && new Date(ticket.firstResponseDueAt);
      const resolutionDue = ticket.resolutionDueAt && new Date(ticket.resolutionDueAt);
      const breached = (responseDue && !ticket.firstResponseAt && responseDue < now) || (resolutionDue && resolutionDue < now);

      if (!breached) continue;

      const escalationTeamId = ticket.slaPolicy?.escalationTeamId || ticket.supportTeamId;
      const updates = {
        escalationLevel: Number(ticket.escalationLevel || 0) + 1,
        escalatedAt: now,
        ...(escalationTeamId && { supportTeamId: escalationTeamId }),
        status: "Escalated",
      };

      await ticket.update(updates);
      escalated += 1;

      await notifyAgentUsers({
        org_id,
        assignedTo: ticket.assignedTo || [],
        type: "customer_helpdesk_escalated",
        title: "Customer helpdesk ticket escalated",
        message: `${ticket.publicReference} breached SLA and was escalated.`,
        ticket,
      });
    }

    return res.status(200).json({
      message: "SLA escalation scan completed.",
      warned,
      escalated,
    });
  } catch (error) {
    console.error("SLA escalation scan error:", error);
    return sendErrorResponse(res, 500, "Failed to run SLA escalation scan.");
  }
};
