const db = require("../models");
const { Op } = require("sequelize");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const {
  ensureProspectingModuleForOrg,
  getEntitlementState,
  writeAudit,
} = require("../utility/prospectingAuthorization");
const {
  estimateResearchCost,
  executeConfirmedResearch,
} = require("../utility/prospectingOrchestrator");
const {
  encryptCredentialPayload,
  fingerprintCredentialPayload,
} = require("../utility/prospectingCredentials");
const { createProvider } = require("../utility/prospectingProviders/providerRegistry");
const { existingEngagementScore, verifyAndScoreProspect } = require("../utility/prospectingVerificationScoring");

const clean = (value) => String(value || "").trim();
const asArray = (value) => (Array.isArray(value) ? value : []);
const reviewableVerificationStatuses = ["Verified", "Partially Verified"];
const mandatoryApprovalFields = [
  ["companyName", "Company name"],
  ["contactName", "Contact name"],
  ["mobile", "Mobile"],
  ["email", "Email"],
  ["industry", "Industry"],
];

const splitName = (name) => {
  const parts = clean(name || "AI Prospect").split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "AI",
    lastName: parts.slice(1).join(" ") || "Prospect",
  };
};

const missingMandatoryFields = (prospect) =>
  mandatoryApprovalFields
    .filter(([field]) => !clean(prospect?.[field]))
    .map(([, label]) => label);

const appendActivity = (prospect, entry) => [
  ...(Array.isArray(prospect.activityHistory) ? prospect.activityHistory : []),
  { ...entry, at: new Date().toISOString() },
];

const buildAiDrafts = (prospect, enquiry) => ({
  email: {
    aiGenerated: true,
    subject: `Following up with ${prospect.companyName}`,
    body: `Hi ${prospect.contactName || "there"}, we noticed your interest signals around ${prospect.crmRecommendation || "CRM"}. Sharing this as a draft for the sales team to personalize before sending.`,
  },
  whatsapp: {
    aiGenerated: true,
    message: `Hi ${prospect.contactName || "there"}, this is a draft follow-up about ${prospect.crmRecommendation || "CRM"} support for ${prospect.companyName}.`,
  },
  call: {
    aiGenerated: true,
    script: `Confirm requirement, current process, timeline, decision makers and next follow-up for enquiry #${enquiry.id}.`,
  },
  followup: {
    aiGenerated: true,
    title: `Follow up on AI Prospecting enquiry #${enquiry.id}`,
    dueInDays: 2,
  },
});

const enquiryPayloadFromProspect = ({ prospect, user }) => {
  const { firstName, lastName } = splitName(prospect.contactName);
  const requirement = [
    prospect.suggestedNextAction,
    prospect.evidenceSummary,
    `Classification: ${prospect.classification}`,
    `Score: ${prospect.score}`,
    `Provider: ${prospect.sourceProvider}`,
    `Research ID: ${prospect.requestId || "-"}`,
  ].filter(Boolean).join("\n");

  return {
    org_id: user.org_id,
    user_id: user.id,
    salutation: "Mr./Ms.",
    firstName,
    middleName: null,
    lastName,
    mobile: clean(prospect.mobile),
    email: clean(prospect.email),
    customerCategory: prospect.classification,
    industry: prospect.industry,
    designation: prospect.designation,
    leadSource: "AI Prospecting",
    companyName: prospect.companyName,
    billingStreet: "AI Prospecting",
    billingCity: "Not Provided",
    billingState: "Not Provided",
    billingPincode: "000000",
    billingCountry: "Not Provided",
    shippingStreet: "AI Prospecting",
    shippingCity: "Not Provided",
    shippingState: "Not Provided",
    shippingPincode: "000000",
    shippingCountry: "Not Provided",
    assignedTo: [user.id],
    assignedRoleIds: [user.role_id],
    prospectingRequirement: requirement,
  };
};

const validateProspectForApproval = (prospect) => {
  if (!reviewableVerificationStatuses.includes(prospect.verificationStatus)) {
    return ["Only verified or partially verified prospects can be approved."];
  }
  return missingMandatoryFields(prospect);
};

