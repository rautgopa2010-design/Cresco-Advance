const db = require("../models");
const { Op } = require("sequelize");
const { createProvider } = require("./prospectingProviders/providerRegistry");
const { getEntitlementState } = require("./prospectingAuthorization");
const { ProspectingProviderError } = require("./prospectingProviders/BaseProspectProvider");
const { verifyAndScoreProspect } = require("./prospectingVerificationScoring");

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

const clean = (value) => String(value || "").trim();

const normalizeCriteria = (input = {}, settings = null) => {
  const icp = settings?.idealCustomerProfile || {};
  return {
    researchName: clean(input.researchName || input.title) || "AI Prospecting Research",
    targetLocation: clean(input.targetLocation || input.region || icp.regions) || "India",
    industry: clean(input.industry || icp.industries) || "CRM Services",
    companySize: clean(input.companySize || icp.companySize) || "10-200 employees",
    revenueRange: clean(input.revenueRange),
    productFocus: ["CRM", "HRMS", "Both"].includes(input.productFocus) ? input.productFocus : "CRM",
    numberOfProspects: Math.max(1, Math.min(Number(input.numberOfProspects || input.limit || 3), 50)),
    jobRoles: asArray(input.jobRoles || input.buyerRoles || icp.buyerRoles),
    seniority: clean(input.seniority) || "Senior",
    keywords: clean(input.keywords),
    technologies: asArray(input.technologies),
    buyingSignals: asArray(input.buyingSignals),
    hiringSignals: clean(input.hiringSignals),
    excludedIndustries: asArray(input.excludedIndustries),
    excludedCompanies: asArray(input.excludedCompanies),
    minimumScore: Math.max(0, Math.min(Number(input.minimumScore || 70), 100)),
    preferredProvider: clean(input.preferredProvider),
    naturalLanguageInstructions: clean(input.naturalLanguageInstructions),
  };
};

const selectProvider = ({ criteria, entitlement, settings }) => {
  const allowed = asArray(entitlement.supportedProviders);
  const selected = asArray(settings?.selectedProviders);
  const preferred = criteria.preferredProvider;
  if (preferred && allowed.includes(preferred)) return preferred;
  const selectedAllowed = selected.find((provider) => allowed.includes(provider));
  if (selectedAllowed) return selectedAllowed;
  return allowed[0] || "phase3-mock-provider";
};

const buildPlan = ({ criteria, providerCode }) => ({
  provider: providerCode,
  explanation: [
    `Interpret target as ${criteria.productFocus} prospects in ${criteria.targetLocation}.`,
    `Search companies in ${criteria.industry} with size ${criteria.companySize}.`,
    `Prioritize roles: ${(criteria.jobRoles || []).join(", ") || "Founder, Sales Head, Operations Head"}.`,
    "Estimate first; reserve and consume credits only after confirmation.",
    "Send results to verification/review. Do not approve, create enquiries, or contact prospects.",
  ],
  enrichmentPolicy: {
    minimizeProviderUsage: true,
    enrichOnlyCandidatesAtOrAboveScore: criteria.minimumScore,
    paidProviderSwitchingAllowed: false,
  },
});

const calculateRemaining = async (org_id) => {
  const state = await getEntitlementState(org_id);
  return {
    state,
    remaining: {
      research: Math.max(Number(state.limits.research || 0) - Number(state.usage.research || 0), 0),
      verifiedProspects: Math.max(Number(state.limits.verified_prospect || 0) - Number(state.usage.verified_prospect || 0), 0),
      providerCredits: Math.max(Number(state.limits.provider_credit || 0) - Number(state.usage.provider_credit || 0), 0),
      aiTokens: Math.max(Number(state.limits.ai_token || 0) - Number(state.usage.ai_token || 0), 0),
    },
  };
};

const estimateResearchCost = async ({ org_id, criteriaInput, entitlement, settings }) => {
  const criteria = normalizeCriteria(criteriaInput, settings);
  const providerCode = selectProvider({ criteria, entitlement, settings });
  const accountType = entitlement.allowOrgOwnedProviderAccounts && criteria.useOrganizationProviderAccount ? "organization" : "platform";
  const provider = await createProvider({
    providerCode,
    providerOrgId: entitlement.providerOrgId,
    org_id,
    accountType,
  });
  const providerEstimate = await provider.estimateSearchCost(criteria);
  const { remaining } = await calculateRemaining(org_id);

  return {
    criteria,
    providerCode,
    accountType,
    plan: buildPlan({ criteria, providerCode }),
    estimate: {
      ...providerEstimate,
      estimatedCrescoCredits: providerEstimate.estimatedCrescoCredits ?? providerEstimate.estimatedProviderCredits,
      maximumEstimatedCharge: providerEstimate.maximumEstimatedCharge ?? providerEstimate.estimatedProviderCredits,
      remainingBalance: remaining,
      requiresConfirmation: true,
    },
  };
};

