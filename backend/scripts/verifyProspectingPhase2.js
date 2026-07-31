require("dotenv").config();

const axios = require("axios");

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
    supportedProviders: ["phase2-test-provider"],
    allowOrgOwnedProviderAccounts: false,
  });

(async () => {
  must(providerEmail && providerPassword && orgEmail && orgPassword, "Set PHASE2 provider/org credentials in the environment.");

  const providerToken = await signin(providerEmail, providerPassword);
  const orgToken = await signin(orgEmail, orgPassword);
  const providerApi = client(providerToken);
  const orgApi = client(orgToken);

  let res = await providerApi.post("/provider/prospecting/provider-connections", {
    providerCode: "phase2-test-provider",
    displayName: "Phase 2 Test Provider",
    credentialStatus: "configured",
    healthStatus: "healthy",
    isEnabled: true,
  });
  must(res.status < 300, `provider connection failed: ${res.status}`);

  res = await putEntitlement(providerApi, "trial", { researchLimit: 100, verifiedProspectLimit: 300, providerCreditLimit: 300 });
  must(res.status < 300, `trial entitlement failed: ${res.status}`);

  res = await orgApi.get("/prospecting/summary");
  must(res.status === 200 && res.data.canResearch === true, "active entitlement summary failed");

  res = await orgApi.post("/prospecting/research", {
    title: "Phase 2 verification research",
    criteria: { industry: "CRM Services", region: "India" },
    providers: ["phase2-test-provider"],
  });
  must(res.status === 201 && res.data.prospects?.every((item) => item.companyName.startsWith("TEST DATA -")), "mock research failed");

  const prospectId = res.data.prospects[0].id;
  res = await orgApi.post(`/prospecting/prospects/${prospectId}/approve`);
  must(res.status === 200, "approve failed");

  res = await orgApi.post(`/prospecting/prospects/${prospectId}/create-enquiry`);
  must(res.status === 201, "create enquiry failed");

  res = await putEntitlement(providerApi, "expired");
  must(res.status < 300, "expired entitlement failed");

  res = await orgApi.get("/prospecting/prospects");
  must(res.status === 200, "historical prospects should remain viewable after expiry");

  res = await orgApi.post("/prospecting/research", {
    title: "Blocked expired research",
    criteria: { industry: "CRM Services" },
    providers: ["phase2-test-provider"],
  });
  must(res.status === 403, "expired research should be blocked");

  res = await putEntitlement(providerApi, "trial", { researchLimit: 1, verifiedProspectLimit: 1, providerCreditLimit: 1 });
  must(res.status < 300, "exhausted entitlement failed");

  res = await orgApi.post("/prospecting/research", {
    title: "Blocked exhausted research",
    criteria: { industry: "CRM Services" },
    providers: ["phase2-test-provider"],
  });
  must(res.status === 429, "exhausted research should be blocked");

  res = await putEntitlement(providerApi, "trial", { researchLimit: 100, verifiedProspectLimit: 300, providerCreditLimit: 300 });
  must(res.status < 300, "reset entitlement failed");

  console.log("Phase 2 prospecting verification passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