exports.getSummary = async (req, res) => {
  try {
    await ensureProspectingModuleForOrg(req.user.org_id);
    const state = await getEntitlementState(req.user.org_id);
    const settings = await db.prospectingOrgSetting.findOne({ where: { org_id: req.user.org_id } });

    res.json({
      entitlement: state.entitlement,
      active: state.active,
      canResearch: state.canResearch,
      exhausted: state.exhausted,
      reason: state.reason,
      usage: state.usage,
      limits: state.limits,
      settings,
    });
  } catch (error) {
    console.error("Get prospecting summary error:", error);
    return sendErrorResponse(res, 500, "Failed to load AI Prospecting summary.");
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const entitlement = req.prospectingEntitlement;
    const selectedProviders = asArray(req.body.selectedProviders).filter((provider) =>
      asArray(entitlement.supportedProviders).includes(provider)
    );

    const [settings] = await db.prospectingOrgSetting.upsert({
      org_id: req.user.org_id,
      idealCustomerProfile: req.body.idealCustomerProfile || {},
      selectedProviders,
      defaultReviewMode: req.body.defaultReviewMode || "manual",
    });

    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "prospecting.settings.updated",
      entityType: "prospecting_org_settings",
      entityId: settings?.id || req.user.org_id,
      metadata: { selectedProviders },
    });

    res.json({ message: "AI Prospecting settings saved.", settings: await db.prospectingOrgSetting.findOne({ where: { org_id: req.user.org_id } }) });
  } catch (error) {
    console.error("Update prospecting settings error:", error);
    return sendErrorResponse(res, 500, "Failed to save AI Prospecting settings.");
  }
};

exports.upsertOrgProviderConnection = async (req, res) => {
  try {
    if (!req.prospectingEntitlement.allowOrgOwnedProviderAccounts) {
      return sendErrorResponse(res, 403, "Organization-owned provider accounts are not allowed for this plan.");
    }

    const providerCode = clean(req.body.providerCode).toLowerCase();
    if (!providerCode) return sendErrorResponse(res, 400, "Provider code is required.");
    if (!asArray(req.prospectingEntitlement.supportedProviders).includes(providerCode)) {
      return sendErrorResponse(res, 403, "Provider is not approved by Super Master for this organization.");
    }

    let credentialRef = null;
    let credentialStatus = "not_configured";
    if (req.body.credentials && Object.keys(req.body.credentials).length) {
      const encryptedPayload = encryptCredentialPayload(req.body.credentials);
      const secretFingerprint = fingerprintCredentialPayload(req.body.credentials);
      let credential = await db.prospectingProviderCredential.findOne({
        where: {
          providerOrgId: req.prospectingEntitlement.providerOrgId,
          org_id: req.user.org_id,
          providerCode,
          accountType: "organization",
        },
      });
      if (credential) {
        await credential.update({ encryptedPayload, secretFingerprint, status: "active" });
      } else {
        credential = await db.prospectingProviderCredential.create({
          providerOrgId: req.prospectingEntitlement.providerOrgId,
          org_id: req.user.org_id,
          providerCode,
          accountType: "organization",
          encryptedPayload,
          secretFingerprint,
          status: "active",
        });
      }
      credentialRef = `credential:${credential?.id || providerCode}`;
      credentialStatus = "configured";
    }

    const connectionPayload = {
      providerOrgId: req.prospectingEntitlement.providerOrgId,
      org_id: req.user.org_id,
      providerCode,
      accountType: "organization",
      displayName: clean(req.body.displayName) || providerCode,
      credentialStatus,
      credentialRef,
      isEnabled: !!req.body.isEnabled,
      healthStatus: "unknown",
      metadata: req.body.metadata || null,
    };
    let connection = await db.prospectingProviderConnection.findOne({
      where: {
        providerOrgId: req.prospectingEntitlement.providerOrgId,
        org_id: req.user.org_id,
        providerCode,
        accountType: "organization",
      },
    });
    if (connection) {
      await connection.update(connectionPayload);
    } else {
      connection = await db.prospectingProviderConnection.create(connectionPayload);
    }

    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "prospecting.org_provider_connection.updated",
      entityType: "prospecting_provider_connection",
      entityId: connection?.id || providerCode,
      metadata: { providerCode, credentialsStored: credentialStatus === "configured" },
    });

    res.json({
      message: "Organization provider connection saved. Secrets are encrypted and not returned.",
      connection: { ...(connection?.toJSON?.() || {}), credentialRef: credentialRef ? "configured" : null },
    });
  } catch (error) {
    console.error("Upsert org prospecting provider connection error:", error);
    return sendErrorResponse(res, 500, "Failed to save organization provider connection.");
  }
};

