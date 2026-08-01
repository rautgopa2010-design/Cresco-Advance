const { BaseProspectProvider, ProspectingProviderError } = require("./BaseProspectProvider");

class MockProspectProvider extends BaseProspectProvider {
  constructor(options = {}) {
    super({ ...options, providerCode: options.providerCode || "phase3-mock-provider" });
  }

  async validateConnection() {
    if (this.credentials?.forceInvalid) {
      throw new ProspectingProviderError("Mock provider credentials are marked invalid.", { code: "INVALID_CREDENTIALS" });
    }
    return { ok: true, providerCode: this.providerCode, accountType: this.accountType };
  }

  async estimateSearchCost(criteria = {}) {
    const requested = Math.max(1, Math.min(Number(criteria.numberOfProspects || criteria.limit || 3), 50));
    return {
      provider: this.providerCode,
      requestedRecords: requested,
      estimatedProviderCredits: requested,
      estimatedCrescoCredits: requested,
      maximumEstimatedCharge: requested,
      notes: ["Mock/Test Provider only. No live provider will be called."],
    };
  }

  async searchCompanies(criteria = {}) {
    const count = Math.max(1, Math.min(Number(criteria.numberOfProspects || 3), 50));
    return Array.from({ length: count }, (_, index) => ({
      externalId: `mock-company-${index + 1}`,
      name: `TEST DATA - ${criteria.industry || "CRM"} Company ${index + 1}`,
      website: `https://phase3-company-${index + 1}.example.invalid`,
      industry: criteria.industry || "CRM Services",
      location: criteria.targetLocation || "India",
      rawProviderPayload: { provider: this.providerCode, index: index + 1 },
    }));
  }

  async searchPeople(criteria = {}, companies = []) {
    const roles = Array.isArray(criteria.jobRoles) && criteria.jobRoles.length ? criteria.jobRoles : ["Founder", "Sales Head", "Operations Head"];
    return companies.map((company, index) => ({
      externalId: `mock-person-${index + 1}`,
      companyExternalId: company.externalId,
      name: `TEST DATA - ${roles[index % roles.length]} ${index + 1}`,
      title: roles[index % roles.length],
      seniority: criteria.seniority || "Senior",
      email: `phase3.${Date.now()}.${index + 1}@example.invalid`,
      phone: `91${String(Date.now()).slice(-7)}${index}`.slice(0, 10),
      rawProviderPayload: { provider: this.providerCode, index: index + 1 },
    }));
  }

  async enrichCompany(company = {}) {
    return {
      ...company,
      revenueRange: "TEST DATA - Not verified",
      technologies: ["CRM", "HRMS"],
      buyingSignals: ["TEST DATA - evaluating sales operations tooling"],
    };
  }

  async enrichPerson(person = {}) {
    return {
      ...person,
      verified: true,
      verificationSource: "TEST DATA - mock verification",
    };
  }

  async retrieveIntentSignals(criteria = {}) {
    return [{ type: "intent", value: `TEST DATA - ${criteria.keywords || "CRM"} research signal`, confidence: 78 }];
  }

  async retrieveHiringSignals(criteria = {}) {
    return criteria.hiringSignals
      ? [{ type: "hiring", value: `TEST DATA - ${criteria.hiringSignals}`, confidence: 72 }]
      : [];
  }

  normalizeResult({ company = {}, person = {}, criteria = {}, evidence = [] }) {
    const score = Math.max(Number(criteria.minimumScore || 70), 70);
    return {
      companyName: company.name,
      contactName: person.name,
      designation: person.title,
      email: person.email,
      mobile: person.phone,
      website: company.website,
      industry: company.industry,
      sourceProvider: this.providerCode,
      verificationStatus: person.verified ? "verified" : "unverified",
      score,
      scoreBreakdown: {
        icpFit: 28,
        contactability: 24,
        intent: evidence.some((item) => item.type === "intent") ? 18 : 12,
        hiring: evidence.some((item) => item.type === "hiring") ? 10 : 4,
        freshness: 10,
      },
      evidenceSummary: `TEST DATA - Normalized by ${this.providerCode}; no live provider response leaked outside adapter.`,
      evidence,
    };
  }

  async getUsage() {
    return { providerCreditsUsed: 0, rateLimitRemaining: 1000 };
  }

  async healthCheck() {
    return { status: "healthy", message: "Mock/Test Provider is available." };
  }
}

module.exports = MockProspectProvider;
