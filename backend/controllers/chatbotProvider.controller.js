const db = require("../models");
const { Op } = require("sequelize");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const {
  PERMISSION_TYPES,
  isProviderUser,
  ensureChatbotModuleForOrg,
  getEntitlementState,
  writeAudit,
} = require("../utility/chatbotAuthorization");

const clean = (value) => String(value || "").trim();
const asArray = (value) => (Array.isArray(value) ? value : []);
const toDateOrNull = (value) => (value ? new Date(value) : null);

const requireProvider = (req, res) => {
  if (isProviderUser(req.user)) return true;
  sendErrorResponse(res, 403, "Only Cresco Super Master can manage Website AI Chatbot.");
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

const entitlementPayloadFrom = ({ req, orgId, plan }) => ({
  providerOrgId: req.user.org_id,
  org_id: orgId,
  planId: plan?.id || null,
  status: req.body.status || "trial",
  startsAt: toDateOrNull(req.body.startsAt),
  expiresAt: toDateOrNull(req.body.expiresAt),
  monthlyConversationLimit: Number(req.body.monthlyConversationLimit ?? plan?.monthlyConversationLimit ?? 0),
  monthlyAiMessageLimit: Number(req.body.monthlyAiMessageLimit ?? plan?.monthlyAiMessageLimit ?? 0),
  knowledgeSourceLimit: Number(req.body.knowledgeSourceLimit ?? plan?.knowledgeSourceLimit ?? 0),
  documentStorageMbLimit: Number(req.body.documentStorageMbLimit ?? plan?.documentStorageMbLimit ?? 0),
  domainLimit: Number(req.body.domainLimit ?? plan?.domainLimit ?? 0),
  agentLimit: Number(req.body.agentLimit ?? plan?.agentLimit ?? 0),
  humanHandoverEnabled: !!(req.body.humanHandoverEnabled ?? plan?.humanHandoverEnabled),
  analyticsEnabled: req.body.analyticsEnabled ?? plan?.analyticsEnabled ?? true,
  extraConversationPacks: Number(req.body.extraConversationPacks || 0),
  extraAiMessagePacks: Number(req.body.extraAiMessagePacks || 0),
  supportedAiProviders: asArray(req.body.supportedAiProviders?.length ? req.body.supportedAiProviders : plan?.supportedAiProviders),
  suspendedReason: clean(req.body.suspendedReason) || null,
});

exports.getOverview = async (req, res) => {
  if (!requireProvider(req, res)) return;

  try {
    const providerOrgId = req.user.org_id;
    const [plans, entitlements] = await Promise.all([
      db.chatbotPlan.findAll({ where: { providerOrgId }, order: [["createdAt", "DESC"]] }),
      db.chatbotEntitlement.findAll({
        where: { providerOrgId },
        include: [{ model: db.register, as: "organization", attributes: ["id", "company", "email"] }],
        order: [["updatedAt", "DESC"]],
      }),
    ]);

    const usageRows = await db.chatbotUsageLedger.findAll({
      attributes: ["org_id", "entryType", "direction", "quantity"],
      where: {
        org_id: { [Op.in]: entitlements.map((item) => item.org_id) },
        lifecycle: { [Op.in]: ["consumed", "released", "refunded"] },
      },
    });
    const aggregateUsage = usageRows.reduce(
      (acc, row) => {
        const multiplier = row.direction === "credit" ? -1 : 1;
        acc[row.entryType] = (acc[row.entryType] || 0) + Number(row.quantity || 0) * multiplier;
        return acc;
      },
      { conversation: 0, ai_message: 0, enquiry: 0, knowledge_source: 0, document_storage_mb: 0, domain: 0, agent: 0, handover: 0 }
    );
    const usageByOrg = usageRows.reduce((acc, row) => {
      const multiplier = row.direction === "credit" ? -1 : 1;
      const orgUsage = acc[row.org_id] || (acc[row.org_id] = {});
      orgUsage[row.entryType] = (orgUsage[row.entryType] || 0) + Number(row.quantity || 0) * multiplier;
      return acc;
    }, {});

    const auditLogs = await db.chatbotAuditLog.findAll({
      where: { providerOrgId },
      order: [["createdAt", "DESC"]],
      limit: 25,
    });

    res.json({ plans, entitlements, aggregateUsage, usageByOrg, auditLogs, permissions: PERMISSION_TYPES });
  } catch (error) {
    console.error("Chatbot provider overview error:", error);
    return sendErrorResponse(res, 500, "Failed to load Website AI Chatbot overview.");
  }
};

exports.createPlan = async (req, res) => {
  if (!requireProvider(req, res)) return;

  try {
    if (!clean(req.body.name)) return sendErrorResponse(res, 400, "Plan name is required.");
    const plan = await db.chatbotPlan.create({
      providerOrgId: req.user.org_id,
      name: clean(req.body.name),
      description: clean(req.body.description) || null,
      status: req.body.status || "active",
      monthlyConversationLimit: Number(req.body.monthlyConversationLimit || 0),
      monthlyAiMessageLimit: Number(req.body.monthlyAiMessageLimit || 0),
      knowledgeSourceLimit: Number(req.body.knowledgeSourceLimit || 0),
      documentStorageMbLimit: Number(req.body.documentStorageMbLimit || 0),
      domainLimit: Number(req.body.domainLimit || 0),
      agentLimit: Number(req.body.agentLimit || 0),
      humanHandoverEnabled: !!req.body.humanHandoverEnabled,
      analyticsEnabled: req.body.analyticsEnabled !== false,
      trialDays: Number(req.body.trialDays || 0),
      overageRules: req.body.overageRules || null,
      supportedAiProviders: asArray(req.body.supportedAiProviders),
    });

    await writeAudit({
      req,
      org_id: null,
      action: "chatbot.plan.created",
      entityType: "chatbot_plan",
      entityId: plan.id,
      metadata: { name: plan.name },
    });

    res.status(201).json({ message: "Website AI Chatbot plan created.", plan });
  } catch (error) {
    console.error("Create chatbot plan error:", error);
    return sendErrorResponse(res, 500, "Failed to create Website AI Chatbot plan.");
  }
};

exports.upsertEntitlement = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const orgId = Number(req.params.orgId);
  try {
    const org = await getClientOrg(req.user.org_id, orgId);
    if (!org) return sendErrorResponse(res, 404, "Organization not found for this Super Master.");

    const plan = req.body.planId
      ? await db.chatbotPlan.findOne({ where: { id: req.body.planId, providerOrgId: req.user.org_id } })
      : null;
    if (req.body.planId && !plan) return sendErrorResponse(res, 404, "Website AI Chatbot plan not found.");

    const payload = entitlementPayloadFrom({ req, orgId, plan });
    const [entitlement] = await db.chatbotEntitlement.upsert(payload);
    await ensureChatbotModuleForOrg(orgId);

    await writeAudit({
      req,
      org_id: orgId,
      action: "chatbot.entitlement.updated",
      entityType: "chatbot_entitlement",
      entityId: entitlement?.id || orgId,
      metadata: { status: payload.status, limits: payload },
    });

    res.json({
      message: "Website AI Chatbot entitlement saved.",
      entitlement: await db.chatbotEntitlement.findOne({ where: { org_id: orgId } }),
    });
  } catch (error) {
    console.error("Upsert chatbot entitlement error:", error);
    return sendErrorResponse(res, 500, "Failed to save Website AI Chatbot entitlement.");
  }
};