exports.validateOrgProviderConnection = async (req, res) => {
  try {
    if (!req.prospectingEntitlement.allowOrgOwnedProviderAccounts) {
      return sendErrorResponse(res, 403, "Organization-owned provider accounts are not allowed for this plan.");
    }

    const providerCode = clean(req.params.providerCode).toLowerCase();
    const provider = await createProvider({
      providerCode,
      providerOrgId: req.prospectingEntitlement.providerOrgId,
      org_id: req.user.org_id,
      accountType: "organization",
    });
    const validation = await provider.validateConnection();
    const health = await provider.healthCheck();
    res.json({ validation, health });
  } catch (error) {
    return sendErrorResponse(res, error.code === "RATE_LIMITED" ? 429 : 400, error.message || "Provider validation failed.");
  }
};

exports.estimateResearchRequest = async (req, res) => {
  try {
    const state = req.prospectingUsage;
    if (!state.canResearch) return sendErrorResponse(res, 403, "New research is blocked for this organization.");

    const settings = await db.prospectingOrgSetting.findOne({ where: { org_id: req.user.org_id } });
    const { criteria, providerCode, accountType, plan, estimate } = await estimateResearchCost({
      org_id: req.user.org_id,
      criteriaInput: req.body,
      entitlement: req.prospectingEntitlement,
      settings,
    });

    const request = await db.prospectingResearchRequest.create({
      org_id: req.user.org_id,
      user_id: req.user.id,
      title: criteria.researchName,
      criteria: req.body,
      normalizedCriteria: criteria,
      providers: [providerCode],
      status: "awaiting_confirmation",
      orchestrationPlan: plan,
      costEstimate: { ...estimate, accountType },
      requestedResearchCount: estimate.requestedRecords,
    });

    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "prospecting.research.estimated",
      entityType: "prospecting_research_request",
      entityId: request.id,
      metadata: { providerCode, estimate },
    });

    res.status(201).json({
      message: "Cost estimated. Confirm before credits are consumed.",
      request,
      plan,
      estimate,
    });
  } catch (error) {
    console.error("Estimate prospecting research error:", error);
    return sendErrorResponse(res, error.code === "LIMIT_EXHAUSTED" ? 429 : 500, error.message || "Failed to estimate AI Prospecting research.");
  }
};

exports.confirmResearchRequest = async (req, res) => {
  try {
    const request = await db.prospectingResearchRequest.findOne({
      where: {
        id: req.params.id,
        org_id: req.user.org_id,
        status: "awaiting_confirmation",
      },
    });
    if (!request) return sendErrorResponse(res, 404, "Awaiting-confirmation research request not found.");

    const prospects = await executeConfirmedResearch({
      request,
      user: req.user,
      entitlement: req.prospectingEntitlement,
    });

    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "prospecting.research.confirmed",
      entityType: "prospecting_research_request",
      entityId: request.id,
      metadata: { provider: request.costEstimate?.provider, prospectCount: prospects.length },
    });

    res.status(201).json({
      message: "Research completed and sent for review.",
      request: await db.prospectingResearchRequest.findByPk(request.id),
      prospects,
    });
  } catch (error) {
    console.error("Confirm prospecting research error:", error);
    const status = error.code === "LIMIT_EXHAUSTED" || error.code === "ENTITLEMENT_BLOCKED" ? 429 : 500;
    return sendErrorResponse(res, status, error.message || "Failed to confirm AI Prospecting research.");
  }
};

