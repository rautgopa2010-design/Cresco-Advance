const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingEntitlement = sequelize.define(
    "prospectingEntitlement",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      providerOrgId: { type: DataTypes.INTEGER, allowNull: false },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      planId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      status: {
        type: DataTypes.ENUM("trial", "active", "expired", "suspended"),
        allowNull: false,
        defaultValue: "trial",
      },
      startsAt: { type: DataTypes.DATE, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: true },
      researchLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      verifiedProspectLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      providerCreditLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      aiTokenLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      extraCreditPacks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      supportedProviders: { type: DataTypes.JSON, allowNull: true },
      allowOrgOwnedProviderAccounts: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      suspendedReason: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_entitlements`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id"] }],
    }
  );

  ProspectingEntitlement.associate = (models) => {
    ProspectingEntitlement.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
      constraints: false,
    });
    ProspectingEntitlement.belongsTo(models.prospectingPlan, {
      foreignKey: "planId",
      as: "plan",
      constraints: false,
    });
  };

  return ProspectingEntitlement;
};