const writeLedger = async ({ org_id, user_id, requestId, entryType, quantity, lifecycle, reason }) =>
  db.prospectingUsageLedger.create({
    org_id,
    user_id,
    requestId,
    entryType,
    quantity,
    direction: lifecycle === "released" || lifecycle === "refunded" ? "credit" : "debit",
    lifecycle,
    reason,
    idempotencyKey: `${entryType}:${requestId}:${lifecycle}:${reason}`,
  });

const assertWithinLimits = async ({ org_id, estimate }) => {
  const { state, remaining } = await calculateRemaining(org_id);
  if (!state.canResearch) throw new ProspectingProviderError("AI Prospecting cannot start new research for this organization.", { code: state.reason || "ENTITLEMENT_BLOCKED" });
  if (remaining.research < 1) throw new ProspectingProviderError("Research limit is exhausted.", { code: "LIMIT_EXHAUSTED" });
  if (remaining.verifiedProspects < estimate.requestedRecords) throw new ProspectingProviderError("Verified prospect limit is exhausted.", { code: "LIMIT_EXHAUSTED" });
  if (remaining.providerCredits < estimate.estimatedProviderCredits) throw new ProspectingProviderError("Provider credit limit is exhausted.", { code: "LIMIT_EXHAUSTED" });
};

const executeConfirmedResearch = async ({ request, user, entitlement }) => {
  await assertWithinLimits({ org_id: request.org_id, estimate: request.costEstimate });
  const provider = await createProvider({
    providerCode: request.costEstimate.provider,
    providerOrgId: entitlement.providerOrgId,
    org_id: request.org_id,
    accountType: request.costEstimate.accountType || "platform",
  });

  await provider.validateConnection();
  await request.update({ status: "queued", confirmedAt: new Date(), confirmedBy: user.id });

  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "research", quantity: 1, lifecycle: "reserved", reason: "phase3_confirmed_research" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: request.costEstimate.estimatedProviderCredits, lifecycle: "reserved", reason: "phase3_confirmed_provider_credits" });

  await request.update({ status: "researching" });
  const companies = await provider.searchCompanies(request.normalizedCriteria);
  const filteredCompanies = companies.filter((company) => !asArray(request.normalizedCriteria.excludedCompanies).includes(company.name));
  const candidates = filteredCompanies.slice(0, request.costEstimate.requestedRecords);
  const people = await provider.searchPeople(request.normalizedCriteria, candidates);
  const intentSignals = await provider.retrieveIntentSignals(request.normalizedCriteria);
  const hiringSignals = await provider.retrieveHiringSignals(request.normalizedCriteria);

  await request.update({ status: "verification_pending" });
  const prospects = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const company = await provider.enrichCompany(candidates[index]);
    const person = await provider.enrichPerson(people[index] || {});
    const normalized = provider.normalizeResult({
      company,
      person,
      criteria: request.normalizedCriteria,
      evidence: [...intentSignals, ...hiringSignals],
    });

    if (normalized.score < request.normalizedCriteria.minimumScore) continue;

    const prospect = await db.prospectingProspect.create({
      org_id: request.org_id,
      requestId: request.id,
      companyName: normalized.companyName,
      contactName: normalized.contactName,
      designation: normalized.designation,
      email: normalized.email,
      mobile: normalized.mobile,
      website: normalized.website,
      industry: normalized.industry,
      sourceProvider: normalized.sourceProvider,
      status: "new",
      verificationStatus: normalized.verificationStatus,
      score: normalized.score,
      scoreBreakdown: normalized.scoreBreakdown,
      evidenceSummary: normalized.evidenceSummary,
      createdBy: user.id,
    });

    await db.prospectingEvidence.bulkCreate(
      normalized.evidence.map((item) => ({
        org_id: request.org_id,
        prospectId: prospect.id,
        evidenceType: item.type || "evidence",
        title: item.title || item.type || "Evidence",
        value: item.value || "",
        confidence: Number(item.confidence || 0),
      }))
    );
    const scoring = await verifyAndScoreProspect({
      prospect,
      org_id: request.org_id,
      criteria: request.normalizedCriteria,
    });
    await prospect.update(scoring);
    await prospect.reload();
    prospects.push(prospect);
  }

  const reviewableProspects = prospects.filter((prospect) =>
    ["Verified", "Partially Verified"].includes(prospect.verificationStatus)
  );

  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "research", quantity: 1, lifecycle: "consumed", reason: "phase3_completed_research" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "verified_prospect", quantity: reviewableProspects.length, lifecycle: "consumed", reason: "phase4_verified_prospects" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: request.costEstimate.estimatedProviderCredits, lifecycle: "consumed", reason: "phase3_provider_credits" });

  const unusedCredits = Math.max(Number(request.costEstimate.estimatedProviderCredits || 0) - prospects.length, 0);
  if (unusedCredits) {
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: unusedCredits, lifecycle: "released", reason: "phase3_unused_provider_credits" });
  }

  await request.update({
    status: "ready_for_review",
    verifiedProspectCount: reviewableProspects.length,
    providerCreditsUsed: request.costEstimate.estimatedProviderCredits - unusedCredits,
    aiTokensUsed: 0,
    completedAt: new Date(),
  });

  return prospects;
};

module.exports = {
  normalizeCriteria,
  estimateResearchCost,
  executeConfirmedResearch,
};