exports.cancelResearchRequest = async (req, res) => {
  try {
    const request = await db.prospectingResearchRequest.findOne({
      where: {
        id: req.params.id,
        org_id: req.user.org_id,
        status: { [Op.in]: ["draft", "cost_estimated", "awaiting_confirmation", "queued"] },
      },
    });
    if (!request) return sendErrorResponse(res, 404, "Cancellable research request not found.");

    await request.update({ status: "cancelled" });
    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "prospecting.research.cancelled",
      entityType: "prospecting_research_request",
      entityId: request.id,
    });

    res.json({ message: "Research request cancelled.", request });
  } catch (error) {
    console.error("Cancel prospecting research error:", error);
    return sendErrorResponse(res, 500, "Failed to cancel AI Prospecting research.");
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await db.prospectingResearchRequest.findAll({
      where: { org_id: req.user.org_id },
      order: [["createdAt", "DESC"]],
    });
    res.json({ requests });
  } catch (error) {
    console.error("Get prospecting requests error:", error);
    return sendErrorResponse(res, 500, "Failed to load AI Prospecting history.");
  }
};

exports.getProspects = async (req, res) => {
  try {
    const where = { org_id: req.user.org_id };
    if (req.query.status) where.status = req.query.status;
    if (req.query.requestId) where.requestId = Number(req.query.requestId);

    const prospects = await db.prospectingProspect.findAll({
      where,
      include: [
        { model: db.customer, as: "createdEnquiry", attributes: ["id", "companyName", "mobile", "email"] },
        { model: db.prospectingResearchRequest, as: "request", attributes: ["id", "title", "costEstimate", "providerCreditsUsed", "verifiedProspectCount", "completedAt"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    const prospectIds = prospects.map((item) => item.id);
    const [evidenceRows, historyRows] = await Promise.all([
      db.prospectingEvidence.findAll({
        where: { org_id: req.user.org_id, prospectId: { [Op.in]: prospectIds.length ? prospectIds : [0] } },
        order: [["createdAt", "DESC"]],
      }),
      db.prospectingApprovalHistory.findAll({
        where: { org_id: req.user.org_id, prospectId: { [Op.in]: prospectIds.length ? prospectIds : [0] } },
        order: [["createdAt", "DESC"]],
      }),
    ]);
    const evidenceByProspect = evidenceRows.reduce((acc, item) => {
      acc[item.prospectId] = acc[item.prospectId] || [];
      acc[item.prospectId].push(item);
      return acc;
    }, {});
    const historyByProspect = historyRows.reduce((acc, item) => {
      acc[item.prospectId] = acc[item.prospectId] || [];
      acc[item.prospectId].push(item);
      return acc;
    }, {});
    res.json({
      prospects: prospects.map((prospect) => {
        const json = prospect.toJSON();
        return {
          ...json,
          evidence: evidenceByProspect[prospect.id] || [],
          approvalHistory: historyByProspect[prospect.id] || [],
          missingMandatoryFields: missingMandatoryFields(prospect),
          enquiryLink: prospect.enquiryId ? `/customer/edit/${prospect.enquiryId}` : null,
          estimatedCreditUsage: prospect.request?.costEstimate?.maximumEstimatedCharge || prospect.request?.costEstimate?.estimatedProviderCredits || 0,
          actualCreditUsage: prospect.request?.providerCreditsUsed || 0,
        };
      }),
    });
  } catch (error) {
    console.error("Get prospecting prospects error:", error);
    return sendErrorResponse(res, 500, "Failed to load AI Prospecting results.");
  }
};

exports.getProspectEvidence = async (req, res) => {
  try {
    const prospect = await db.prospectingProspect.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });
    if (!prospect) return sendErrorResponse(res, 404, "Prospect not found.");

    const evidence = await db.prospectingEvidence.findAll({
      where: { prospectId: prospect.id, org_id: req.user.org_id },
      order: [["confidence", "DESC"]],
    });
    res.json({ prospect, evidence });
  } catch (error) {
    console.error("Get prospecting evidence error:", error);
    return sendErrorResponse(res, 500, "Failed to load prospect evidence.");
  }
};

exports.approveProspect = async (req, res) => {
  try {
    const prospect = await db.prospectingProspect.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });
    if (!prospect) return sendErrorResponse(res, 404, "Prospect not found.");
    const missing = validateProspectForApproval(prospect);
    if (missing.length) return sendErrorResponse(res, 400, `Missing mandatory fields before approval: ${missing.join(", ")}`);
    if (prospect.status !== "review") {
      return sendErrorResponse(res, 409, "Only prospects in the approval queue can be approved.");
    }

    await prospect.update({
      status: "approved",
      approvedBy: req.user.id,
      approvedAt: new Date(),
      activityHistory: appendActivity(prospect, { action: "approved", user_id: req.user.id }),
    });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "approved",
      notes: clean(req.body.notes) || null,
      metadata: { missingMandatoryFields: missing, bulk: false },
    });
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.approved", entityType: "prospecting_prospect", entityId: prospect.id });

    res.json({ message: "Prospect approved.", prospect });
  } catch (error) {
    console.error("Approve prospect error:", error);
    return sendErrorResponse(res, 500, "Failed to approve prospect.");
  }
};

