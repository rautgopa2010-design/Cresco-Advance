require("dotenv").config();

const axios = require("axios");
const ApolloProvider = require("../utility/prospectingProviders/ApolloProvider");
const MockProspectProvider = require("../utility/prospectingProviders/MockProspectProvider");
const { BaseProspectProvider } = require("../utility/prospectingProviders/BaseProspectProvider");

const baseURL = process.env.PHASE2_VERIFY_BASE_URL || "https://staging.crescosoftcrm.com/api";
const providerEmail = process.env.PHASE2_PROVIDER_EMAIL;
const providerPassword = process.env.PHASE2_PROVIDER_PASSWORD;
const orgEmail = process.env.PHASE2_ORG_EMAIL;
const orgPassword = process.env.PHASE2_ORG_PASSWORD;
const orgId = Number(process.env.PHASE2_ORG_ID || 2);

const must = (condition, message) => {
  if (!condition) throw new Error(message);
};

const signin = async (email, password) => {
  const res = await axios.post(`${baseURL}/auth/signin`, { email, password });
  return res.data.token || res.data.data?.token;
};

const client = (token) =>
  axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });

const putEntitlement = (api, status, limits = {}) =>
  api.put(`/provider/prospecting/orgs/${orgId}/entitlement`, {
    status,
    startsAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    expiresAt:
      status === "expired"
        ? new Date(Date.now() - 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    researchLimit: limits.researchLimit ?? 2,
    verifiedProspectLimit: limits.verifiedProspectLimit ?? 10,
    providerCreditLimit: limits.providerCreditLimit ?? 10,
    aiTokenLimit: limits.aiTokenLimit ?? 0,
    supportedProviders: ["phase3-mock-provider"],
    allowOrgOwnedProviderAccounts: false,
  });

(async () => {
  must(providerEmail && providerPassword && orgEmail && orgPassword, "Set PHASE2 provider/org credentials in the environment.");
  const runIndustry = `Phase4 CRM Services ${Date.now()}`;

  const apolloWithoutCredentials = new ApolloProvider();
  try {
    await apolloWithoutCredentials.validateConnection();
    throw new Error("Apollo validation should fail without credentials");
  } catch (error) {
    must(error.code === "MISSING_CREDENTIALS", "provider failure handling failed");
  }

  const baseProvider = new BaseProspectProvider();
  try {
    baseProvider.handleRateLimit({ response: { status: 429, headers: { "retry-after": "7" } } });
    throw new Error("Rate limit handling should throw");
  } catch (error) {
    must(error.code === "RATE_LIMITED" && error.retryAfterSeconds === 7, "rate limit handling failed");
  }

  const mockProvider = new MockProspectProvider({ providerCode: "phase3-mock-provider" });
  const normalized = mockProvider.normalizeResult({
    company: { name: "TEST DATA - Normalize Co", industry: "CRM", website: "https://normalize.example.invalid", rawProviderPayload: { secret: "raw" } },
    person: { name: "TEST DATA - Buyer", title: "Founder", email: "normalize@example.invalid", phone: "9000000000", verified: true, rawProviderPayload: { secret: "raw" } },
    criteria: { minimumScore: 70 },
    evidence: [{ type: "intent", value: "TEST DATA - signal", confidence: 80 }],
  });
  must(!JSON.stringify(normalized).includes("rawProviderPayload"), "provider-specific raw payload leaked from adapter");

  const providerToken = await signin(providerEmail, providerPassword);
  const orgToken = await signin(orgEmail, orgPassword);
  const providerApi = client(providerToken);
  const orgApi = client(orgToken);

  let res = await providerApi.post("/provider/prospecting/provider-connections", {
    providerCode: "phase3-mock-provider",
    displayName: "Phase 3 Mock/Test Provider",
    credentialStatus: "configured",
    healthStatus: "healthy",
    isEnabled: true,
    credentials: { apiKey: "staging-secret-should-not-be-returned" },
  });
  must(res.status < 300, `provider connection failed: ${res.status}`);
  must(!JSON.stringify(res.data).includes("staging-secret-should-not-be-returned"), "provider secret leaked in response");

  res = await providerApi.post("/provider/prospecting/provider-connections/phase3-mock-provider/validate");
  must(res.status === 200 && res.data.validation?.ok, "provider validation failed");

  res = await putEntitlement(providerApi, "trial", { researchLimit: 100, verifiedProspectLimit: 300, providerCreditLimit: 300 });
  must(res.status < 300, `trial entitlement failed: ${res.status}`);

  res = await orgApi.get("/prospecting/summary");
  must(res.status === 200 && res.data.canResearch === true, "active entitlement summary failed");

  res = await orgApi.post("/prospecting/research/estimate", {
    researchName: "Phase 4 verification research",
    targetLocation: "India",
    industry: runIndustry,
    companySize: "10-200 employees",
    productFocus: "CRM",
    numberOfProspects: 3,
    jobRoles: "Founder, Sales Head",
    minimumScore: 70,
    preferredProvider: "phase3-mock-provider",
    naturalLanguageInstructions: "Find high-fit CRM prospects and estimate before spending.",
  });
  must(res.status === 201 && res.data.estimate?.requiresConfirmation, "cost estimate failed");
  const requestId = res.data.request.id;

  res = await orgApi.post(`/prospecting/research/${requestId}/confirm`);
  must(res.status === 201 && res.data.prospects?.every((item) => item.companyName.startsWith("TEST DATA -")), "confirmed mock research failed");
  must(
    res.data.prospects.every((item) => ["Verified", "Partially Verified"].includes(item.verificationStatus)),
    "verification gate failed for first research"
  );
  must(
    res.data.prospects.every((item) => item.classification && item.classification !== "Confirmed Enquiry"),
    "provider intent or AI inference incorrectly produced Confirmed Enquiry"
  );
  must(
    res.data.prospects.every((item) =>
      Number.isInteger(item.prospectFitScore) &&
      Number.isInteger(item.intentScore) &&
      Number.isInteger(item.dataQualityScore) &&
      item.scoreBreakdown?.explanation?.length
    ),
    "score breakdown fields missing"
  );

  const prospectId = res.data.prospects[0].id;
  const rejectProspectId = res.data.prospects[1].id;
  const bulkProspectId = res.data.prospects[2].id;

  res = await orgApi.post(`/prospecting/prospects/${rejectProspectId}/reject`, {});
  must(res.status === 400, "rejection should require a reason");

  res = await orgApi.post(`/prospecting/prospects/${rejectProspectId}/reject`, { rejectionReason: "Phase 5 verification rejection" });
  must(res.status === 200, "reject with reason failed");

  res = await orgApi.post(`/prospecting/prospects/${bulkProspectId}/reverify`);
  must(res.status === 200 && res.data.prospect?.score >= 0, "request re-verification failed");

  res = await orgApi.post("/prospecting/prospects/bulk-approve", { prospectIds: [bulkProspectId] });
  must(res.status === 200 && res.data.exactEnquiryCount === 1, "bulk approval exact enquiry count failed");

  res = await orgApi.post(`/prospecting/prospects/${prospectId}/approve`);
  must(res.status === 200, "approve failed");

  res = await orgApi.post(`/prospecting/prospects/${prospectId}/create-enquiry`, { idempotencyKey: `phase5:${prospectId}` });
  must(res.status === 201 && Number.isInteger(res.data.existingEngagementScore), "create enquiry or engagement score failed");
  const createdEnquiryId = res.data.enquiry.id;
  must(res.data.enquiry.leadSource === "AI Prospecting", "enquiry lead source mapping failed");
  must(res.data.aiGeneratedDrafts?.email?.aiGenerated === true, "AI-generated drafts missing");

  res = await orgApi.post(`/prospecting/prospects/${prospectId}/create-enquiry`, { idempotencyKey: `phase5:${prospectId}` });
  must(res.status === 201 && res.data.enquiry.id === createdEnquiryId, "idempotent retry created a second enquiry");

  res = await orgApi.get("/prospecting/prospects");
  const detailed = res.data.prospects.find((item) => item.id === prospectId);
  must(detailed?.evidence?.length && detailed?.approvalHistory?.some((item) => item.action === "created_enquiry"), "approval queue details or audit history missing");

  res = await orgApi.post("/prospecting/research/estimate", {
    researchName: "Phase 4 duplicate verification research",
    targetLocation: "India",
    industry: runIndustry,
    companySize: "10-200 employees",
    productFocus: "CRM",
    numberOfProspects: 2,
    jobRoles: "Founder, Sales Head",
    minimumScore: 70,
    preferredProvider: "phase3-mock-provider",
    naturalLanguageInstructions: "Repeat the same mock search to verify deterministic duplicate handling.",
  });
  must(res.status === 201, "duplicate cost estimate failed");
  const duplicateRequestId = res.data.request.id;

  res = await orgApi.post(`/prospecting/research/${duplicateRequestId}/confirm`);
  must(res.status === 201, "duplicate research confirmation failed");
  const duplicateProspect = res.data.prospects.find((item) => ["Duplicate", "Existing Customer"].includes(item.verificationStatus));
  must(duplicateProspect && duplicateProspect.status === "new", "duplicate prospect should be blocked from approval queue");

  res = await orgApi.post(`/prospecting/prospects/${duplicateProspect.id}/approve`);
  must(res.status >= 400, "duplicate prospect should not be approvable");

  res = await putEntitlement(providerApi, "expired");
  must(res.status < 300, "expired entitlement failed");

  res = await orgApi.get("/prospecting/prospects");
  must(res.status === 200, "historical prospects should remain viewable after expiry");

  res = await orgApi.post("/prospecting/research/estimate", {
    title: "Blocked expired research",
    industry: "CRM Services",
    preferredProvider: "phase3-mock-provider",
  });
  must(res.status === 403, "expired research should be blocked");

  res = await putEntitlement(providerApi, "trial", { researchLimit: 1, verifiedProspectLimit: 1, providerCreditLimit: 1 });
  must(res.status < 300, "exhausted entitlement failed");

  res = await orgApi.post("/prospecting/research/estimate", {
    title: "Blocked exhausted research",
    industry: "CRM Services",
    preferredProvider: "phase3-mock-provider",
  });
  must(res.status === 429, "exhausted research should be blocked");

  res = await putEntitlement(providerApi, "trial", { researchLimit: 100, verifiedProspectLimit: 300, providerCreditLimit: 300 });
  must(res.status < 300, "reset entitlement failed");

  console.log("Phase 4 prospecting verification passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
