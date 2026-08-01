const db = require("../../models");
const { decryptCredentialPayload } = require("../prospectingCredentials");
const ApolloProvider = require("./ApolloProvider");
const ClayProvider = require("./ClayProvider");
const FutureProvider = require("./FutureProvider");
const MockProspectProvider = require("./MockProspectProvider");
const PermittedPublicResearchProvider = require("./PermittedPublicResearchProvider");

const ADAPTERS = {
  apollo: ApolloProvider,
  clay: ClayProvider,
  "permitted-public-research": PermittedPublicResearchProvider,
  "phase2-test-provider": MockProspectProvider,
  "phase3-mock-provider": MockProspectProvider,
  mock: MockProspectProvider,
};

const getCredential = async ({ providerOrgId, org_id, providerCode, accountType }) => {
  const credential = await db.prospectingProviderCredential.findOne({
    where: {
      providerOrgId,
      org_id: accountType === "organization" ? org_id : null,
      providerCode,
      accountType,
      status: "active",
    },
  });
  if (!credential) return null;
  return decryptCredentialPayload(credential.encryptedPayload);
};

const createProvider = async ({ providerCode, providerOrgId, org_id, accountType = "platform" }) => {
  const Adapter = ADAPTERS[providerCode] || FutureProvider;
  const credentials = await getCredential({ providerOrgId, org_id, providerCode, accountType });
  return new Adapter({ providerCode, credentials, accountType });
};

const listProviderCodes = () => Object.keys(ADAPTERS);

module.exports = {
  createProvider,
  listProviderCodes,
};