exports.rejectProspect = async (req, res) => {
  try {
    const rejectionReason = clean(req.body.rejectionReason || req.body.reason);
    if (!rejectionReason) return sendErrorResponse(res, 400, "Rejection reason is required.");
    const prospect = await db.prospectingProspect.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });
    if (!prospect) return sendErrorResponse(res, 404, "Prospect not found.");

    await prospect.update({
      status: "rejected",
      activityHistory: appendActivity(prospect, { action: "rejected", user_id: req.user.id, rejectionReason }),
    });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "rejected",
      rejectionReason,
      notes: clean(req.body.notes) || null,
      metadata: { bulk: false },
    });
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.rejected", entityType: "prospecting_prospect", entityId: prospect.id });

    res.json({ message: "Prospect rejected.", prospect });
  } catch (error) {
    console.error("Reject prospect error:", error);
    return sendErrorResponse(res, 500, "Failed to reject prospect.");
  }
};

exports.createEnquiryFromProspect = async (req, res) => {
  try {
    const idempotencyKey = clean(req.body.idempotencyKey || req.headers["idempotency-key"]) || `prospecting-enquiry:${req.user.org_id}:${req.params.id}`;
    const result = await db.sequelize.transaction(async (transaction) => {
      const prospect = await db.prospectingProspect.findOne({
        where: {
          id: req.params.id,
          org_id: req.user.org_id,
          status: { [Op.in]: ["approved", "enquiry_created"] },
        },
        lock: true,
        transaction,
      });
      if (!prospect) {
        const error = new Error("Approved prospect not found.");
        error.statusCode = 404;
        throw error;
      }
      if (prospect.enquiryId) {
        const existing = await db.customer.findOne({ where: { id: prospect.enquiryId, org_id: req.user.org_id }, transaction });
        return { enquiry: existing, prospect, reused: true };
      }
      if (!reviewableVerificationStatuses.includes(prospect.verificationStatus)) {
        const error = new Error("Only verified or partially verified approved prospects can become enquiries.");
        error.statusCode = 403;
        throw error;
      }

      const missing = missingMandatoryFields(prospect);
      if (missing.length) {
        const error = new Error(`Missing mandatory fields before enquiry creation: ${missing.join(", ")}`);
        error.statusCode = 400;
        throw error;
      }

      const duplicate = await db.customer.findOne({
        where: {
          org_id: req.user.org_id,
          [Op.or]: [
            prospect.email ? { email: prospect.email } : null,
            prospect.mobile ? { mobile: prospect.mobile } : null,
          ].filter(Boolean),
        },
        transaction,
      });
      if (duplicate) {
        await prospect.update({
          status: "enquiry_created",
          enquiryId: duplicate.id,
          enquiryIdempotencyKey: idempotencyKey,
          activityHistory: appendActivity(prospect, { action: "linked_existing_enquiry", user_id: req.user.id, enquiryId: duplicate.id }),
        }, { transaction });
        return { enquiry: duplicate, prospect, reused: true };
      }

      const payload = enquiryPayloadFromProspect({ prospect, user: req.user });
      const enquiry = await db.customer.create(payload, { transaction });
      const aiGeneratedDrafts = buildAiDrafts(prospect, enquiry);
      await prospect.update({
        status: "enquiry_created",
        enquiryId: enquiry.id,
        enquiryIdempotencyKey: idempotencyKey,
        aiGeneratedDrafts,
        activityHistory: appendActivity(prospect, { action: "created_enquiry", user_id: req.user.id, enquiryId: enquiry.id }),
      }, { transaction });
      await db.prospectingApprovalHistory.create({
        org_id: req.user.org_id,
        prospectId: prospect.id,
        user_id: req.user.id,
        action: "created_enquiry",
        notes: clean(req.body.notes) || null,
        metadata: { idempotencyKey, enquiryId: enquiry.id, mappedFields: Object.keys(payload), aiDraftsCreated: true },
      }, { transaction });
      return { enquiry, prospect, reused: false, aiGeneratedDrafts };
    });

    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.enquiry_created", entityType: "customer", entityId: result.enquiry?.id });

    res.status(201).json({
      message: result.reused ? "Existing enquiry linked from prospect." : "Enquiry created from prospect.",
      enquiry: result.enquiry,
      prospect: await db.prospectingProspect.findByPk(req.params.id),
      enquiryLink: result.enquiry?.id ? `/customer/edit/${result.enquiry.id}` : null,
      aiGeneratedDrafts: result.aiGeneratedDrafts || result.prospect?.aiGeneratedDrafts,
      existingEngagementScore: existingEngagementScore({ enquiry: result.enquiry }),
    });
  } catch (error) {
    if (error.statusCode) return sendErrorResponse(res, error.statusCode, error.message);
    console.error("Create enquiry from prospect error:", error);
    return sendErrorResponse(res, 500, "Failed to create enquiry from prospect.");
  }
};

