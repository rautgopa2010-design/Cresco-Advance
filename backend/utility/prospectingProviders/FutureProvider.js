const { BaseProspectProvider, ProspectingProviderError } = require("./BaseProspectProvider");

class FutureProvider extends BaseProspectProvider {
  constructor(options = {}) {
    super({ ...options, providerCode: options.providerCode || "future-provider" });
  }

  async validateConnection() {
    throw new ProspectingProviderError("Future provider is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async estimateSearchCost(criteria = {}) {
    const requested = Math.max(1, Number(criteria.numberOfProspects || 1));
    return {
      provider: this.providerCode,
      requestedRecords: requested,
      estimatedProviderCredits: requested,
      estimatedCrescoCredits: requested,
      maximumEstimatedCharge: requested,
      notes: ["Future provider placeholder only."],
    };
  }
}

module.exports = FutureProvider;
