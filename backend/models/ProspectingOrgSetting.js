const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingOrgSetting = sequelize.define(
    "prospectingOrgSetting",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      idealCustomerProfile: { type: DataTypes.JSON, allowNull: true },
      selectedProviders: { type: DataTypes.JSON, allowNull: true },
      defaultReviewMode: {
        type: DataTypes.ENUM("manual", "assisted"),
        allowNull: false,
        defaultValue: "manual",
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_org_settings`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id"] }],
    }
  );

  return ProspectingOrgSetting;
};
