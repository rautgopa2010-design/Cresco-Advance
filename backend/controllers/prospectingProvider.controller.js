const db = require("../models");
const { Op } = require("sequelize");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const {
  PERMISSION_TYPES,
  isProviderUser,
  ensureProspectingModuleForOrg,
  getEntitlementState,
  writeAudit,
} = require("../utility/prospectingAuthorization");

const clean = (value) => String(value || "").trim();
const asArray = (value) => (Array.isArray(value) ? value : []);
const toDateOrNull = (value) => (value ? new Date(value) : null);

const requireProvider = (req, res) => {
  if (isProviderUser(req.user)) return true;
  sendErrorResponse(res, 403, "Only Cresco Super Master can manage AI Prospecting.");
  return false;
};

const getClientOrg = async (providerOrgId, orgId) =>
  db.register.findOne({
    where: {
      providerId: providerOrgId,
      [Op.and]: [{ id: orgId }, { id: { [Op.ne]: providerOrgId } }],
    },
    attributes: ["id", "company", "email", "mobile", "paymentStatus", "accountActivity"],
  });

exports.getOverview = async (req, res) => {
  if (!requireProvider(req, res)) return;

  try {
    const providerOrgId = req.user.org_id;
    const [plans, entitlements, providers] = await Promise.all([
      db.prospectingPlan.findAll({ where: { providerOrgId }, order: [["createdAt", "DESC"]] }),
      db.prospectingEntitlement.findAll({
        where: { providerOrgId },
        include: [{ model: db.register, as: "organization", attributes: ["id", "company", "email"] }],
        order: [["updatedAt", "DESC"]],
      }),
      db.prospectingProviderConnection.findAll({ where: { providerOrgId, org_id: null } }),
    ]);

    const usageRows = await db.prospectingUsageLedger.findAll({
      attributes: ["org_id", "entryType", "direction", "quantity"],
      where: { org_id: { [Op.in]: entitlements.map((item) => item.org_id) } },
    });

    const aggregateUsage = usageRows.reduce(
      (acc, row) => {
        const multiplier = row.direction === "credit" ? -1 : 1;
        acc[row.entryType] = (acc[row.entryType] || 0) + Number(row.quantity || 0) * multiplier;
        return acc;
      },
      { research: 0, verified_prospect: 0, provider_credit: 0, ai_token: 0 }
    );

    res.json({
      plans,
      entitlements,
      providers,
      aggregateUsage,
      providerHealth: providers.map((item) => ({
        providerCode: item.providerCode,
        displayName: item.displayName,
        credentialStatus: item.credentialStatus,
        healthStatus: item.healthStatus,
        isEnabled: item.isEnabled,
      })),
    });
  } catch (error) {
    console.error("Prospecting provider overview error:", error);
    return sendErrorResponse(res, 500, "Failed to load AI Prospecting overview.");
  }
};

exports.createPlan = async (req, res) => {
  if (!requireProvider(req, res)) return;

  try {
    const plan = await db.prospectingPlan.create({
      providerOrgId: req.user.org_id,
      name: clean(req.body.name),
      description: clean(req.body.description) || null,
      researchLimit: Number(req.body.researchLimit || 0),
      verifiedProspectLimit: Number(req.body.verifiedProspectLimit || 0),
      providerCreditLimit: Number(req.body.providerCreditLimit || 0),
      aiTokenLimit: Number(req.body.aiTokenLimit || 0),
      supportedProviders: asArray(req.body.supportedProviders),
      allowOrgOwnedProviderAccounts: !!req.body.allowOrgOwnedProviderAccounts,
      isActive: req.body.isActive !== false,
    });

    await writeAudit({
      req,
      org_id: null,
      action: "prospecting.plan.created",
      entityType: "prospecting_plan",
      entityId: plan.id,
      metadata: { name: plan.name },
    });

    res.status(201).json({ message: "AI Prospecting plan created.", plan });
  } catch (error) {
    console.error("Create prospecting plan error:", error);
    return sendErrorResponse(res, 500, "Failed to create AI Prospecting plan.");
  }
};

