const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingUsageLedger = sequelize.define(
    "prospectingUsageLedger",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      requestId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      entryType: {
        type: DataTypes.ENUM("research", "verified_prospect", "provider_credit", "ai_token", "extra_credit"),
        allowNull: false,
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      direction: {
        type: DataTypes.ENUM("debit", "credit"),
        allowNull: false,
        defaultValue: "debit",
      },
      lifecycle: {
        type: DataTypes.ENUM("estimated", "reserved", "consumed", "released", "refunded"),
        allowNull: false,
        defaultValue: "consumed",
      },
      reason: { type: DataTypes.STRING, allowNull: true },
      idempotencyKey: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_usage_ledger`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["idempotencyKey"] }],
    }
  );

  return ProspectingUsageLedger;
};
