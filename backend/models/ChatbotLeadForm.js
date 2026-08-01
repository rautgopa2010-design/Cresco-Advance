const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotLeadForm = sequelize.define(
    "chatbotLeadForm",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      fields: { type: DataTypes.JSON, allowNull: true },
      requireConsent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      consentText: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "I agree to share my details so the organization can contact me.",
      },
      duplicateCheckEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_lead_forms`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id"] }],
    }
  );

  return ChatbotLeadForm;
};
