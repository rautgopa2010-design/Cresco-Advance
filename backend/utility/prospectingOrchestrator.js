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

const clean = (value, max = 500) => String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const safeWebsite = (value) => {
  const text = clean(value, 300);
  if (!text) return null;
  try {
    const url = new URL(text.startsWith("http") ? text : `https://${text}`);
    const host = url.hostname.toLowerCase();
    const blockedHost =
      host === "localhost" ||
      host.endsWith(".local") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
    if (!["http:", "https:"].includes(url.protocol) || blockedHost) return null;
    return url.href;
  } catch {
    return null;
  }
};

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
    keywords: clean(input.keywords, 300),
    technologies: asArray(input.technologies),
    buyingSignals: asArray(input.buyingSignals),
    hiringSignals: clean(input.hiringSignals),
    excludedIndustries: asArray(input.excludedIndustries),
    excludedCompanies: asArray(input.excludedCompanies),
    minimumScore: Math.max(0, Math.min(Number(input.minimumScore || 70), 100)),
    preferredProvider: clean(input.preferredProvider),
    naturalLanguageInstructions: clean(input.naturalLanguageInstructions, 1500),
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

const writeLedger = async ({ org_id, user_id, requestId, entryType, quantity, lifecycle, reason, idempotencyKey = null }) =>
  db.prospectingUsageLedger.findOrCreate({
    where: { idempotencyKey: idempotencyKey || `${entryType}:${requestId}:${lifecycle}:${reason}` },
    defaults: {
    org_id,
    user_id,
    requestId,
    entryType,
    quantity,
    direction: lifecycle === "released" || lifecycle === "refunded" ? "credit" : "debit",
    lifecycle,
    reason,
    idempotencyKey: idempotencyKey || `${entryType}:${requestId}:${lifecycle}:${reason}`,
    },
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

  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "research", quantity: 1, lifecycle: "reserved", reason: "phase6_confirmed_research" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: request.costEstimate.estimatedProviderCredits, lifecycle: "reserved", reason: "phase6_confirmed_provider_credits" });

  let companies = [];
  let candidates = [];
  let people = [];
  const prospects = [];
  try {
    await request.update({ status: "researching" });
    companies = await provider.searchCompanies(request.normalizedCriteria);
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "companies_searched", quantity: companies.length, lifecycle: "consumed", reason: "phase6_companies_searched" });
    const filteredCompanies = companies.filter((company) => !asArray(request.normalizedCriteria.excludedCompanies).includes(company.name));
    candidates = filteredCompanies.slice(0, request.costEstimate.requestedRecords);
    people = await provider.searchPeople(request.normalizedCriteria, candidates);
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "people_searched", quantity: people.length, lifecycle: "consumed", reason: "phase6_people_searched" });
    const intentSignals = await provider.retrieveIntentSignals(request.normalizedCriteria);
    const hiringSignals = await provider.retrieveHiringSignals(request.normalizedCriteria);
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "ai_summary", quantity: 1, lifecycle: "consumed", reason: "phase6_ai_research_summary" });

    await request.update({ status: "verification_pending" });
    for (let index = 0; index < candidates.length; index += 1) {
      const company = await provider.enrichCompany(candidates[index]);
      const person = await provider.enrichPerson(people[index] || {});
      const normalized = provider.normalizeResult({
        company,
        person,
        criteria: request.normalizedCriteria,
        evidence: [...intentSignals, ...hiringSignals],
      });

      await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "enrichments", quantity: 1, lifecycle: "consumed", reason: `phase6_enrichment_${index + 1}` });
      if (normalized.email) await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "emails_unlocked", quantity: 1, lifecycle: "consumed", reason: `phase6_email_${index + 1}` });
      if (normalized.mobile) await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "phones_unlocked", quantity: 1, lifecycle: "consumed", reason: `phase6_phone_${index + 1}` });

      if (normalized.score < request.normalizedCriteria.minimumScore) continue;

      const prospect = await db.prospectingProspect.create({
        org_id: request.org_id,
        requestId: request.id,
        companyName: normalized.companyName,
        contactName: normalized.contactName,
        designation: normalized.designation,
        email: normalized.email,
        mobile: normalized.mobile,
        website: safeWebsite(normalized.website),
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
  } catch (error) {
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "research", quantity: 1, lifecycle: "released", reason: "phase6_failed_research_release" });
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: request.costEstimate.estimatedProviderCredits, lifecycle: "released", reason: "phase6_failed_provider_release" });
    await request.update({ status: "failed", failedReason: error.message || "Research failed" });
    throw error;
  }

  const reviewableProspects = prospects.filter((prospect) =>
    ["Verified", "Partially Verified"].includes(prospect.verificationStatus)
  );

  const duplicatesPrevented = prospects.filter((prospect) =>
    ["Duplicate", "Existing Customer"].includes(prospect.verificationStatus)
  ).length;
  const chargeableProspects = reviewableProspects.filter((prospect) =>
    !["Duplicate", "Existing Customer", "Insufficient Evidence", "Disqualified"].includes(prospect.verificationStatus)
  );
  const providerCostIncurred = candidates.length;

  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "research", quantity: 1, lifecycle: "consumed", reason: "phase6_completed_research" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "verified_prospect", quantity: chargeableProspects.length, lifecycle: "consumed", reason: "phase6_chargeable_verified_prospects" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "cresco_credit", quantity: chargeableProspects.length, lifecycle: "consumed", reason: "phase6_cresco_prospect_credits" });
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_cost", quantity: providerCostIncurred, lifecycle: "consumed", reason: "phase6_provider_cost_incurred" });
  if (duplicatesPrevented) {
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "duplicate_prevented", quantity: duplicatesPrevented, lifecycle: "consumed", reason: "phase6_duplicates_prevented" });
  }
  await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: providerCostIncurred, lifecycle: "consumed", reason: "phase6_provider_credits" });

  const unusedCredits = Math.max(Number(request.costEstimate.estimatedProviderCredits || 0) - providerCostIncurred, 0);
  if (unusedCredits) {
    await writeLedger({ org_id: request.org_id, user_id: user.id, requestId: request.id, entryType: "provider_credit", quantity: unusedCredits, lifecycle: "released", reason: "phase6_unused_provider_credits" });
  }

  await request.update({
    status: "ready_for_review",
    verifiedProspectCount: chargeableProspects.length,
    providerCreditsUsed: providerCostIncurred,
    aiTokensUsed: 0,
    completedAt: new Date(),
  });

  return prospects;
};

module.exports = {
  normalizeCriteria,
  estimateResearchCost,
  executeConfirmedResearch,
  writeLedger,
};
