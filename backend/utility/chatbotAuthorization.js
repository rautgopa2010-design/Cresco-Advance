const db = require("../models");
const { Op } = require("sequelize");
const { getParentRoles } = require("./roleHelper");

const MODULE_NAME = "Website AI Chatbot";
const PERMISSION_TYPES = [
  { type: "view", code: "chatbot.view" },
  { type: "configure", code: "chatbot.configure" },
  { type: "knowledge_manage", code: "chatbot.knowledge.manage" },
  { type: "appearance_manage", code: "chatbot.appearance.manage" },
  { type: "conversations_view", code: "chatbot.conversations.view" },
  { type: "conversations_reply", code: "chatbot.conversations.reply" },
  { type: "handover_manage", code: "chatbot.handover.manage" },
  { type: "analytics_view", code: "chatbot.analytics.view" },
  { type: "install_manage", code: "chatbot.install.manage" },
  { type: "view_audit", code: "chatbot.view_audit" },
];

const isProviderUser = (user = {}) =>
  user.user_type === "provider" ||
  String(user.role_name || "").trim().toLowerCase() === "super provider admin";

const isCompanySuperAdmin = (user = {}) =>
  String(user.role_name || "").trim().toLowerCase() === "super admin";

const ensureChatbotModuleForOrg = async (org_id) => {
  const [module] = await db.modules.findOrCreate({
    where: { org_id, module_name: MODULE_NAME },
    defaults: { org_id, module_name: MODULE_NAME, is_default: false },
  });

  const existing = await db.permissions.findAll({ where: { org_id, module_id: module.id } });
  const existingCodes = new Set(existing.map((item) => item.permission_code));
  const missing = PERMISSION_TYPES.filter((item) => !existingCodes.has(item.code));

  if (missing.length) {
    await db.permissions.bulkCreate(
      missing.map((item) => ({
        org_id,
        module_id: module.id,
        permission_type: item.type,
        permission_code: item.code,
      })),
      { ignoreDuplicates: true }
    );
  }

  const superAdminRole = await db.roles.findOne({ where: { org_id, role_name: "Super Admin" } });
  if (superAdminRole) {
    const permissions = await db.permissions.findAll({
      where: {
        org_id,
        module_id: module.id,
        permission_code: { [Op.in]: PERMISSION_TYPES.map((item) => item.code) },
      },
    });
    const existingLinks = await db.rolePermissions.findAll({
      where: {
        org_id,
        role_id: superAdminRole.id,
        permission_id: { [Op.in]: permissions.map((item) => item.id) },
      },
    });
    const linkedIds = new Set(existingLinks.map((item) => item.permission_id));
    const missingLinks = permissions
      .filter((item) => !linkedIds.has(item.id))
      .map((item) => ({ org_id, role_id: superAdminRole.id, permission_id: item.id }));
    if (missingLinks.length) await db.rolePermissions.bulkCreate(missingLinks, { ignoreDuplicates: true });
  }

  return module;
};

const getEntitlement = async (org_id) =>
  db.chatbotEntitlement.findOne({
    where: { org_id },
    include: [{ model: db.chatbotPlan, as: "plan" }],
  });

const getUsageTotals = async (org_id) => {
  const rows = await db.chatbotUsageLedger.findAll({
    where: {
      org_id,
      lifecycle: { [Op.in]: ["consumed", "released", "refunded"] },
    },
  });
  return rows.reduce(
    (acc, row) => {
      const multiplier = row.direction === "credit" ? -1 : 1;
      acc[row.entryType] = (acc[row.entryType] || 0) + Number(row.quantity || 0) * multiplier;
      return acc;
    },
    {
      conversation: 0,
      ai_message: 0,
      enquiry: 0,
      knowledge_source: 0,
      document_storage_mb: 0,
      domain: 0,
      agent: 0,
      handover: 0,
    }
  );
};

const getEntitlementState = async (org_id) => {
  const entitlement = await getEntitlement(org_id);
  const usage = await getUsageTotals(org_id);
  const now = new Date();
  const expiresAt = entitlement?.expiresAt ? new Date(entitlement.expiresAt) : null;
  const dateExpired = !!expiresAt && expiresAt < now;
  const status = entitlement?.status || "unsubscribed";
  const limits = {
    conversation: Number(entitlement?.monthlyConversationLimit || 0) + Number(entitlement?.extraConversationPacks || 0),
    ai_message: Number(entitlement?.monthlyAiMessageLimit || 0) + Number(entitlement?.extraAiMessagePacks || 0),
    enquiry: 0,
    knowledge_source: Number(entitlement?.knowledgeSourceLimit || 0),
    document_storage_mb: Number(entitlement?.documentStorageMbLimit || 0),
    domain: Number(entitlement?.domainLimit || 0),
    agent: Number(entitlement?.agentLimit || 0),
  };
  const active = !!entitlement && ["trial", "active"].includes(status) && !dateExpired;
  const exhausted =
    active &&
    ((limits.conversation > 0 && usage.conversation >= limits.conversation) ||
      (limits.ai_message > 0 && usage.ai_message >= limits.ai_message) ||
      (limits.knowledge_source > 0 && usage.knowledge_source >= limits.knowledge_source) ||
      (limits.document_storage_mb > 0 && usage.document_storage_mb >= limits.document_storage_mb) ||
      (limits.domain > 0 && usage.domain >= limits.domain) ||
      (limits.agent > 0 && usage.agent >= limits.agent));

  return {
    entitlement,
    usage,
    limits,
    active,
    exhausted,
    status: dateExpired ? "expired" : status,
    canUse: active && !exhausted,
    reason: !entitlement
      ? "unsubscribed"
      : status === "suspended"
        ? "suspended"
        : dateExpired || status === "expired"
          ? "expired"
          : exhausted
            ? "exhausted"
            : null,
  };
};

const hasEmployeePermission = async (user, permissionCode) => {
  if (isCompanySuperAdmin(user)) return true;

  const role = await db.roles.findByPk(user.role_id, {
    include: [{ model: db.permissions, as: "permissions" }],
  });
  if (role?.permissions?.some((item) => item.permission_code === permissionCode)) return true;

  const parentRoleIds = await getParentRoles(user.role_id, user.org_id);
  if (!parentRoleIds?.length) return false;

  const parentRoles = await db.roles.findAll({
    where: { id: parentRoleIds, org_id: user.org_id },
    include: [{ model: db.permissions, as: "permissions" }],
  });
  return parentRoles.some((parent) =>
    parent.permissions?.some((item) => item.permission_code === permissionCode)
  );
};

const writeAudit = async ({ req, org_id, action, entityType, entityId, metadata }) =>
  db.chatbotAuditLog.create({
    org_id,
    providerOrgId: isProviderUser(req.user) ? req.user.org_id : req.user.providerId || null,
    user_id: req.user?.id || null,
    actorType: isProviderUser(req.user) ? "provider" : "organization",
    action,
    entityType,
    entityId: entityId ? String(entityId) : null,
    metadata,
  });

module.exports = {
  MODULE_NAME,
  PERMISSION_TYPES,
  isProviderUser,
  ensureChatbotModuleForOrg,
  getEntitlementState,
  hasEmployeePermission,
  writeAudit,
};
