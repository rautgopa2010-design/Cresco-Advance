const db = require("../models");
const { Op } = require("sequelize");
const { getParentRoles } = require("./roleHelper");

const MODULE_NAME = "AI Prospecting";
const PERMISSION_TYPES = [
  { type: "view", code: "prospect_agent.view" },
  { type: "research", code: "prospect_agent.research" },
  { type: "review", code: "prospect_agent.review" },
  { type: "approve", code: "prospect_agent.approve" },
  { type: "reject", code: "prospect_agent.reject" },
  { type: "create_enquiry", code: "prospect_agent.create_enquiry" },
  { type: "configure", code: "prospect_agent.configure" },
  { type: "view_audit", code: "prospect_agent.view_audit" },
];

const isProviderUser = (user = {}) =>
  user.user_type === "provider" ||
  String(user.role_name || "").trim().toLowerCase() === "super provider admin";

const isCompanySuperAdmin = (user = {}) =>
  String(user.role_name || "").trim().toLowerCase() === "super admin";

const getNow = () => new Date();

const ensureProspectingModuleForOrg = async (org_id) => {
  const [module] = await db.modules.findOrCreate({
    where: { org_id, module_name: MODULE_NAME },
    defaults: { org_id, module_name: MODULE_NAME, is_default: false },
  });

  const existing = await db.permissions.findAll({
    where: { org_id, module_id: module.id },
  });
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
  db.prospectingEntitlement.findOne({
    where: { org_id },
    include: [{ model: db.prospectingPlan, as: "plan" }],
  });

const getUsageTotals = async (org_id) => {
  const rows = await db.prospectingUsageLedger.findAll({ where: { org_id } });
  return rows.reduce(
    (acc, row) => {
      const multiplier = row.direction === "credit" ? -1 : 1;
      acc[row.entryType] = (acc[row.entryType] || 0) + Number(row.quantity || 0) * multiplier;
      return acc;
    },
    { research: 0, verified_prospect: 0, provider_credit: 0, ai_token: 0 }
  );
};

const getEntitlementState = async (org_id) => {
  const entitlement = await getEntitlement(org_id);
  const usage = await getUsageTotals(org_id);
  const now = getNow();
  const expiresAt = entitlement?.expiresAt ? new Date(entitlement.expiresAt) : null;
  const dateExpired = !!expiresAt && expiresAt < now;
  const status = entitlement?.status || "unsubscribed";

  const extraCredit = Number(entitlement?.extraCreditPacks || 0);
  const limits = {
    research: Number(entitlement?.researchLimit || 0) + extraCredit,
    verified_prospect: Number(entitlement?.verifiedProspectLimit || 0) + extraCredit,
    provider_credit: Number(entitlement?.providerCreditLimit || 0) + extraCredit,
    ai_token: Number(entitlement?.aiTokenLimit || 0),
  };

  const active = !!entitlement && ["trial", "active"].includes(status) && !dateExpired;
  const exhausted =
    active &&
    ((limits.research > 0 && usage.research >= limits.research) ||
      (limits.verified_prospect > 0 && usage.verified_prospect >= limits.verified_prospect) ||
      (limits.provider_credit > 0 && usage.provider_credit >= limits.provider_credit) ||
      (limits.ai_token > 0 && usage.ai_token >= limits.ai_token));

  return {
    entitlement,
    usage,
    limits,
    active,
    exhausted,
    status: dateExpired ? "expired" : status,
    canResearch: active && !exhausted,
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
  db.prospectingAuditLog.create({
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
  ensureProspectingModuleForOrg,
  getEntitlementState,
  hasEmployeePermission,
  writeAudit,
};
