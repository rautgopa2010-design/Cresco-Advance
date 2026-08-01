const { BaseProspectProvider, ProspectingProviderError } = require("./BaseProspectProvider");

class ClayProvider extends BaseProspectProvider {
  constructor(options = {}) {
    super({ ...options, providerCode: "clay" });
  }

  async validateConnection() {
    throw new ProspectingProviderError("Clay credentials are not configured for Phase 3.", { code: "MISSING_CREDENTIALS" });
  }

  async estimateSearchCost(criteria = {}) {
    const requested = Math.max(1, Number(criteria.numberOfProspects || 1));
    return {
      provider: this.providerCode,
      requestedRecords: requested,
      estimatedProviderCredits: requested,
      estimatedCrescoCredits: requested,
      maximumEstimatedCharge: requested,
      notes: ["Clay adapter is scaffolded for future live integration."],
    };
  }

  normalizeResult() {
    throw new ProspectingProviderError("Clay normalization awaits a captured staging sample.", { code: "NOT_CONFIGURED" });
  }
}

module.exports = ClayProvider;
