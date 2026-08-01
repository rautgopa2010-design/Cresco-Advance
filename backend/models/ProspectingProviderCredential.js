const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingProviderCredential = sequelize.define(
    "prospectingProviderCredential",
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
      encryptedPayload: { type: DataTypes.TEXT, allowNull: false },
      secretFingerprint: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("active", "disabled"),
        allowNull: false,
        defaultValue: "active",
      },
      lastValidatedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_provider_credentials`,
      timestamps: true,
      indexes: [
        {
          name: "prospect_cred_scope_uq",
          unique: true,
          fields: ["providerOrgId", "org_id", "providerCode", "accountType"],
        },
      ],
    }
  );

  return ProspectingProviderCredential;
};
