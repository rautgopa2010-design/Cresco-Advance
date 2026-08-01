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
const { existingEngagementScore } = require("../utility/prospectingVerificationScoring");

const clean = (value) => String(value || "").trim();
const asArray = (value) => (Array.isArray(value) ? value : []);
const reviewableVerificationStatuses = ["Verified", "Partially Verified"];

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
      include: [{ model: db.customer, as: "createdEnquiry", attributes: ["id", "companyName", "mobile", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ prospects });
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
    if (!reviewableVerificationStatuses.includes(prospect.verificationStatus)) {
      return sendErrorResponse(res, 403, "Only verified or partially verified prospects can be approved.");
    }
    if (prospect.status !== "review") {
      return sendErrorResponse(res, 409, "Only prospects in the approval queue can be approved.");
    }

    await prospect.update({ status: "approved", approvedBy: req.user.id, approvedAt: new Date() });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "approved",
      notes: clean(req.body.notes) || null,
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
    const prospect = await db.prospectingProspect.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });
    if (!prospect) return sendErrorResponse(res, 404, "Prospect not found.");

    await prospect.update({ status: "rejected" });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "rejected",
      notes: clean(req.body.notes) || null,
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
    const prospect = await db.prospectingProspect.findOne({
      where: {
        id: req.params.id,
        org_id: req.user.org_id,
        status: "approved",
      },
    });
    if (!prospect) return sendErrorResponse(res, 404, "Approved prospect not found.");
    if (!reviewableVerificationStatuses.includes(prospect.verificationStatus)) {
      return sendErrorResponse(res, 403, "Only verified or partially verified approved prospects can become enquiries.");
    }
    if (prospect.enquiryId) return sendErrorResponse(res, 409, "Enquiry already created for this prospect.");

    const duplicate = await db.customer.findOne({
      where: {
        org_id: req.user.org_id,
        [Op.or]: [
          prospect.email ? { email: prospect.email } : null,
          prospect.mobile ? { mobile: prospect.mobile } : null,
        ].filter(Boolean),
      },
    });
    if (duplicate) return sendErrorResponse(res, 409, "A matching enquiry already exists.");

    const [firstName, ...lastNameParts] = clean(prospect.contactName || "AI Prospect").split(" ");
    const enquiry = await db.customer.create({
      org_id: req.user.org_id,
      user_id: req.user.id,
      firstName: firstName || "AI",
      middleName: null,
      lastName: lastNameParts.join(" ") || "Prospect",
      mobile: prospect.mobile || "0000000000",
      email: prospect.email,
      companyName: prospect.companyName,
      industry: prospect.industry,
      designation: prospect.designation,
      leadSource: "AI Prospecting",
      assignedTo: [req.user.id],
      assignedRoleIds: [req.user.role_id],
    });

    await prospect.update({ status: "enquiry_created", enquiryId: enquiry.id });
    await db.prospectingApprovalHistory.create({
      org_id: req.user.org_id,
      prospectId: prospect.id,
      user_id: req.user.id,
      action: "created_enquiry",
      notes: clean(req.body.notes) || null,
    });
    await writeAudit({ req, org_id: req.user.org_id, action: "prospecting.prospect.enquiry_created", entityType: "customer", entityId: enquiry.id });

    res.status(201).json({
      message: "Enquiry created from prospect.",
      enquiry,
      prospect,
      existingEngagementScore: existingEngagementScore({ enquiry }),
    });
  } catch (error) {
    console.error("Create enquiry from prospect error:", error);
    return sendErrorResponse(res, 500, "Failed to create enquiry from prospect.");
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