exports.updateProspectForReview = async (req, res) => {
  try {
    const editable = [
      "companyName",
      "contactName",
      "designation",
      "email",
      "mobile",
      "website",
      "industry",
      "classification",
      "crmRecommendation",
      "suggestedNextAction",
      "evidenceSummary",
    ];
    const updates = {};
    editable.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    });
    const prospect = await db.prospectingProspect.findOne({ where: { id: req.params.id, org_id: req.user.org_id } });
    if (!prospect) return sendErrorResponse(res, 404, "Prospect not found.");
    if (["enquiry_created"].includes(prospect.status)) return sendErrorResponse(res, 409, "Prospect with created enquiry cannot be edited.");

    await prospect.update({
      ...updates,
      activityHistory: appendActivity(prospect, { action: "edited", user_id: req.user.id, fields: Object.keys(updates) }),
    });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "edited",
      notes: clean(req.body.notes) || null,
      metadata: { fields: Object.keys(updates), missingMandatoryFields: missingMandatoryFields(prospect) },
    });
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.edited", entityType: "prospecting_prospect", entityId: prospect.id });
    res.json({ message: "Prospect updated.", prospect: await db.prospectingProspect.findByPk(prospect.id) });
  } catch (error) {
    console.error("Update prospect error:", error);
    return sendErrorResponse(res, 500, "Failed to update prospect.");
  }
};

exports.requestReverification = async (req, res) => {
  try {
    const prospect = await db.prospectingProspect.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
      include: [{ model: db.prospectingResearchRequest, as: "request" }],
    });
    if (!prospect) return sendErrorResponse(res, 404, "Prospect not found.");
    if (prospect.status === "enquiry_created") return sendErrorResponse(res, 409, "Created enquiries cannot be re-verified.");
    const scoring = await verifyAndScoreProspect({
      prospect,
      org_id: req.user.org_id,
      criteria: prospect.request?.normalizedCriteria || {},
    });
    await prospect.update({
      ...scoring,
      activityHistory: appendActivity(prospect, { action: "reverification_requested", user_id: req.user.id }),
    });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "reverification_requested",
      notes: clean(req.body.notes) || null,
      metadata: { verificationStatus: scoring.verificationStatus, score: scoring.score },
    });
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.reverification_requested", entityType: "prospecting_prospect", entityId: prospect.id });
    res.json({ message: "Prospect re-verification completed.", prospect: await db.prospectingProspect.findByPk(prospect.id) });
  } catch (error) {
    console.error("Reverify prospect error:", error);
    return sendErrorResponse(res, 500, "Failed to request re-verification.");
  }
};

