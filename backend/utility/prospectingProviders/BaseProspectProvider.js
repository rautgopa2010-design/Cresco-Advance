class ProspectingProviderError extends Error {
  constructor(message, { code = "PROVIDER_ERROR", retryAfterSeconds = null, details = null } = {}) {
    super(message);
    this.name = "ProspectingProviderError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.details = details;
  }
}

class BaseProspectProvider {
  constructor({ providerCode, credentials = null, accountType = "platform" } = {}) {
    this.providerCode = providerCode;
    this.credentials = credentials;
    this.accountType = accountType;
  }

  async validateConnection() {
    throw new ProspectingProviderError("validateConnection is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async estimateSearchCost() {
    throw new ProspectingProviderError("estimateSearchCost is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async searchCompanies() {
    throw new ProspectingProviderError("searchCompanies is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async searchPeople() {
    throw new ProspectingProviderError("searchPeople is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async enrichCompany() {
    throw new ProspectingProviderError("enrichCompany is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async enrichPerson() {
    throw new ProspectingProviderError("enrichPerson is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async retrieveIntentSignals() {
    return [];
  }

  async retrieveHiringSignals() {
    return [];
  }

  normalizeResult() {
    throw new ProspectingProviderError("normalizeResult is not implemented.", { code: "NOT_IMPLEMENTED" });
  }

  async getUsage() {
    return { providerCreditsUsed: 0, rateLimitRemaining: null };
  }

  async healthCheck() {
    return { status: "unknown", message: "Health check is not implemented." };
  }

  handleRateLimit(error) {
    if (error?.response?.status === 429) {
      throw new ProspectingProviderError("Provider rate limit reached.", {
        code: "RATE_LIMITED",
        retryAfterSeconds: Number(error.response.headers?.["retry-after"] || 60),
      });
    }
    throw error;
  }
}

module.exports = {
  BaseProspectProvider,
  ProspectingProviderError,
};
