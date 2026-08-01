const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotUsageLedger = sequelize.define(
    "chatbotUsageLedger",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      conversationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      entryType: { type: DataTypes.STRING, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      direction: {
        type: DataTypes.ENUM("debit", "credit"),
        allowNull: false,
        defaultValue: "debit",
      },
      lifecycle: {
        type: DataTypes.ENUM("reserved", "consumed", "released", "refunded"),
        allowNull: false,
        defaultValue: "consumed",
      },
      reason: { type: DataTypes.STRING, allowNull: true },
      idempotencyKey: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_usage_ledger`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["idempotencyKey"] }],
    }
  );

  return ChatbotUsageLedger;
};