exports.bulkApproveProspects = async (req, res) => {
  try {
    const ids = asArray(req.body.prospectIds).map(Number).filter(Boolean);
    if (!ids.length) return sendErrorResponse(res, 400, "Select at least one prospect.");
    const prospects = await db.prospectingProspect.findAll({
      where: { id: { [Op.in]: ids }, org_id: req.user.org_id },
    });
    const approved = [];
    const skipped = [];
    for (const prospect of prospects) {
      const missing = validateProspectForApproval(prospect);
      if (prospect.status !== "review" || missing.length) {
        skipped.push({ id: prospect.id, companyName: prospect.companyName, reason: prospect.status !== "review" ? "Not in approval queue" : `Missing: ${missing.join(", ")}` });
        continue;
      }
      await prospect.update({
        status: "approved",
        approvedBy: req.user.id,
        approvedAt: new Date(),
        activityHistory: appendActivity(prospect, { action: "bulk_approved", user_id: req.user.id }),
      });
      await db.prospectingApprovalHistory.create({
        org_id: req.user.org_id,
        prospectId: prospect.id,
        user_id: req.user.id,
        action: "bulk_approved",
        notes: clean(req.body.notes) || null,
        metadata: { bulk: true },
      });
      approved.push(prospect.id);
    }
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.bulk_approved", entityType: "prospecting_prospect", entityId: approved.join(",") });
    res.json({
      message: `${approved.length} prospect(s) approved. Exact enquiry count after approval: ${approved.length}.`,
      approved,
      skipped,
      exactEnquiryCount: approved.length,
    });
  } catch (error) {
    console.error("Bulk approve prospects error:", error);
    return sendErrorResponse(res, 500, "Failed to bulk approve prospects.");
  }
};

exports.bulkRejectProspects = async (req, res) => {
  try {
    const ids = asArray(req.body.prospectIds).map(Number).filter(Boolean);
    const rejectionReason = clean(req.body.rejectionReason || req.body.reason);
    if (!ids.length) return sendErrorResponse(res, 400, "Select at least one prospect.");
    if (!rejectionReason) return sendErrorResponse(res, 400, "Rejection reason is required.");
    const prospects = await db.prospectingProspect.findAll({
      where: { id: { [Op.in]: ids }, org_id: req.user.org_id, status: { [Op.in]: ["new", "review", "approved"] } },
    });
    for (const prospect of prospects) {
      await prospect.update({
        status: "rejected",
        activityHistory: appendActivity(prospect, { action: "bulk_rejected", user_id: req.user.id, rejectionReason }),
      });
      await db.prospectingApprovalHistory.create({
        org_id: req.user.org_id,
        prospectId: prospect.id,
        user_id: req.user.id,
        action: "bulk_rejected",
        rejectionReason,
        notes: clean(req.body.notes) || null,
        metadata: { bulk: true },
      });
    }
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.bulk_rejected", entityType: "prospecting_prospect", entityId: ids.join(",") });
    res.json({ message: `${prospects.length} prospect(s) rejected.`, rejected: prospects.map((item) => item.id) });
  } catch (error) {
    console.error("Bulk reject prospects error:", error);
    return sendErrorResponse(res, 500, "Failed to bulk reject prospects.");
  }
};

exports.getAudit = async (req, res) => {
  try {
    const auditLogs = await db.prospectingAuditLog.findAll({
      where: { org_id: req.user.org_id },
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    res.json({ auditLogs });
  } catch (error) {
    console.error("Get prospecting audit error:", error);
    return sendErrorResponse(res, 500, "Failed to load AI Prospecting audit.");
  }
};
