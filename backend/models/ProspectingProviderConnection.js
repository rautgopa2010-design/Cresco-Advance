const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingProviderConnection = sequelize.define(
    "prospectingProviderConnection",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      providerOrgId: { type: DataTypes.INTEGER, allowNull: false },
      org_id: { type: DataTypes.INTEGER, allowNull: true },
      providerCode: { type: DataTypes.STRING, allowNull: false },
      accountType: {
        type: DataTypes.ENUM("platform", "organization"),
        allowNull: false,
        defaultValue: "platform",
      },
      displayName: { type: DataTypes.STRING, allowNull: false },
      credentialStatus: {
        type: DataTypes.ENUM("not_configured", "configured", "disabled"),
        allowNull: false,
        defaultValue: "not_configured",
      },
      credentialRef: { type: DataTypes.STRING, allowNull: true },
      healthStatus: {
        type: DataTypes.ENUM("unknown", "healthy", "degraded", "down"),
        allowNull: false,
        defaultValue: "unknown",
      },
      isEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      lastHealthCheckAt: { type: DataTypes.DATE, allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_provider_connections`,
      timestamps: true,
    }
  );

  return ProspectingProviderConnection;
};
