const { BaseProspectProvider, ProspectingProviderError } = require("./BaseProspectProvider");

class ApolloProvider extends BaseProspectProvider {
  constructor(options = {}) {
    super({ ...options, providerCode: "apollo" });
  }

  async validateConnection() {
    if (!this.credentials?.apiKey) {
      throw new ProspectingProviderError("Apollo credentials are not configured.", { code: "MISSING_CREDENTIALS" });
    }
    return { ok: true, providerCode: this.providerCode };
  }

  async estimateSearchCost(criteria = {}) {
    const requested = Math.max(1, Number(criteria.numberOfProspects || 1));
    return {
      provider: this.providerCode,
      requestedRecords: requested,
      estimatedProviderCredits: requested,
      estimatedCrescoCredits: requested,
      maximumEstimatedCharge: requested,
      notes: ["Apollo live calls are disabled until credentials and terms are approved."],
    };
  }

  async searchCompanies() {
    throw new ProspectingProviderError("Apollo live search is not enabled in Phase 3 staging.", { code: "LIVE_PROVIDER_DISABLED" });
  }

  normalizeResult() {
    throw new ProspectingProviderError("Apollo normalization awaits a captured staging sample.", { code: "NOT_CONFIGURED" });
  }

  async healthCheck() {
    return { status: this.credentials?.apiKey ? "degraded" : "unknown", message: "Apollo adapter present; live calls disabled." };
  }
}

module.exports = ApolloProvider;