exports.upsertEntitlement = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const orgId = Number(req.params.orgId);
  try {
    const org = await getClientOrg(req.user.org_id, orgId);
    if (!org) return sendErrorResponse(res, 404, "Organization not found for this Super Master.");

    const plan = req.body.planId
      ? await db.prospectingPlan.findOne({ where: { id: req.body.planId, providerOrgId: req.user.org_id } })
      : null;

    if (req.body.planId && !plan) return sendErrorResponse(res, 404, "AI Prospecting plan not found.");

    const payload = {
      providerOrgId: req.user.org_id,
      org_id: orgId,
      planId: plan?.id || null,
      status: req.body.status || "trial",
      startsAt: toDateOrNull(req.body.startsAt),
      expiresAt: toDateOrNull(req.body.expiresAt),
      researchLimit: Number(req.body.researchLimit ?? plan?.researchLimit ?? 0),
      verifiedProspectLimit: Number(req.body.verifiedProspectLimit ?? plan?.verifiedProspectLimit ?? 0),
      providerCreditLimit: Number(req.body.providerCreditLimit ?? plan?.providerCreditLimit ?? 0),
      aiTokenLimit: Number(req.body.aiTokenLimit ?? plan?.aiTokenLimit ?? 0),
      extraCreditPacks: Number(req.body.extraCreditPacks || 0),
      supportedProviders: asArray(req.body.supportedProviders?.length ? req.body.supportedProviders : plan?.supportedProviders),
      allowOrgOwnedProviderAccounts: !!(req.body.allowOrgOwnedProviderAccounts ?? plan?.allowOrgOwnedProviderAccounts),
      suspendedReason: clean(req.body.suspendedReason) || null,
    };

    const [entitlement] = await db.prospectingEntitlement.upsert(payload);
    await ensureProspectingModuleForOrg(orgId);
    await db.prospectingOrgSetting.findOrCreate({ where: { org_id: orgId }, defaults: { org_id: orgId } });

    await writeAudit({
      req,
      org_id: orgId,
      action: "prospecting.entitlement.updated",
      entityType: "prospecting_entitlement",
      entityId: entitlement?.id || orgId,
      metadata: { status: payload.status, limits: payload },
    });

    res.json({ message: "AI Prospecting entitlement saved.", entitlement: await db.prospectingEntitlement.findOne({ where: { org_id: orgId } }) });
  } catch (error) {
    console.error("Upsert prospecting entitlement error:", error);
    return sendErrorResponse(res, 500, "Failed to save AI Prospecting entitlement.");
  }
};

exports.suspendOrg = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const orgId = Number(req.params.orgId);
  try {
    const entitlement = await db.prospectingEntitlement.findOne({
      where: { org_id: orgId, providerOrgId: req.user.org_id },
    });
    if (!entitlement) return sendErrorResponse(res, 404, "AI Prospecting entitlement not found.");

    await entitlement.update({
      status: "suspended",
      suspendedReason: clean(req.body.reason) || "Suspended by Super Master",
    });
    await writeAudit({
      req,
      org_id: orgId,
      action: "prospecting.entitlement.suspended",
      entityType: "prospecting_entitlement",
      entityId: entitlement.id,
      metadata: { reason: entitlement.suspendedReason },
    });

    res.json({ message: "AI Prospecting access suspended.", entitlement });
  } catch (error) {
    console.error("Suspend prospecting entitlement error:", error);
    return sendErrorResponse(res, 500, "Failed to suspend AI Prospecting access.");
  }
};

exports.upsertProviderConnection = async (req, res) => {
  if (!requireProvider(req, res)) return;

  try {
    const providerCode = clean(req.body.providerCode).toLowerCase();
    if (!providerCode) return sendErrorResponse(res, 400, "Provider code is required.");

    const [connection] = await db.prospectingProviderConnection.upsert({
      id: req.body.id || undefined,
      providerOrgId: req.user.org_id,
      org_id: null,
      providerCode,
      accountType: "platform",
      displayName: clean(req.body.displayName) || providerCode,
      credentialStatus: req.body.credentialStatus || "not_configured",
      credentialRef: clean(req.body.credentialRef) || null,
      healthStatus: req.body.healthStatus || "unknown",
      isEnabled: !!req.body.isEnabled,
      metadata: req.body.metadata || null,
    });

    await writeAudit({
      req,
      org_id: null,
      action: "prospecting.provider_connection.updated",
      entityType: "prospecting_provider_connection",
      entityId: connection?.id || providerCode,
      metadata: { providerCode, liveProviderIntegrated: false },
    });

    res.json({ message: "Provider connection saved. Live provider integration is disabled in Phase 2.", connection });
  } catch (error) {
    console.error("Upsert prospecting provider connection error:", error);
    return sendErrorResponse(res, 500, "Failed to save provider connection.");
  }
};

exports.getOrgAggregateUsage = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const orgId = Number(req.params.orgId);
  try {
    const entitlement = await db.prospectingEntitlement.findOne({
      where: { org_id: orgId, providerOrgId: req.user.org_id },
    });
    if (!entitlement) return sendErrorResponse(res, 404, "AI Prospecting entitlement not found.");

    const state = await getEntitlementState(orgId);
    res.json({
      org_id: orgId,
      status: state.status,
      active: state.active,
      exhausted: state.exhausted,
      limits: state.limits,
      usage: state.usage,
    });
  } catch (error) {
    console.error("Get prospecting org aggregate usage error:", error);
    return sendErrorResponse(res, 500, "Failed to load organization usage.");
  }
};

exports.seedPermissionsForOrg = async (req, res) => {
  if (!requireProvider(req, res)) return;
  const orgId = Number(req.params.orgId);

  try {
    const org = await getClientOrg(req.user.org_id, orgId);
    if (!org) return sendErrorResponse(res, 404, "Organization not found for this Super Master.");

    await ensureProspectingModuleForOrg(orgId);
    res.json({ message: "AI Prospecting module permissions are ready.", permissions: PERMISSION_TYPES });
  } catch (error) {
    console.error("Seed prospecting permissions error:", error);
    return sendErrorResponse(res, 500, "Failed to prepare AI Prospecting permissions.");
  }
};
