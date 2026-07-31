const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingPlan = sequelize.define(
    "prospectingPlan",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      providerOrgId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      researchLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      verifiedProspectLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      providerCreditLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      aiTokenLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      supportedProviders: { type: DataTypes.JSON, allowNull: true },
      allowOrgOwnedProviderAccounts: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_plans`,
      timestamps: true,
    }
  );

  ProspectingPlan.associate = (models) => {
    ProspectingPlan.belongsTo(models.register, {
      foreignKey: "providerOrgId",
      as: "providerOrganization",
      constraints: false,
    });
    ProspectingPlan.hasMany(models.prospectingEntitlement, {
      foreignKey: "planId",
      as: "entitlements",
    });
  };

  return ProspectingPlan;
};