exports.suspendOrg = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const orgId = Number(req.params.orgId);
  try {
    const entitlement = await db.chatbotEntitlement.findOne({
      where: { org_id: orgId, providerOrgId: req.user.org_id },
    });
    if (!entitlement) return sendErrorResponse(res, 404, "Website AI Chatbot entitlement not found.");

    await entitlement.update({
      status: "suspended",
      suspendedReason: clean(req.body.reason) || "Suspended by Super Master",
    });
    await writeAudit({
      req,
      org_id: orgId,
      action: "chatbot.entitlement.suspended",
      entityType: "chatbot_entitlement",
      entityId: entitlement.id,
      metadata: { reason: entitlement.suspendedReason },
    });

    res.json({ message: "Website AI Chatbot access suspended.", entitlement });
  } catch (error) {
    console.error("Suspend chatbot entitlement error:", error);
    return sendErrorResponse(res, 500, "Failed to suspend Website AI Chatbot access.");
  }
};

exports.getOrgAggregateUsage = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const orgId = Number(req.params.orgId);
  try {
    const entitlement = await db.chatbotEntitlement.findOne({
      where: { org_id: orgId, providerOrgId: req.user.org_id },
    });
    if (!entitlement) return sendErrorResponse(res, 404, "Website AI Chatbot entitlement not found.");

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
    console.error("Get chatbot org aggregate usage error:", error);
    return sendErrorResponse(res, 500, "Failed to load organization chatbot usage.");
  }
};

exports.seedPermissionsForOrg = async (req, res) => {
  if (!requireProvider(req, res)) return;
  const orgId = Number(req.params.orgId);

  try {
    const org = await getClientOrg(req.user.org_id, orgId);
    if (!org) return sendErrorResponse(res, 404, "Organization not found for this Super Master.");

    await ensureChatbotModuleForOrg(orgId);
    await writeAudit({
      req,
      org_id: orgId,
      action: "chatbot.permissions.seeded",
      entityType: "modules",
      entityId: orgId,
      metadata: { permissions: PERMISSION_TYPES.map((item) => item.code) },
    });
    res.json({ message: "Website AI Chatbot module permissions are ready.", permissions: PERMISSION_TYPES });
  } catch (error) {
    console.error("Seed chatbot permissions error:", error);
    return sendErrorResponse(res, 500, "Failed to prepare Website AI Chatbot permissions.");
  }
};
