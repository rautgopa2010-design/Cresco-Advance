const MockProspectProvider = require("./MockProspectProvider");

class PermittedPublicResearchProvider extends MockProspectProvider {
  constructor(options = {}) {
    super({ ...options, providerCode: "permitted-public-research" });
  }

  async validateConnection() {
    return { ok: true, providerCode: this.providerCode, message: "Uses permitted public evidence only; live scraping is not enabled." };
  }

  async healthCheck() {
    return { status: "healthy", message: "Permitted public research adapter is available in controlled mode." };
  }
}

module.exports = PermittedPublicResearchProvider;
